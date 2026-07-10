-- Forged Customs — phase-1 remainder
-- Adds quotes (incoming + staff-created) and follow_ups. Apply as one file
-- in the Supabase SQL editor.
-- (Configurator UI is a separate feature already implemented client-side by
-- the lighting-catalog admin — no DB tables here.)

-- ============================================================
-- quotes  (shop inbox: public /quote submissions + staff-created)
-- ============================================================
create table if not exists public.quotes (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz,
  source                  text not null default 'staff'
                            check (source in ('website','staff','phone','email','other')),
  status                  text not null default 'new'
                            check (status in ('new','contacted','quoted','converted','lost')),

  -- Optional links once matched to shop records:
  customer_id             uuid references public.customers (id) on delete set null,
  vehicle_id              uuid references public.vehicles (id) on delete set null,
  job_id                  uuid,  -- FK added below

  -- Raw contact from public submission (pre-match):
  lead_first_name         text,
  lead_last_name          text,
  lead_email              text,
  lead_phone              text,
  lead_city               text,

  -- Raw vehicle from public submission (pre-match):
  vehicle_year            text,
  vehicle_make            text,
  vehicle_model           text,
  vehicle_trim            text,

  services_interest       text[] not null default '{}',
  timeline                text,
  budget                  text,
  desired_look            text,
  current_issues          text,

  message                 text,
  staff_notes             text,
  estimated_total_cents   integer
);

create index if not exists quotes_status_idx     on public.quotes (status);
create index if not exists quotes_source_idx     on public.quotes (source);
create index if not exists quotes_customer_idx   on public.quotes (customer_id);
create index if not exists quotes_updated_idx    on public.quotes (updated_at desc);
create index if not exists quotes_created_idx    on public.quotes (created_at desc);

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- Wire the quotes -> jobs FK (was forward-referenced above).
alter table public.quotes
  drop constraint if exists quotes_job_id_fkey;
alter table public.quotes
  add constraint quotes_job_id_fkey
    foreign key (job_id) references public.jobs (id) on delete set null;

-- ============================================================
-- follow_ups  (post-delivery tasks, review requests, seasonal check-ins)
-- ============================================================
create table if not exists public.follow_ups (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz,
  title                   text not null,
  notes                   text,
  kind                    text not null default 'general'
                            check (kind in ('post_delivery','review_request','seasonal','general','other')),
  status                  text not null default 'pending'
                            check (status in ('pending','done','skipped')),
  due_on                  date,
  customer_id             uuid references public.customers (id) on delete set null,
  job_id                  uuid references public.jobs (id) on delete set null,
  completed_at            timestamptz,
  assigned_to             uuid references auth.users (id) on delete set null,
  created_by              uuid references auth.users (id) on delete set null
);

create index if not exists follow_ups_status_idx    on public.follow_ups (status);
create index if not exists follow_ups_due_idx       on public.follow_ups (due_on);
create index if not exists follow_ups_customer_idx  on public.follow_ups (customer_id);
create index if not exists follow_ups_job_idx       on public.follow_ups (job_id);
create index if not exists follow_ups_updated_idx   on public.follow_ups (updated_at desc);

drop trigger if exists follow_ups_set_updated_at on public.follow_ups;
create trigger follow_ups_set_updated_at
  before update on public.follow_ups
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row-Level Security
-- Same phase-1 rule: any authenticated user (shop staff) has full access.
-- ============================================================
alter table public.quotes                enable row level security;
alter table public.follow_ups            enable row level security;

drop policy if exists "quotes: staff read"  on public.quotes;
drop policy if exists "quotes: staff write" on public.quotes;
create policy "quotes: staff read"  on public.quotes for select to authenticated using (true);
create policy "quotes: staff write" on public.quotes for all    to authenticated using (true) with check (true);

drop policy if exists "follow_ups: staff read"  on public.follow_ups;
drop policy if exists "follow_ups: staff write" on public.follow_ups;
create policy "follow_ups: staff read"  on public.follow_ups for select to authenticated using (true);
create policy "follow_ups: staff write" on public.follow_ups for all    to authenticated using (true) with check (true);

-- Public /quote form uses SUPABASE_SERVICE_ROLE_KEY server-side, bypasses RLS.
-- No policy needed for anon inserts here.
