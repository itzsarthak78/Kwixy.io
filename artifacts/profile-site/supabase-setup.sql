-- ============================================================
-- Personal Profile Website — Supabase Full Reset & Setup
-- Run this ONCE in Supabase SQL Editor.
-- Safe to re-run: drops old policies before recreating them.
-- ============================================================

-- ── 1. TABLES ───────────────────────────────────────────────

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Creator Name',
  bio text default '',
  about text default '',
  social_links jsonb default '[]'::jsonb,
  profile_picture_url text default '',
  banner_url text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- add any missing columns (safe on re-run)
alter table profiles add column if not exists about text default '';
alter table profiles add column if not exists social_links jsonb default '[]'::jsonb;
alter table profiles add column if not exists profile_picture_url text default '';
alter table profiles add column if not exists banner_url text default '';

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  caption text default '',
  media_url text not null,
  media_type text not null check (media_type in ('image','video')),
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  name text not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text default '',
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ── 2. SEED ─────────────────────────────────────────────────

insert into profiles (name, bio, about)
values ('Your Name', 'Your short bio here.', 'About section text goes here.')
on conflict do nothing;

-- Remove duplicate profile rows (keep only newest)
delete from profiles
where id not in (
  select id from profiles order by created_at desc limit 1
);

-- ── 3. ROW LEVEL SECURITY ───────────────────────────────────

alter table profiles  enable row level security;
alter table posts     enable row level security;
alter table comments  enable row level security;
alter table messages  enable row level security;

-- Drop old policies so re-runs don't error
do $$ begin
  drop policy if exists "Public can read profile"    on profiles;
  drop policy if exists "Admin can update profile"   on profiles;
  drop policy if exists "Admin can insert profile"   on profiles;
  drop policy if exists "Public can read posts"      on posts;
  drop policy if exists "Admin can insert posts"     on posts;
  drop policy if exists "Admin can update posts"     on posts;
  drop policy if exists "Admin can delete posts"     on posts;
  drop policy if exists "Public can read comments"   on comments;
  drop policy if exists "Public can insert comments" on comments;
  drop policy if exists "Admin can delete comments"  on comments;
  drop policy if exists "Public can insert messages" on messages;
  drop policy if exists "Admin can read messages"    on messages;
  drop policy if exists "Admin can delete messages"  on messages;
exception when others then null;
end $$;

-- profiles
create policy "Public can read profile"  on profiles for select using (true);
create policy "Admin can insert profile" on profiles for insert with check (auth.uid() is not null);
create policy "Admin can update profile" on profiles for update using (auth.uid() is not null);

-- posts
create policy "Public can read posts"   on posts for select using (true);
create policy "Admin can insert posts"  on posts for insert with check (auth.uid() is not null);
create policy "Admin can update posts"  on posts for update using (auth.uid() is not null);
create policy "Admin can delete posts"  on posts for delete using (auth.uid() is not null);

-- comments
create policy "Public can read comments"   on comments for select using (true);
create policy "Public can insert comments" on comments for insert with check (true);
create policy "Admin can delete comments"  on comments for delete using (auth.uid() is not null);

-- messages
create policy "Public can insert messages" on messages for insert with check (true);
create policy "Admin can read messages"    on messages for select using (auth.uid() is not null);
create policy "Admin can delete messages"  on messages for delete using (auth.uid() is not null);

-- ── 4. STORAGE — single "media" bucket ─────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true,
  52428800,   -- 50 MB limit
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update set public = true;

-- Drop old per-bucket policies (from previous setup)
do $$ begin
  drop policy if exists "Public read profile bucket"  on storage.objects;
  drop policy if exists "Admin upload profile bucket" on storage.objects;
  drop policy if exists "Admin update profile bucket" on storage.objects;
  drop policy if exists "Admin delete profile bucket" on storage.objects;
  drop policy if exists "Public read banner bucket"   on storage.objects;
  drop policy if exists "Admin upload banner bucket"  on storage.objects;
  drop policy if exists "Admin update banner bucket"  on storage.objects;
  drop policy if exists "Admin delete banner bucket"  on storage.objects;
  drop policy if exists "Public read posts bucket"    on storage.objects;
  drop policy if exists "Admin upload posts bucket"   on storage.objects;
  drop policy if exists "Admin update posts bucket"   on storage.objects;
  drop policy if exists "Admin delete posts bucket"   on storage.objects;
  drop policy if exists "Public read media bucket"    on storage.objects;
  drop policy if exists "Auth upload media bucket"    on storage.objects;
  drop policy if exists "Auth update media bucket"    on storage.objects;
  drop policy if exists "Auth delete media bucket"    on storage.objects;
exception when others then null;
end $$;

-- Clean storage policies for media bucket
create policy "Public read media bucket"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Auth upload media bucket"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.uid() is not null);

create policy "Auth update media bucket"
  on storage.objects for update
  using (bucket_id = 'media' and auth.uid() is not null);

create policy "Auth delete media bucket"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.uid() is not null);
