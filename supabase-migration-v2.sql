-- ================================================
-- Run AFTER supabase-setup.sql in Supabase SQL Editor
-- Adds: hero slides, site copy, collaborators, contact messages,
--       team tagline/bio, research multiple images, realtime
-- ================================================

-- Hero carousel (home page)
create table if not exists hero_slides (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- Editable site text (about, research intro, contact info)
create table if not exists site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz default now()
);

-- Collaborators (team page)
create table if not exists collaborators (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  title text not null default '',
  affiliation text not null default '',
  address text not null default '',
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- Contact form submissions
create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- Team: separate tagline vs full bio (fixes mismatch with main site)
alter table team add column if not exists tagline text;
alter table team add column if not exists bio text;

-- Research: additional images (card uses first; modal can show all)
alter table research add column if not exists image_urls text[];

-- RLS
alter table hero_slides enable row level security;
alter table site_settings enable row level security;
alter table collaborators enable row level security;
alter table contact_messages enable row level security;

-- Hero slides
drop policy if exists "Public read hero_slides" on hero_slides;
create policy "Public read hero_slides" on hero_slides for select using (true);
drop policy if exists "Auth insert hero_slides" on hero_slides;
create policy "Auth insert hero_slides" on hero_slides for insert with check (auth.role() = 'authenticated');
drop policy if exists "Auth update hero_slides" on hero_slides;
create policy "Auth update hero_slides" on hero_slides for update using (auth.role() = 'authenticated');
drop policy if exists "Auth delete hero_slides" on hero_slides;
create policy "Auth delete hero_slides" on hero_slides for delete using (auth.role() = 'authenticated');

-- Site settings
drop policy if exists "Public read site_settings" on site_settings;
create policy "Public read site_settings" on site_settings for select using (true);
drop policy if exists "Auth upsert site_settings" on site_settings;
create policy "Auth upsert site_settings" on site_settings for insert with check (auth.role() = 'authenticated');
drop policy if exists "Auth update site_settings" on site_settings;
create policy "Auth update site_settings" on site_settings for update using (auth.role() = 'authenticated');
drop policy if exists "Auth delete site_settings" on site_settings;
create policy "Auth delete site_settings" on site_settings for delete using (auth.role() = 'authenticated');

-- Collaborators
drop policy if exists "Public read collaborators" on collaborators;
create policy "Public read collaborators" on collaborators for select using (true);
drop policy if exists "Auth insert collaborators" on collaborators;
create policy "Auth insert collaborators" on collaborators for insert with check (auth.role() = 'authenticated');
drop policy if exists "Auth update collaborators" on collaborators;
create policy "Auth update collaborators" on collaborators for update using (auth.role() = 'authenticated');
drop policy if exists "Auth delete collaborators" on collaborators;
create policy "Auth delete collaborators" on collaborators for delete using (auth.role() = 'authenticated');

-- Contact: anyone can submit; only authenticated can read/update/delete
drop policy if exists "Public insert contact_messages" on contact_messages;
create policy "Public insert contact_messages" on contact_messages for insert with check (true);
drop policy if exists "Auth read contact_messages" on contact_messages;
create policy "Auth read contact_messages" on contact_messages for select using (auth.role() = 'authenticated');
drop policy if exists "Auth update contact_messages" on contact_messages;
create policy "Auth update contact_messages" on contact_messages for update using (auth.role() = 'authenticated');
drop policy if exists "Auth delete contact_messages" on contact_messages;
create policy "Auth delete contact_messages" on contact_messages for delete using (auth.role() = 'authenticated');

-- Realtime (ignore errors if already added)
alter publication supabase_realtime add table hero_slides;
alter publication supabase_realtime add table site_settings;
alter publication supabase_realtime add table collaborators;
alter publication supabase_realtime add table contact_messages;
