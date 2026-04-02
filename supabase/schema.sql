-- ================================================================
-- Modo — Supabase schema
-- Run this in your Supabase project's SQL editor (once).
-- ================================================================

-- Profiles
create table if not exists profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null unique,
  name       text, age text, location text, build text,
  height     text, weight text, skin text, hair text, notes text,
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "users manage own profile"
  on profiles using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Wardrobe items
create table if not exists wardrobe_items (
  id          text primary key,
  user_id     uuid references auth.users not null,
  name        text not null,
  color       text,
  colorhex    text,
  brand       text,
  category    text,
  rating      numeric,
  photo       text,
  description text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);
alter table wardrobe_items enable row level security;
create policy "users manage own wardrobe"
  on wardrobe_items using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Style boards
create table if not exists style_boards (
  id          text primary key,
  user_id     uuid references auth.users not null,
  title       text not null,
  description text,
  tags        text[],
  images      text[],
  sort_order  int default 0,
  created_at  timestamptz default now()
);
alter table style_boards enable row level security;
create policy "users manage own boards"
  on style_boards using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Refine / shopping list
create table if not exists refine_list (
  id          text primary key default gen_random_uuid()::text,
  user_id     uuid references auth.users not null,
  item        text,
  category    text,
  brand       text,
  price_range text,
  why         text,
  pairs_with  text,
  search_url  text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);
alter table refine_list enable row level security;
create policy "users manage own refine list"
  on refine_list using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Saved looks
create table if not exists saved_looks (
  id         text primary key default gen_random_uuid()::text,
  user_id    uuid references auth.users not null,
  headline   text,
  note       text,
  rating     numeric,
  items      jsonb,
  upgrade    jsonb,
  created_at timestamptz default now()
);
alter table saved_looks enable row level security;
create policy "users manage own looks"
  on saved_looks using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ================================================================
-- Storage bucket
-- ================================================================
-- In Supabase dashboard → Storage:
--   1. Create a bucket named "photos"
--   2. Set it to PUBLIC (so photo URLs work as plain <img src> links)
--   3. Add this RLS policy so each user can only write to their own folder:

insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
  on conflict (id) do nothing;

create policy "authenticated users upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "authenticated users delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
