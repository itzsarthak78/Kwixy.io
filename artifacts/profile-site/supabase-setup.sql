-- ============================================================
-- Personal Profile Website — Supabase Setup
-- Run this in your Supabase SQL Editor to create all tables,
-- storage buckets, RLS policies, and seed the profile row.
-- ============================================================

-- 1. TABLES

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

-- 2. SEED — one profile row (singleton pattern)
insert into profiles (name, bio, about)
values ('Your Name', 'Your short bio here.', 'About section text goes here.')
on conflict do nothing;

-- 3. ROW LEVEL SECURITY

alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table messages enable row level security;

-- profiles: public read, admin write
create policy "Public can read profile" on profiles for select using (true);
create policy "Admin can update profile" on profiles for update using (auth.role() = 'authenticated');

-- posts: public read, admin all
create policy "Public can read posts" on posts for select using (true);
create policy "Admin can insert posts" on posts for insert with check (auth.role() = 'authenticated');
create policy "Admin can update posts" on posts for update using (auth.role() = 'authenticated');
create policy "Admin can delete posts" on posts for delete using (auth.role() = 'authenticated');

-- comments: public read+insert, admin delete
create policy "Public can read comments" on comments for select using (true);
create policy "Public can insert comments" on comments for insert with check (true);
create policy "Admin can delete comments" on comments for delete using (auth.role() = 'authenticated');

-- messages: admin only read+delete, public insert
create policy "Public can insert messages" on messages for insert with check (true);
create policy "Admin can read messages" on messages for select using (auth.role() = 'authenticated');
create policy "Admin can delete messages" on messages for delete using (auth.role() = 'authenticated');

-- 4. STORAGE BUCKETS
-- Run these in Dashboard > Storage > New Bucket (or via SQL)
insert into storage.buckets (id, name, public) values ('profile', 'profile', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('banner', 'banner', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('posts', 'posts', true) on conflict do nothing;

-- Storage policies: public read, authenticated write
-- Uses auth.uid() IS NOT NULL (more reliable than auth.role() = 'authenticated')
create policy "Public read profile bucket" on storage.objects for select using (bucket_id = 'profile');
create policy "Admin upload profile bucket" on storage.objects for insert with check (bucket_id = 'profile' and auth.uid() is not null);
create policy "Admin update profile bucket" on storage.objects for update using (bucket_id = 'profile' and auth.uid() is not null);
create policy "Admin delete profile bucket" on storage.objects for delete using (bucket_id = 'profile' and auth.uid() is not null);

create policy "Public read banner bucket" on storage.objects for select using (bucket_id = 'banner');
create policy "Admin upload banner bucket" on storage.objects for insert with check (bucket_id = 'banner' and auth.uid() is not null);
create policy "Admin update banner bucket" on storage.objects for update using (bucket_id = 'banner' and auth.uid() is not null);
create policy "Admin delete banner bucket" on storage.objects for delete using (bucket_id = 'banner' and auth.uid() is not null);

create policy "Public read posts bucket" on storage.objects for select using (bucket_id = 'posts');
create policy "Admin upload posts bucket" on storage.objects for insert with check (bucket_id = 'posts' and auth.uid() is not null);
create policy "Admin update posts bucket" on storage.objects for update using (bucket_id = 'posts' and auth.uid() is not null);
create policy "Admin delete posts bucket" on storage.objects for delete using (bucket_id = 'posts' and auth.uid() is not null);
