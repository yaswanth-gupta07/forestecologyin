-- ================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ================================================

-- 1. Create tables
create table if not exists gallery (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  created_at timestamptz default now()
);

create table if not exists research (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists team (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  description text,
  image_url text,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table gallery enable row level security;
alter table research enable row level security;
alter table team enable row level security;

-- 3. Public read access (so the website can fetch data)
create policy "Public read gallery" on gallery for select using (true);
create policy "Public read research" on research for select using (true);
create policy "Public read team" on team for select using (true);

-- 4. Authenticated write access (so admin can manage data)
create policy "Auth insert gallery" on gallery for insert with check (auth.role() = 'authenticated');
create policy "Auth update gallery" on gallery for update using (auth.role() = 'authenticated');
create policy "Auth delete gallery" on gallery for delete using (auth.role() = 'authenticated');

create policy "Auth insert research" on research for insert with check (auth.role() = 'authenticated');
create policy "Auth update research" on research for update using (auth.role() = 'authenticated');
create policy "Auth delete research" on research for delete using (auth.role() = 'authenticated');

create policy "Auth insert team" on team for insert with check (auth.role() = 'authenticated');
create policy "Auth update team" on team for update using (auth.role() = 'authenticated');
create policy "Auth delete team" on team for delete using (auth.role() = 'authenticated');

-- 5. Enable real-time updates
alter publication supabase_realtime add table gallery;
alter publication supabase_realtime add table research;
alter publication supabase_realtime add table team;

-- After the above works, run supabase-migration-v2.sql for hero slides, site copy,
-- collaborators, contact form storage, team tagline/bio, research multi-images, and extra realtime tables.
