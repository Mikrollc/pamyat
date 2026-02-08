-- ============================================================
-- GRAVE CARE REGISTRY - INITIAL SCHEMA
-- ============================================================

-- 0. EXTENSIONS
create extension if not exists postgis;
create extension if not exists "uuid-ossp";

-- 1. PROFILES (extends Supabase auth.users)
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  phone         text,
  avatar_url    text,
  locale        text not null default 'ru' check (locale in ('ru', 'en')),
  push_orthodox boolean not null default true,
  push_us_holidays boolean not null default true,
  push_token    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

-- 2. CEMETERIES
create table public.cemeteries (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  name_ru     text,
  city        text,
  state       text,
  country     text not null default 'US',
  location    geography(Point, 4326),
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3. GRAVES (core entity)
create table public.graves (
  id              uuid primary key default uuid_generate_v4(),
  cemetery_id     uuid references public.cemeteries(id),
  location        geography(Point, 4326) not null,
  person_name     text not null,
  person_name_ru  text,
  birth_date      date,
  death_date      date,
  inscription     text,
  slug            text unique not null,
  is_public       boolean not null default true,
  cover_photo_path text,
  created_by      uuid not null references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- 4. GRAVE PHOTOS
create table public.grave_photos (
  id          uuid primary key default uuid_generate_v4(),
  grave_id    uuid not null references public.graves(id) on delete cascade,
  storage_path text not null,
  caption     text,
  sort_order  int not null default 0,
  uploaded_by uuid not null references public.profiles(id),
  created_at  timestamptz not null default now()
);

-- 5. GRAVE MEMBERS (ownership + family co-management)
create type public.grave_role as enum ('owner', 'editor', 'viewer');

create table public.grave_members (
  id          uuid primary key default uuid_generate_v4(),
  grave_id    uuid not null references public.graves(id) on delete cascade,
  user_id     uuid references public.profiles(id),
  role        public.grave_role not null default 'editor',
  created_at  timestamptz not null default now(),
  unique (grave_id, user_id)
);

-- 6. INVITATIONS
create type public.invite_status as enum ('pending', 'accepted', 'expired', 'revoked');
create type public.invite_channel as enum ('email', 'sms');

create table public.invitations (
  id              uuid primary key default uuid_generate_v4(),
  grave_id        uuid not null references public.graves(id) on delete cascade,
  invited_by      uuid not null references public.profiles(id),
  channel         public.invite_channel not null,
  recipient       text not null,
  role            public.grave_role not null default 'editor',
  token           text unique not null default encode(gen_random_bytes(24), 'hex'),
  status          public.invite_status not null default 'pending',
  accepted_by     uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '7 days')
);

-- 7. MAINTENANCE WAITLIST
create table public.maintenance_waitlist (
  id          uuid primary key default uuid_generate_v4(),
  grave_id    uuid not null references public.graves(id) on delete cascade,
  user_id     uuid references public.profiles(id),
  email       text,
  phone       text,
  note        text,
  created_at  timestamptz not null default now(),
  unique (grave_id, user_id)
);

-- 8. NOTIFICATION PREFERENCES
create table public.notification_preferences (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  grave_id        uuid references public.graves(id) on delete cascade,
  push_orthodox   boolean not null default true,
  push_us_holidays boolean not null default true,
  custom_dates    jsonb default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, grave_id)
);


-- ============================================================
-- INDEXES
-- ============================================================

create index idx_graves_location on public.graves using gist (location);
create index idx_cemeteries_location on public.cemeteries using gist (location);
create index idx_graves_slug on public.graves (slug) where deleted_at is null;
create index idx_grave_members_user on public.grave_members (user_id);
create index idx_graves_cemetery on public.graves (cemetery_id) where deleted_at is null;
create index idx_invitations_token on public.invitations (token) where status = 'pending';
create index idx_waitlist_grave on public.maintenance_waitlist (grave_id);
create index idx_graves_active on public.graves (created_by) where deleted_at is null;
create index idx_photos_grave on public.grave_photos (grave_id, sort_order);


-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.phone
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-add creator as owner in grave_members
create or replace function public.handle_new_grave()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.grave_members (grave_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_grave_created
  after insert on public.graves
  for each row execute function public.handle_new_grave();

-- Auto-update updated_at timestamp
create or replace function public.update_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_timestamp();

create trigger set_graves_updated_at
  before update on public.graves
  for each row execute function public.update_timestamp();

create trigger set_cemeteries_updated_at
  before update on public.cemeteries
  for each row execute function public.update_timestamp();

-- Slug generation helper
create or replace function public.generate_grave_slug(
  p_name text,
  p_birth_year int default null,
  p_death_year int default null
)
returns text
language plpgsql
as $$
declare
  base_slug text;
  final_slug text;
  suffix text;
begin
  base_slug := lower(regexp_replace(
    translate(p_name, ' ', '-'),
    '[^a-z0-9\-]', '', 'g'
  ));
  if p_birth_year is not null and p_death_year is not null then
    base_slug := base_slug || '-' || p_birth_year || '-' || p_death_year;
  end if;
  suffix := substr(encode(gen_random_bytes(4), 'hex'), 1, 6);
  final_slug := base_slug || '-' || suffix;
  return final_slug;
end;
$$;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.cemeteries enable row level security;
alter table public.graves enable row level security;
alter table public.grave_photos enable row level security;
alter table public.grave_members enable row level security;
alter table public.invitations enable row level security;
alter table public.maintenance_waitlist enable row level security;
alter table public.notification_preferences enable row level security;

-- PROFILES
create policy "Profiles: public read"
  on public.profiles for select
  using (deleted_at is null);

create policy "Profiles: self update"
  on public.profiles for update
  using (auth.uid() = id);

-- CEMETERIES
create policy "Cemeteries: public read"
  on public.cemeteries for select
  using (true);

create policy "Cemeteries: authenticated insert"
  on public.cemeteries for insert
  with check (auth.uid() = created_by);

-- GRAVES
create policy "Graves: public memorial read"
  on public.graves for select
  using (is_public = true and deleted_at is null);

create policy "Graves: member read"
  on public.graves for select
  using (
    deleted_at is null
    and exists (
      select 1 from public.grave_members
      where grave_members.grave_id = graves.id
        and grave_members.user_id = auth.uid()
    )
  );

create policy "Graves: authenticated insert"
  on public.graves for insert
  with check (auth.uid() = created_by);

create policy "Graves: member update"
  on public.graves for update
  using (
    exists (
      select 1 from public.grave_members
      where grave_members.grave_id = graves.id
        and grave_members.user_id = auth.uid()
        and grave_members.role in ('owner', 'editor')
    )
  );

-- GRAVE PHOTOS
create policy "Photos: public read"
  on public.grave_photos for select
  using (
    exists (
      select 1 from public.graves
      where graves.id = grave_photos.grave_id
        and graves.is_public = true
        and graves.deleted_at is null
    )
  );

create policy "Photos: member read"
  on public.grave_photos for select
  using (
    exists (
      select 1 from public.grave_members
      where grave_members.grave_id = grave_photos.grave_id
        and grave_members.user_id = auth.uid()
    )
  );

create policy "Photos: member insert"
  on public.grave_photos for insert
  with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from public.grave_members
      where grave_members.grave_id = grave_photos.grave_id
        and grave_members.user_id = auth.uid()
        and grave_members.role in ('owner', 'editor')
    )
  );

create policy "Photos: member delete"
  on public.grave_photos for delete
  using (
    exists (
      select 1 from public.grave_members
      where grave_members.grave_id = grave_photos.grave_id
        and grave_members.user_id = auth.uid()
        and grave_members.role in ('owner', 'editor')
    )
  );

-- GRAVE MEMBERS
create policy "Members: member read"
  on public.grave_members for select
  using (
    exists (
      select 1 from public.grave_members as my
      where my.grave_id = grave_members.grave_id
        and my.user_id = auth.uid()
    )
  );

create policy "Members: owner insert"
  on public.grave_members for insert
  with check (
    exists (
      select 1 from public.grave_members as my
      where my.grave_id = grave_members.grave_id
        and my.user_id = auth.uid()
        and my.role = 'owner'
    )
  );

create policy "Members: owner delete"
  on public.grave_members for delete
  using (
    exists (
      select 1 from public.grave_members as my
      where my.grave_id = grave_members.grave_id
        and my.user_id = auth.uid()
        and my.role = 'owner'
    )
  );

-- INVITATIONS
create policy "Invitations: inviter read"
  on public.invitations for select
  using (invited_by = auth.uid() or accepted_by = auth.uid());

create policy "Invitations: owner insert"
  on public.invitations for insert
  with check (
    auth.uid() = invited_by
    and exists (
      select 1 from public.grave_members
      where grave_members.grave_id = invitations.grave_id
        and grave_members.user_id = auth.uid()
        and grave_members.role = 'owner'
    )
  );

create policy "Invitations: accept update"
  on public.invitations for update
  using (status = 'pending' and expires_at > now());

-- MAINTENANCE WAITLIST
create policy "Waitlist: self read"
  on public.maintenance_waitlist for select
  using (user_id = auth.uid());

create policy "Waitlist: authenticated insert"
  on public.maintenance_waitlist for insert
  with check (auth.uid() = user_id or user_id is null);

-- NOTIFICATION PREFERENCES
create policy "Notifications: self read"
  on public.notification_preferences for select
  using (user_id = auth.uid());

create policy "Notifications: self insert"
  on public.notification_preferences for insert
  with check (user_id = auth.uid());

create policy "Notifications: self update"
  on public.notification_preferences for update
  using (user_id = auth.uid());

create policy "Notifications: self delete"
  on public.notification_preferences for delete
  using (user_id = auth.uid());


-- ============================================================
-- STORAGE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'grave-photos',
  'grave-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

create policy "Photos storage: public read"
  on storage.objects for select
  using (bucket_id = 'grave-photos');

create policy "Photos storage: member upload"
  on storage.objects for insert
  with check (
    bucket_id = 'grave-photos'
    and auth.uid() is not null
    and exists (
      select 1 from public.grave_members
      where grave_members.grave_id = (storage.foldername(name))[1]::uuid
        and grave_members.user_id = auth.uid()
        and grave_members.role in ('owner', 'editor')
    )
  );

create policy "Photos storage: member delete"
  on storage.objects for delete
  using (
    bucket_id = 'grave-photos'
    and exists (
      select 1 from public.grave_members
      where grave_members.grave_id = (storage.foldername(name))[1]::uuid
        and grave_members.user_id = auth.uid()
        and grave_members.role in ('owner', 'editor')
    )
  );
