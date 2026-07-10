-- Forged Customs — initial schema
-- Customers, Vehicles, and Service Notes with RLS locked to authenticated shop staff.
-- Apply via Supabase dashboard → SQL Editor, or `supabase db push` if using the CLI.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- Shared: updated_at auto-touch trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- customers
-- ============================================================
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  first_name    text not null,
  last_name     text not null,
  email         text,
  phone         text,
  source        text,          -- 'website' | 'referral' | 'walk-in' | 'social' | 'other'
  notes         text
);

create index if not exists customers_last_name_idx on public.customers (last_name);
create index if not exists customers_email_idx     on public.customers (lower(email));
create index if not exists customers_phone_idx     on public.customers (phone);
create index if not exists customers_updated_idx   on public.customers (updated_at);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ============================================================
-- vehicles
-- ============================================================
create table if not exists public.vehicles (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references public.customers (id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  year          int,
  make          text,
  model         text,
  trim          text,
  vin           text,
  license_plate text,
  color         text,
  notes         text
);

create index if not exists vehicles_customer_idx on public.vehicles (customer_id);
create index if not exists vehicles_vin_idx      on public.vehicles (vin);
create index if not exists vehicles_updated_idx  on public.vehicles (updated_at);

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- ============================================================
-- service_notes  (timeline entries per vehicle)
-- ============================================================
create table if not exists public.service_notes (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references public.vehicles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  occurred_on   date not null default current_date,
  category      text not null default 'note',  -- 'lighting' | 'paint' | 'coating' | 'note' | 'other'
  summary       text not null,
  detail        text,
  created_by    uuid references auth.users (id) on delete set null
);

create index if not exists service_notes_vehicle_idx  on public.service_notes (vehicle_id);
create index if not exists service_notes_occurred_idx on public.service_notes (occurred_on desc);
create index if not exists service_notes_updated_idx  on public.service_notes (updated_at);

drop trigger if exists service_notes_set_updated_at on public.service_notes;
create trigger service_notes_set_updated_at
  before update on public.service_notes
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row-Level Security
-- Phase 1 rule: any authenticated user (a shop staff member) can
-- read/write all rows. When we add multi-shop or role-based access,
-- these policies get scoped to a shop_members lookup.
-- ============================================================
alter table public.customers      enable row level security;
alter table public.vehicles       enable row level security;
alter table public.service_notes  enable row level security;

drop policy if exists "customers: staff read"   on public.customers;
drop policy if exists "customers: staff write"  on public.customers;
create policy "customers: staff read"
  on public.customers for select
  to authenticated using (true);
create policy "customers: staff write"
  on public.customers for all
  to authenticated using (true) with check (true);

drop policy if exists "vehicles: staff read"   on public.vehicles;
drop policy if exists "vehicles: staff write"  on public.vehicles;
create policy "vehicles: staff read"
  on public.vehicles for select
  to authenticated using (true);
create policy "vehicles: staff write"
  on public.vehicles for all
  to authenticated using (true) with check (true);

drop policy if exists "service_notes: staff read"   on public.service_notes;
drop policy if exists "service_notes: staff write"  on public.service_notes;
create policy "service_notes: staff read"
  on public.service_notes for select
  to authenticated using (true);
create policy "service_notes: staff write"
  on public.service_notes for all
  to authenticated using (true) with check (true);
