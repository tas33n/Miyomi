# Developer Notes — Miyomi v3

This document is meant to help contributors quickly understand how Miyomi v3 works and how they can work with it.

Miyomi is a community-run, open-source website that indexes Manga, Anime, and Light Novel apps, extensions, guides, and related resources.

It does not host content.  
It simply organizes and presents public tools in a structured way.

---

## 🌐 What the Website Currently Does

### Public Side

Users can:

- Browse Apps
- Browse Extensions
- Read Guides
- Search across content
- View FAQs
- Submit new Apps or Extensions through a form
- Like entries
- See notices or announcements

Everything is structured and searchable.

---

### Admin Side

Admins can:

- Log in securely
- Review and approve submissions
- Create / edit Apps
- Create / edit Extensions
- Manage Guides and FAQs
- Manage Notices (site announcements)
- Manage Themes
- View likes and activity
- View admin logs and sessions

There are two roles:
- admin
- super_admin

The first super admin can be created during initial setup.

---

## 🏗️ How v3 Works

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- React Router

### Backend
- Supabase (Database + Auth + Edge Functions)

Content is stored in the database instead of JSON files.

---

## 🔄 What Changed From v2

### v2 (Old Version)
- Data stored in JSON files inside the repo
- Contributions required Pull Requests
- No admin panel
- No authentication
- Static frontend only

### v3 (Current Version)
- Uses Supabase database
- Has admin panel
- Has submission form + moderation queue
- Supports roles and authentication
- Updates happen without redeploying
- CAPTCHA protection for submissions

In short:

v2 = Static index  
v3 = Managed, moderated index

---

## 📨 Submission Flow

1. User submits an App or Extension
2. Basic duplicate check happens
3. CAPTCHA validation
4. Stored in submissions table as "pending"
5. Admin reviews and publishes

This keeps spam and bad links out.

---

## 🗃️ Main Database Tables

Content:
- apps
- extensions
- guides
- faqs

Community:
- submissions
- likes

Admin:
- user_roles
- admin_logs
- admin_sessions

Operational:
- notices
- themes
- settings

---

## 🤝 How Developers Can Help

- Improve search
- Improve submission validation
- Improve moderation tools
- Improve UI consistency
- Improve performance
- Improve accessibility
- Add documentation
- Strengthen security (RLS policies, rate limiting)

Keep it simple and community-focused.

---

## 🚀 Project Setup & Deployment

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Cloudflare](https://cloudflare.com) account (for Turnstile CAPTCHA + Pages hosting)
- A Google Cloud project (for OAuth login)

---

### 1. Clone & Install

```bash
git clone https://github.com/tas33n/Miyomi.git
cd Miyomi
npm install
```

---

### 2. Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Choose a name, region, and generate a database password
3. Once active, go to **Settings → API** and note:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project Ref (ID)** → `VITE_SUPABASE_PROJECT_ID`
   - **anon / public key** → `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (never expose this client-side)

---

### 3. Run Database Migrations

Apply the schema from the consolidated migration file:

```bash
npx supabase db push
```

Or manually run `supabase/migrations/00000000000000_init.sql` in the Supabase SQL Editor.

This creates all tables, RLS policies, functions, and indexes.

---

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (Web Application type)
3. Add these authorized redirect URIs:
   - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
   - `http://localhost:8080/admin/dashboard` (for local dev)
4. Copy the **Client ID** and **Client Secret**
5. In Supabase Dashboard → **Authentication → Providers → Google**:
   - Enable Google provider
   - Paste the Client ID and Client Secret
   - Save

---

### 5. Configure Cloudflare Turnstile (CAPTCHA)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Turnstile → Add Site**
2. Add your domain(s) (include `localhost` for dev)
3. Copy the **Site Key** → `VITE_TURNSTILE_SITE_KEY`
4. Copy the **Secret Key** → `TURNSTILE_SECRET_KEY`

---

### 6. Set Up Environment Variables

Copy the example and fill it in:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_PROJECT_ID="your-project-ref"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_TURNSTILE_SITE_KEY="your-turnstile-site-key"
VITE_EMAIL_LOGIN_ENABLED=false

# Server-side only
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
TURNSTILE_SECRET_KEY="your-turnstile-secret"
CRON_API_KEY="any-random-secret-for-cron-jobs"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
```

---

### 7. Deploy Edge Functions

Miyomi uses several Supabase Edge Functions:

| Function | Purpose |
|---|---|
| `bootstrap-admin` | Initial super admin setup |
| `manage-admin` | Admin CRUD operations |
| `security-alert` | Unauthorized login detection → DB log + Telegram alert |
| `feedback` | User feedback → Telegram notifications |
| `submit-content` | Content submission handler |
| `seed-data` | Seed initial data |
| `list-apps` | Public app listing API |
| `update-app-meta` | App metadata updater |
| `vote` | Like/vote handler |

Deploy all functions:

```bash
npx supabase functions deploy
```

For edge functions that need secrets (Telegram bot token, etc.), set them in the Supabase Dashboard under **Edge Functions → Secrets**, or via CLI:

```bash
npx supabase secrets set TELEGRAM_BOT_TOKEN="your-token"
npx supabase secrets set TELEGRAM_CHAT_ID="your-chat-id"
```

---

### 8. Super Admin Setup (First-Time Only)

The first time you visit `/admin`, the system detects no super admin exists and enters **Setup Mode**:

1. Navigate to `http://localhost:8080/admin`
2. You'll see the "SETUP MODE" screen with an email/password form
3. Enter the email and password for the first super admin account
4. Click **CREATE SYSTEM**
5. This creates a Supabase Auth user and assigns the `super_admin` role

After setup, the email/password form is hidden (Google OAuth becomes the only login method by default).

---

### 9. Managing Admins

Once logged in as super admin:

1. Go to **Admin Panel → Settings** (or the admin management section)
2. You can invite new admins by email
3. Roles available:
   - `admin` — Can manage content, view submissions, moderate
   - `super_admin` — Full access including admin management, settings, and security logs

New admins must sign in with the same email via Google OAuth to access the panel.

---

### 10. Authentication & Security Settings

#### Email/Password Login Toggle

Email login is **disabled by default** (Google-only). To temporarily enable it:

```env
VITE_EMAIL_LOGIN_ENABLED=true
```

Restart the dev server after changing. For full backend protection, also toggle the Email provider in **Supabase Dashboard → Authentication → Providers**.

#### Unauthorized Access Detection

When a non-admin user attempts to log in:

1. Their session is immediately destroyed
2. Device fingerprint, IP, geolocation, and browser info are logged to `unauthorized_login_attempts`
3. A real-time Telegram alert is sent via the `security-alert` edge function
4. The user is redirected to an animated "ACCESS DENIED" page

To receive Telegram alerts, set these in Supabase **Settings** table (via admin panel or SQL):

```sql
INSERT INTO settings (key, value) VALUES ('telegram_bot_token', '"your-bot-token"');
INSERT INTO settings (key, value) VALUES ('telegram_chat_ids', '["chat-id-1", "chat-id-2"]');
```

---

### 11. Running Locally

```bash
npm run dev
```

Opens at `http://localhost:8080` by default.

---

### 12. Production Deployment

Miyomi is configured for **Cloudflare Pages**:

1. Connect your repo to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add all `VITE_*` environment variables in the Cloudflare Pages settings
5. Deploy

Alternatively, the `dist/` output works on any static hosting (Vercel, Netlify, etc.).

---

## 🔐 Security Notes

- Never expose Supabase service role key
- Ensure RLS policies restrict write access properly
- Keep CAPTCHA enabled in production
- Keep `VITE_EMAIL_LOGIN_ENABLED=false` unless email login is explicitly needed
- Review `unauthorized_login_attempts` table periodically for suspicious activity

---

## 💡 Future Ideas (Optional)

- Better search ranking
- Trending / popular system
- Translation support
- Improved duplicate detection
- Contributor recognition system

---

Miyomi is built by the community, for the community.

Keep changes clean, readable, and maintainable.
