# Forest Ecology Site + Admin Dashboard

Production-ready website for a Forest Ecology lab with a real-time admin dashboard.

The public site is a content-rich research website (`/`, `/research`, `/gallery`, `/team`, `/contact`) and the admin panel (`/admin/*`) manages most content through Supabase + Cloudinary.

---

## 1) Tech Stack

- `Next.js 16` + `React 19`
- `Supabase` (Auth, Postgres, Realtime)
- `Cloudinary` (image uploads from admin forms)
- `Framer Motion` (animations)
- `Tailwind CSS v4`
- `react-hot-toast`, `react-icons`

---

## 2) Features

### Public Website
- Home hero carousel with fallback bundled images
- Research areas with modal gallery support
- Gallery wall with full-screen preview modal
- Team page (lab head + members) and collaborators section
- Contact page with form submission to database
- Live updates via Supabase realtime channels

### Admin Dashboard
- Secure login with Supabase email/password auth
- Protected dashboard layout and session checks
- Manage:
  - Hero slides + site copy (`/admin/home`)
  - Gallery items (`/admin/gallery`)
  - Research entries, including multi-image support (`/admin/research`)
  - Team members (`/admin/team`)
  - Collaborators (`/admin/collaborators`)
  - Contact form messages (`/admin/messages`)
- Live stat cards and recent activity on `/admin/dashboard`

---

## 3) Local Setup

### Prerequisites
- Node.js 18+
- npm
- Supabase project
- Cloudinary account (unsigned upload preset)

### Install
```bash
npm install
```

### Environment Variables
Create `.env.local` (or use existing `.env`) with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

### Run Development
```bash
npm run dev
```
Open `http://localhost:3000`.

### Production Commands
```bash
npm run build
npm run start:prod
```

> Note: `npm run start` currently runs `next dev --webpack`. Use `start:prod` for true production serving.

---

## 4) Database Setup (Supabase)

Run SQL files in order:

1. `supabase-setup.sql`
   - Creates base tables: `gallery`, `research`, `team`
   - Enables RLS and policies
   - Adds realtime publication for base tables

2. `supabase-migration-v2.sql`
   - Adds `hero_slides`, `site_settings`, `collaborators`, `contact_messages`
   - Extends `team` (`tagline`, `bio`)
   - Extends `research` (`image_urls[]`)
   - Adds policies and realtime for new tables

3. `supabase-migration-collaborators-fields.sql` (safe/idempotent)
   - Adds collaborator fields (`title`, `address`) if missing

Optional:
- `supabase-collaborators-seed.sql` for seed collaborator records

---

## 5) Authentication + Access Model

- Admin login uses `supabase.auth.signInWithPassword`.
- Protected pages are wrapped under `src/app/admin/(protected)/layout.jsx`.
- Session checks happen on mount and on auth state changes.
- Unauthenticated users are redirected to `/admin/login`.

RLS intent:
- Public (`anon`) can read site content tables.
- Public can insert into `contact_messages` (contact form).
- Authenticated users can create/update/delete admin-managed content.

---

## 6) Project Structure (Important Files)

```text
forest2-main/
  src/
    app/
      layout.jsx
      admin/
        layout.jsx
        login/page.jsx
        (protected)/
          layout.jsx
          dashboard/page.jsx
          home/page.jsx
          gallery/page.jsx
          research/page.jsx
          team/page.jsx
          collaborators/page.jsx
          messages/page.jsx
    pages/
      _app.js
      index.js
      research.js
      gallery.js
      team.js
      contact.js

  components/
    GovernmentHeader.js
    Navbar/Navbar.js
    Footer/Footer.js
    Hero/Hero.js
    Home/HomeAbout.jsx
    ResearchAreas/ResearchAreas.js
    Gallery/Gallery.js
    Team/Team.js
    admin/
      Sidebar.jsx
      AdminNavbar.jsx
      StatCard.jsx
      Modal.jsx
      ImageUpload.jsx
      MultiImageUpload.jsx

  lib/
    supabase.js
    cloudinary.js
    siteSettingKeys.js
    collaboratorsDefaults.js

  supabase-setup.sql
  supabase-migration-v2.sql
  supabase-migration-collaborators-fields.sql
  supabase-collaborators-seed.sql
```

---

## 7) End-to-End Data Flow

### A) Content Management Flow
1. Admin signs in at `/admin/login`.
2. Admin creates/updates content in dashboard forms.
3. Forms write to Supabase tables (`insert`, `update`, `delete`, `upsert`).
4. Public components subscribe to Supabase realtime channels.
5. Public pages reflect changes instantly (no redeploy needed).

### B) Image Upload Flow
1. Admin selects image in `ImageUpload` / `MultiImageUpload`.
2. File is uploaded to Cloudinary using `lib/cloudinary.js`.
3. Returned `secure_url` is stored in Supabase row.
4. Public and admin UIs render image URL, with placeholder fallback if load fails.

### C) Contact Message Flow
1. Visitor submits `/contact` form.
2. Form inserts row into `contact_messages`.
3. Admin `/admin/messages` receives live inserts and displays latest messages.
4. Messages are marked as read when loaded in admin messages view.

---

## 8) Public Routes

- `/`:
  - `Hero` loads from `hero_slides` or falls back to bundled local images.
  - `HomeAbout` reads `site_settings` keys for title/body.

- `/research`:
  - `ResearchAreas` combines hardcoded cards + DB cards from `research`.
  - Supports multiple images per research item through `image_urls`.
  - Intro text comes from `site_settings.research_intro`.

- `/gallery`:
  - `Gallery` combines hardcoded gallery images + DB `gallery` rows.
  - Includes modal preview and placeholder fallback handling.

- `/team`:
  - `Team` includes static lab head/team + DB team members.
  - Collaborators pulled from `collaborators`; falls back to `lib/collaboratorsDefaults.js` if empty.

- `/contact`:
  - Displays editable contact email/phone from `site_settings`.
  - Submits form data to `contact_messages`.

---

## 9) Admin Dashboard Routes (Detailed)

### `/admin/dashboard`
- Shows counts for:
  - Hero slides
  - Gallery images
  - Research posts
  - Team members
  - Collaborators
  - Contact messages + unread count
- Also lists:
  - Recent gallery uploads
  - Recent contact messages
- Live refresh via realtime subscriptions on content tables.

### `/admin/home`
- Manage hero carousel slides:
  - Add image URL/upload
  - Reorder slides (`sort_order`)
  - Delete slides
- Edit site text settings:
  - Home About title/body
  - Research intro
  - Contact email/phone
- Saves values into `site_settings` via `upsert`.

### `/admin/gallery`
- CRUD for `gallery` records (`title`, `image_url`).
- Uses Cloudinary uploader component for image URLs.

### `/admin/research`
- CRUD for `research` entries.
- Stores one primary image (`image_url`) + optional extra images (`image_urls[]`).
- Uses `MultiImageUpload`.

### `/admin/team`
- CRUD for `team` members:
  - `name`, `role`, `tagline`, `bio`, `image_url`
- Supports legacy compatibility for old `description`.

### `/admin/collaborators`
- CRUD for collaborator cards:
  - `name`, `title`, `affiliation`, `address`, `image_url`
  - auto `sort_order` on create

### `/admin/messages`
- Read messages from `contact_messages`
- Auto-mark unread messages as read
- Realtime notification on new inserts

---

## 10) Core Libraries

- `lib/supabase.js`
  - Creates client with public URL + anon key

- `lib/cloudinary.js`
  - Upload helper for unsigned image uploads
  - Throws explicit error when Cloudinary env vars are missing

- `lib/siteSettingKeys.js`
  - Defines editable site copy defaults + keys

- `lib/collaboratorsDefaults.js`
  - Public fallback collaborator list when DB is empty

---

## 11) Deployment

- CI/CD file: `.github/workflows/deploy.yml`
- Typical Vercel setup:
  1. Connect repository
  2. Add same environment variables in Vercel project settings
  3. Ensure Supabase RLS policies are already applied
  4. Deploy

---

## 12) Troubleshooting

- Images not uploading:
  - Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
  - Verify preset is unsigned and allowed for uploads

- Admin login fails:
  - Confirm admin user exists in Supabase Auth
  - Verify Supabase URL and anon key

- Public content not updating:
  - Verify realtime publication includes relevant table
  - Check RLS `select` policy for public reads

- Contact form insert fails:
  - Ensure `Public insert contact_messages` policy exists

---

## 13) Scripts

```json
{
  "dev": "next dev --webpack",
  "build": "next build",
  "start": "next dev --webpack",
  "start:prod": "next start",
  "lint": "eslint"
}
```

---

## 14) Future Improvements

- Add server-side admin APIs for stricter write control
- Add pagination/search on admin messages
- Add role-based admin authorization (not just authenticated users)
- Add image optimization pipeline and cleanup jobs for deleted media

