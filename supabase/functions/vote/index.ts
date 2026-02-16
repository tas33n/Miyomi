import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGINS = [
  "https://miyomi.pages.dev",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");
  const itemType = url.searchParams.get("itemType") || "app";
  const fingerprint = url.searchParams.get("fingerprint");

  try {
    if (req.method === "GET") {
      // Get all vote counts + user's votes
      if (!itemId) {
        const { data: counts } = await supabase
          .from("likes")
          .select("item_id, item_type");

        // Count votes per item
        const countMap: Record<string, number> = {};
        for (const v of counts || []) {
          countMap[v.item_id] = (countMap[v.item_id] || 0) + 1;
        }

        // Check user's votes
        let userVotes: string[] = [];
        if (fingerprint) {
          const { data: uv } = await supabase
            .from("likes")
            .select("item_id")
            .eq("device_fingerprint", fingerprint);
          userVotes = (uv || []).map((v) => v.item_id);
        }

        const response: Record<string, { count: number; loved: boolean }> = {};
        for (const [id, count] of Object.entries(countMap)) {
          response[id] = { count, loved: userVotes.includes(id) };
        }
        for (const id of userVotes) {
          if (!response[id]) {
            response[id] = { count: 0, loved: true };
          }
        }

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Single item vote count
      const { count } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("item_id", itemId);

      let loved = false;
      if (fingerprint) {
        const { data } = await supabase
          .from("likes")
          .select("id")
          .eq("item_id", itemId)
          .eq("device_fingerprint", fingerprint)
          .limit(1);
        loved = (data?.length || 0) > 0;
      }

      return new Response(JSON.stringify({ count: count || 0, loved }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const postItemId = itemId || body.itemId;
      const postFingerprint = fingerprint || body.fingerprint;
      const postItemType = body.itemType || itemType;

      if (!postItemId || !postFingerprint) {
        return new Response(
          JSON.stringify({ error: "Missing itemId or fingerprint" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate fingerprint format (basic sanity check)
      if (typeof postFingerprint !== "string" || postFingerprint.length < 8 || postFingerprint.length > 128) {
        return new Response(
          JSON.stringify({ error: "Invalid fingerprint format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Rate limiting: max 30 votes per fingerprint per hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: recentVotes } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("device_fingerprint", postFingerprint)
        .gte("liked_at", oneHourAgo);

      if ((recentVotes || 0) >= 30) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Toggle vote: check if exists
      const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("item_id", postItemId)
        .eq("device_fingerprint", postFingerprint)
        .limit(1);

      if (existing && existing.length > 0) {
        // Remove like
        await supabase.from("likes").delete().eq("id", existing[0].id);
        return new Response(JSON.stringify({ loved: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        // Add like with device info
        const deviceInfo = body.deviceInfo || {};
        await supabase.from("likes").insert({
          item_id: postItemId,
          item_type: postItemType,
          device_fingerprint: postFingerprint,
          fingerprint_method: body.fingerprintMethod || "canvas",
          user_agent_hash: body.userAgentHash || null,
          ip_hash: null,
          anonymous_id: deviceInfo.anonymous_id || null,
          browser: deviceInfo.browser || null,
          browser_version: deviceInfo.browser_version || null,
          os: deviceInfo.os || null,
          os_version: deviceInfo.os_version || null,
          device_type: deviceInfo.device_type || null,
          device_vendor: deviceInfo.device_vendor || null,
          device_model: deviceInfo.device_model || null,
          user_agent: deviceInfo.user_agent || null,
          screen_resolution: deviceInfo.screen_resolution || null,
          timezone: deviceInfo.timezone || null,
          language: deviceInfo.language || null,
          referrer: deviceInfo.referrer || null,
        });
        return new Response(JSON.stringify({ loved: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error("Vote error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
