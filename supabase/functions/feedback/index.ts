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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // max 10 feedback per IP per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return false;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return true;
    }

    entry.count++;
    return false;
}

interface FeedbackRequest {
    type: string;
    message: string;
    page: string;
    timestamp: string;
}

Deno.serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    try {
        // Rate limiting by IP
        const clientIp = req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            "unknown";

        if (isRateLimited(clientIp)) {
            return new Response(
                JSON.stringify({ error: "Too many requests. Please try again later." }),
                { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const body: FeedbackRequest = await req.json();

        // Validate request
        if (!body.message || !body.type) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate type is one of the allowed values
        const allowedTypes = ["submit", "update", "report", "suggest", "love", "other"];
        if (!allowedTypes.includes(body.type)) {
            return new Response(
                JSON.stringify({ error: "Invalid feedback type" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate message length
        if (body.message.length > 2000) {
            return new Response(
                JSON.stringify({ error: "Message too long (max 2000 characters)" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch Telegram settings from database
        const { data: botTokenSetting } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "telegram_bot_token")
            .single();

        const { data: chatIdsSetting } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "telegram_chat_ids")
            .single();

        // Extract values with fallback to env vars
        let botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
        let chatIds: string[] = [];

        if (botTokenSetting?.value && typeof botTokenSetting.value === "string" && botTokenSetting.value.trim() !== "") {
            botToken = botTokenSetting.value;
        }

        if (chatIdsSetting?.value && Array.isArray(chatIdsSetting.value) && chatIdsSetting.value.length > 0) {
            chatIds = chatIdsSetting.value;
        } else {
            // Fallback to env var if available
            const envChatId = Deno.env.get("TELEGRAM_CHAT_ID");
            if (envChatId) {
                chatIds = [envChatId];
            }
        }

        // Check if Telegram is properly configured
        if (!botToken || chatIds.length === 0) {
            console.error("Telegram not configured: token or chat IDs missing");
            return new Response(
                JSON.stringify({ error: "Feedback service not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Format message with emoji
        const emojiMap: Record<string, string> = {
            submit: "➕",
            update: "❗",
            report: "❌",
            suggest: "💡",
            love: "❤️",
            other: "💬",
        };

        const emoji = emojiMap[body.type] || "💬";
        const typeLabel = body.type.charAt(0).toUpperCase() + body.type.slice(1);

        // Sanitize user input to prevent HTML injection in Telegram message
        const sanitize = (str: string) => str.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c));

        const telegramMessage = `
${emoji} <b>New Feedback - Miyomi</b>

<b>Type:</b> ${sanitize(typeLabel)}
<b>Page:</b> ${sanitize(body.page || "unknown")}
<b>Time:</b> ${new Date(body.timestamp).toLocaleString()}

<b>Message:</b>
${sanitize(body.message)}
    `.trim();

        // Send to all configured chat IDs in parallel
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const sendPromises = chatIds.map((chatId: string) =>
            fetch(telegramUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: telegramMessage,
                    parse_mode: "HTML",
                }),
            })
        );

        const results = await Promise.allSettled(sendPromises);

        // Check if all sends failed
        const allFailed = results.every((r) => r.status === "rejected");
        if (allFailed) {
            console.error("All Telegram sends failed");
            return new Response(
                JSON.stringify({ error: "Failed to send feedback" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Return success even if some sends failed
        return new Response(
            JSON.stringify({ success: true, message: "Feedback received" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Feedback error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
