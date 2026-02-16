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

## 🔐 Security Notes

- Never expose Supabase service role key
- Ensure RLS policies restrict write access properly
- Keep CAPTCHA enabled in production

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
