-- Forged Customs — jobs
-- Kanban lanes: new -> scheduled -> in_shop -> ready -> delivered (+ cancelled).
-- The 'stage' field carries in-shop sub-state (paint, coat, qc, other).

create table if not exists public.jobs (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  customer_id    uuid references public.customers (id) on delete set null,
  vehicle_id     uuid references public.vehicles (id) on delete set null,
  title          text not null,
  summary        text,
  status         text not null default 'new'
                   check (status in ('new','scheduled','in_shop','ready','delivered','cancelled')),
  stage          text
                   check (stage is null or stage in ('paint','coat','qc','other')),
  scheduled_for  date,
  created_by     uuid references auth.users (id) on delete set null
);

create index if not exists jobs_status_idx     on public.jobs (status);
create index if not exists jobs_customer_idx   on public.jobs (customer_id);
create index if not exists jobs_vehicle_idx    on public.jobs (vehicle_id);
create index if not exists jobs_updated_idx    on public.jobs (updated_at);
create index if not exists jobs_scheduled_idx  on public.jobs (scheduled_for);

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

alter table public.jobs enable row level security;

drop policy if exists "jobs: staff read"  on public.jobs;
drop policy if exists "jobs: staff write" on public.jobs;
create policy "jobs: staff read"
  on public.jobs for select
  to authenticated using (true);
create policy "jobs: staff write"
  on public.jobs for all
  to authenticated using (true) with check (true);
