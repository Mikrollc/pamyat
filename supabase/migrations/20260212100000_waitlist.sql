create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Allow anonymous inserts only (no read/update/delete)
create policy "Anyone can join waitlist"
  on public.waitlist for insert
  to anon
  with check (true);
