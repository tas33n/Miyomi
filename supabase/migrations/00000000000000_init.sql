-- ============================================
-- MIYOMI DATABASE SCHEMA (Consolidated)
-- ============================================
-- This is the single canonical migration for the entire Miyomi database.
-- It matches the current production schema exactly.

-- ============================================
-- 1. ENUMS
-- ============================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin');

-- ============================================
-- 2. CORE TABLES
-- ============================================

-- 2a. User Roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2b. Admins
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CONTENT TABLES
-- ============================================

-- 3a. Apps
CREATE TABLE public.apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    icon_url TEXT,
    icon_color TEXT,
    accent_color TEXT,
    category TEXT,
    platforms TEXT [] DEFAULT '{}',
    tags TEXT [] DEFAULT '{}',
    content_types TEXT [],
    supported_extensions TEXT [],
    repo_url TEXT,
    download_url TEXT,
    website_url TEXT,
    discord_url TEXT,
    upstream_url TEXT,
    fork_of TEXT,
    version TEXT,
    download_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    last_release_date DATE,
    author TEXT,
    tutorials JSONB,
    submitter_name TEXT,
    submitter_contact TEXT,
    submitter_email TEXT,
    status TEXT NOT NULL DEFAULT 'approved',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_apps_platforms ON public.apps USING GIN (platforms);

CREATE INDEX idx_apps_tags ON public.apps USING GIN (tags);

CREATE INDEX idx_apps_status ON public.apps (status);

CREATE INDEX idx_apps_category ON public.apps (category);

-- 3b. Extensions
CREATE TABLE public.extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    icon_url TEXT,
    icon_color TEXT,
    accent_color TEXT,
    language TEXT,
    category TEXT,
    region TEXT,
    types TEXT [],
    platforms TEXT [] DEFAULT '{}',
    tags TEXT [] DEFAULT '{}',
    compatible_with TEXT [] DEFAULT '{}',
    source_url TEXT,
    repo_url TEXT,
    website_url TEXT,
    auto_url TEXT,
    manual_url TEXT,
    info TEXT,
    last_updated DATE,
    author TEXT,
    download_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    submitter_name TEXT,
    submitter_contact TEXT,
    submitter_email TEXT,
    status TEXT NOT NULL DEFAULT 'approved',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.extensions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_extensions_tags ON public.extensions USING GIN (tags);

CREATE INDEX idx_extensions_compatible ON public.extensions USING GIN (compatible_with);

CREATE INDEX idx_extensions_status ON public.extensions (status);

-- 3c. Guides
CREATE TABLE public.guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    category TEXT,
    tags TEXT [] DEFAULT '{}',
    related_apps TEXT [] DEFAULT '{}',
    related_extensions TEXT [] DEFAULT '{}',
    author TEXT,
    status TEXT NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_guides_status ON public.guides (status);

CREATE INDEX idx_guides_slug ON public.guides (slug);

-- 3d. FAQs
CREATE TABLE public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    legacy_id TEXT UNIQUE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    tags TEXT [],
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. INTERACTION TABLES
-- ============================================

-- 4a. Likes (anonymous user likes with device fingerprinting)
CREATE TABLE public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL DEFAULT 'app',
    device_fingerprint TEXT NOT NULL,
    fingerprint_method TEXT DEFAULT 'canvas',
    liked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_hash TEXT,
    user_agent_hash TEXT,
    anonymous_id TEXT,
    ip_address TEXT,
    browser TEXT,
    browser_version TEXT,
    os TEXT,
    os_version TEXT,
    device_type TEXT,
    device_vendor TEXT,
    device_model TEXT,
    user_agent TEXT,
    screen_resolution TEXT,
    timezone TEXT,
    language TEXT,
    referrer TEXT,
    UNIQUE (item_id, device_fingerprint)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_likes_item_lookup ON public.likes (item_type, item_id);

CREATE INDEX idx_likes_liked_at ON public.likes (liked_at DESC);

CREATE INDEX idx_likes_anonymous_id ON public.likes (anonymous_id);

CREATE INDEX idx_likes_browser ON public.likes (browser);

CREATE INDEX idx_likes_os ON public.likes (os);

CREATE INDEX idx_likes_device_type ON public.likes (device_type);

-- 4b. Submissions
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    submission_type TEXT NOT NULL,
    submitted_data JSONB NOT NULL DEFAULT '{}',
    recaptcha_score REAL,
    submitter_email TEXT,
    submitter_name TEXT,
    submitter_contact TEXT,
    author TEXT,
    duplicate_check_results JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_submissions_status ON public.submissions (status);

-- ============================================
-- 5. ADMIN & SYSTEM TABLES
-- ============================================

-- 5a. Notices
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'info',
    active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    dismissible BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notices_active ON public.notices (active);

-- 5b. Themes
CREATE TABLE public.themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    is_seasonal BOOLEAN NOT NULL DEFAULT false,
    active_from TIMESTAMPTZ,
    active_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT false,
    css_variables JSONB DEFAULT '{}',
    assets JSONB DEFAULT '{}',
    particle_config JSONB DEFAULT '{}',
    preview_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT themes_slug_unique UNIQUE (slug)
);

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- 5c. Settings
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    category TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    updated_by UUID REFERENCES auth.users (id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 5d. Admin Logs
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    admin_id UUID REFERENCES public.admins (id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    resource_name TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX admin_logs_admin_id_idx ON public.admin_logs (admin_id);

CREATE INDEX admin_logs_created_at_idx ON public.admin_logs (created_at DESC);

CREATE INDEX admin_logs_resource_idx ON public.admin_logs (resource_type, resource_id);

-- 5e. Admin Sessions
CREATE TABLE public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    admin_id UUID REFERENCES public.admins (id) ON DELETE CASCADE NOT NULL,
    session_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    browser TEXT,
    browser_version TEXT,
    os TEXT,
    os_version TEXT,
    device_type TEXT,
    device_vendor TEXT,
    device_model TEXT,
    device_fingerprint TEXT,
    country TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX admin_sessions_admin_id_idx ON public.admin_sessions (admin_id);

CREATE INDEX admin_sessions_created_at_idx ON public.admin_sessions (created_at DESC);

CREATE INDEX admin_sessions_fingerprint_idx ON public.admin_sessions (device_fingerprint);

-- ============================================
-- 6. VIEWS
-- ============================================

CREATE VIEW public.user_likes_summary
WITH (security_invoker = on) AS
SELECT
    anonymous_id,
    count(*) AS total_likes,
    min(liked_at) AS first_like_date,
    max(liked_at) AS last_like_date,
    count(DISTINCT item_type) AS item_types_count,
    browser,
    os,
    device_type,
    count(DISTINCT ip_address) AS unique_ips
FROM public.likes
WHERE
    anonymous_id IS NOT NULL
GROUP BY
    anonymous_id,
    browser,
    os,
    device_type
ORDER BY count(*) DESC;

COMMENT ON TABLE public.likes IS 'Stores anonymous user likes for apps and extensions with device fingerprinting data';

-- ============================================
-- 7. FUNCTIONS
-- ============================================

-- 7a. Role check (SECURITY DEFINER — avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 7b. Admin check helper
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$$;

-- 7c. Check if system has a super admin
CREATE OR REPLACE FUNCTION public.system_has_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
  );
$$;

-- 7d. One-time super admin claim
CREATE OR REPLACE FUNCTION public.claim_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_initialized BOOLEAN;
  _user_email TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super_admin'
  ) INTO _is_initialized;

  IF _is_initialized THEN
    RETURN FALSE;
  END IF;

  SELECT email INTO _user_email FROM auth.users WHERE id = auth.uid();

  IF _user_email IS NULL THEN
    RAISE EXCEPTION 'User email not found';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'super_admin');

  INSERT INTO public.admins (user_id, email, display_name)
  VALUES (auth.uid(), _user_email, 'Super Admin')
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    updated_at = now();

  RETURN TRUE;
END;
$$;

-- 7e. Clear admin data (logs/sessions)
CREATE OR REPLACE FUNCTION public.clear_admin_data(target_table text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_super_admin boolean;
BEGIN
  v_user_id := auth.uid();

  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = v_user_id
    AND role = 'super_admin'
  ) INTO v_is_super_admin;

  IF NOT v_is_super_admin THEN
    RAISE EXCEPTION 'Access denied: Super Admin privileges required';
  END IF;

  IF target_table = 'logs' THEN
    DELETE FROM admin_logs WHERE true;
  ELSIF target_table = 'sessions' THEN
    DELETE FROM admin_sessions WHERE true;
  ELSE
    RAISE EXCEPTION 'Invalid target table';
  END IF;
END;
$$;

-- 7f. Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 7g. Likes count sync trigger function
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.item_type = 'app') THEN
            UPDATE apps SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id::text = NEW.item_id;
        ELSIF (NEW.item_type = 'extension') THEN
            UPDATE extensions SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id::text = NEW.item_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.item_type = 'app') THEN
            UPDATE apps SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id::text = OLD.item_id;
        ELSIF (OLD.item_type = 'extension') THEN
            UPDATE extensions SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id::text = OLD.item_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 8. TRIGGERS
-- ============================================

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON public.apps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_extensions_updated_at BEFORE UPDATE ON public.extensions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON public.themes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_vote_change
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- ============================================
-- 9. RLS POLICIES (Security-hardened)
-- ============================================

-- user_roles
CREATE POLICY "Authenticated users can read own roles" ON public.user_roles FOR
SELECT TO authenticated USING (
        user_id = (
            SELECT auth.uid ()
        )
    );

CREATE POLICY "Super admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (
    public.has_role (auth.uid (), 'super_admin')
)
WITH
    CHECK (
        public.has_role (auth.uid (), 'super_admin')
    );

-- admins
CREATE POLICY "Admins can read admin profiles" ON public.admins FOR
SELECT USING (public.is_admin (auth.uid ()));

CREATE POLICY "Super admins can manage admins" ON public.admins FOR ALL TO authenticated USING (
    public.has_role (auth.uid (), 'super_admin')
)
WITH
    CHECK (
        public.has_role (auth.uid (), 'super_admin')
    );

-- apps
CREATE POLICY "Public can read approved apps" ON public.apps FOR
SELECT USING (status = 'approved');

CREATE POLICY "Admins can manage apps" ON public.apps FOR ALL TO authenticated USING (public.is_admin (auth.uid ()))
WITH
    CHECK (public.is_admin (auth.uid ()));

-- extensions
CREATE POLICY "Public can read approved extensions" ON public.extensions FOR
SELECT USING (status = 'approved');

CREATE POLICY "Admins can manage extensions" ON public.extensions FOR ALL TO authenticated USING (public.is_admin (auth.uid ()))
WITH
    CHECK (public.is_admin (auth.uid ()));

-- guides
CREATE POLICY "Public can read approved guides" ON public.guides FOR
SELECT USING (
        status IN ('approved', 'published')
    );

CREATE POLICY "Admins can manage guides" ON public.guides FOR ALL TO authenticated USING (public.is_admin (auth.uid ()))
WITH
    CHECK (public.is_admin (auth.uid ()));

-- faqs
CREATE POLICY "Public can read FAQs" ON public.faqs FOR
SELECT USING (true);

CREATE POLICY "Admins can manage FAQs" ON public.faqs FOR ALL TO authenticated USING (public.is_admin (auth.uid ()))
WITH
    CHECK (public.is_admin (auth.uid ()));

-- likes
CREATE POLICY "Public can read vote counts" ON public.likes FOR
SELECT USING (true);

CREATE POLICY "Service can insert votes" ON public.likes FOR INSERT TO service_role
WITH
    CHECK (true);

CREATE POLICY "Admins can manage votes" ON public.likes FOR ALL TO authenticated USING (public.is_admin (auth.uid ()))
WITH
    CHECK (public.is_admin (auth.uid ()));

-- submissions
CREATE POLICY "Service can insert submissions" ON public.submissions FOR INSERT TO service_role
WITH
    CHECK (true);

CREATE POLICY "Admins can manage submissions" ON public.submissions FOR ALL TO authenticated USING (public.is_admin (auth.uid ()))
WITH
    CHECK (public.is_admin (auth.uid ()));

-- notices
CREATE POLICY "Public can read active notices" ON public.notices FOR
SELECT USING (
        active = true
        AND (
            start_date IS NULL
            OR start_date <= now()
        )
        AND (
            end_date IS NULL
            OR end_date >= now()
        )
    );

CREATE POLICY "Admins can manage notices" ON public.notices FOR ALL TO authenticated USING (public.is_admin (auth.uid ()))
WITH
    CHECK (public.is_admin (auth.uid ()));

-- themes
CREATE POLICY "Public can read all themes" ON public.themes FOR
SELECT USING (true);

CREATE POLICY "Admins can manage themes" ON public.themes FOR ALL TO authenticated USING (public.is_admin (auth.uid ()))
WITH
    CHECK (public.is_admin (auth.uid ()));

-- settings
CREATE POLICY "Public can read non-sensitive settings" ON public.settings FOR
SELECT USING (is_sensitive = false);

CREATE POLICY "Admins can read all settings" ON public.settings FOR
SELECT TO authenticated USING (public.is_admin (auth.uid ()));

CREATE POLICY "Super admins can manage settings" ON public.settings FOR ALL TO authenticated USING (
    public.has_role (auth.uid (), 'super_admin')
)
WITH
    CHECK (
        public.has_role (auth.uid (), 'super_admin')
    );

-- admin_logs
CREATE POLICY "Admins can view all logs" ON public.admin_logs FOR
SELECT USING (public.is_admin (auth.uid ()));

CREATE POLICY "System can insert logs" ON public.admin_logs FOR INSERT TO service_role
WITH
    CHECK (true);

-- admin_sessions
CREATE POLICY "Admin can view own sessions" ON public.admin_sessions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.admins
            WHERE
                admins.user_id = (
                    SELECT auth.uid ()
                )
                AND admins.id = admin_sessions.admin_id
        )
    );

CREATE POLICY "Superadmin can view all sessions" ON public.admin_sessions FOR
SELECT TO authenticated USING (
        public.has_role (auth.uid (), 'super_admin')
    );

CREATE POLICY "System can insert sessions" ON public.admin_sessions FOR INSERT TO service_role
WITH
    CHECK (true);

-- ============================================
-- 10. STORAGE
-- ============================================

INSERT INTO
    storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read media files" ON storage.objects FOR
SELECT USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media" ON storage.objects FOR INSERT
WITH
    CHECK (
        bucket_id = 'media'
        AND public.is_admin (auth.uid ())
    );

CREATE POLICY "Admins can update media" ON storage.objects
FOR UPDATE
    USING (
        bucket_id = 'media'
        AND public.is_admin (auth.uid ())
    );

CREATE POLICY "Admins can delete media" ON storage.objects FOR DELETE USING (
    bucket_id = 'media'
    AND public.is_admin (auth.uid ())
);

-- ============================================
-- 11. GRANTS
-- ============================================

GRANT EXECUTE ON FUNCTION public.system_has_super_admin() TO anon, authenticated;

GRANT
EXECUTE ON FUNCTION public.claim_super_admin () TO authenticated;

GRANT
EXECUTE ON FUNCTION public.clear_admin_data (text) TO authenticated;

-- ============================================
-- 12. SEED DATA
-- ============================================

INSERT INTO
    public.settings (key, value, is_sensitive)
VALUES (
        'telegram_bot_token',
        '""'::jsonb,
        true
    ),
    (
        'telegram_chat_ids',
        '[]'::jsonb,
        false
    )
ON CONFLICT (key) DO NOTHING;