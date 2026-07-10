-- Forged Customs — inventory
-- Parts (SKUs), batches (for powders/paints), an immutable movement ledger,
-- and cycle-count sessions. Apply after 0003.

-- ============================================================
-- parts  (the SKU master)
-- ============================================================
create table if not exists public.parts (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,
  sku                 text not null,
  barcode             text,
  name                text not null,
  category            text not null default 'other'
                        check (category in (
                          'lighting','powder','paint','coating',
                          'fabrication','consumable','tool','other'
                        )),
  item_type           text not null default 'part'
                        check (item_type in ('part','consumable','tool','kit')),
  uom                 text not null default 'each',
  cost_cents          integer not null default 0,
  last_cost_cents     integer,
  price_cents         integer,
  on_hand             numeric(12,2) not null default 0,
  min_qty             numeric(12,2) not null default 0,
  par_qty             numeric(12,2),
  vendor              text,
  vendor_sku          text,
  lead_time_days      integer,
  location            text,
  notes               text,
  active              boolean not null default true
);

create unique index if not exists parts_sku_uidx     on public.parts (lower(sku)) where deleted_at is null;
create unique index if not exists parts_barcode_uidx on public.parts (barcode) where barcode is not null and deleted_at is null;
create index if not exists parts_category_idx on public.parts (category);
create index if not exists parts_type_idx     on public.parts (item_type);
create index if not exists parts_vendor_idx   on public.parts (vendor);
create index if not exists parts_updated_idx  on public.parts (updated_at desc);

drop trigger if exists parts_set_updated_at on public.parts;
create trigger parts_set_updated_at
  before update on public.parts
  for each row execute function public.set_updated_at();

-- ============================================================
-- part_batches  (batch/lot tracking — powders, paints, coatings)
-- ============================================================
create table if not exists public.part_batches (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,
  part_id             uuid not null references public.parts (id) on delete cascade,
  batch_number        text not null,
  received_on         date not null default current_date,
  unit_cost_cents     integer,
  quantity_received   numeric(12,2) not null,
  quantity_remaining  numeric(12,2) not null,
  expires_on          date,
  notes               text
);

create index if not exists part_batches_part_idx    on public.part_batches (part_id);
create index if not exists part_batches_expires_idx on public.part_batches (expires_on);
create index if not exists part_batches_updated_idx on public.part_batches (updated_at desc);

drop trigger if exists part_batches_set_updated_at on public.part_batches;
create trigger part_batches_set_updated_at
  before update on public.part_batches
  for each row execute function public.set_updated_at();

-- ============================================================
-- part_movements  (immutable ledger — every stock change ever)
-- Positive quantity = stock in.  Negative = stock out.
-- ============================================================
create table if not exists public.part_movements (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  occurred_at         timestamptz not null default now(),
  part_id             uuid not null references public.parts (id) on delete cascade,
  batch_id            uuid references public.part_batches (id) on delete set null,
  movement_type       text not null
                        check (movement_type in ('receive','use','adjust','count','return')),
  quantity            numeric(12,2) not null,
  unit_cost_cents     integer,
  job_id              uuid references public.jobs (id) on delete set null,
  reason              text,  -- 'cycle_count','damage','expired','lost','mispick', ...
  notes               text,
  performed_by        uuid references auth.users (id) on delete set null
);

create index if not exists part_movements_part_idx     on public.part_movements (part_id, occurred_at desc);
create index if not exists part_movements_type_idx     on public.part_movements (movement_type);
create index if not exists part_movements_job_idx      on public.part_movements (job_id);
create index if not exists part_movements_occurred_idx on public.part_movements (occurred_at desc);

-- No updated_at trigger — movements are immutable.

-- ============================================================
-- count_sessions + count_entries  (cycle counts)
-- ============================================================
create table if not exists public.count_sessions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  title         text not null,
  status        text not null default 'in_progress'
                  check (status in ('in_progress','committed','cancelled')),
  location      text,
  opened_by     uuid references auth.users (id) on delete set null,
  opened_at     timestamptz not null default now(),
  committed_at  timestamptz,
  notes         text
);

create index if not exists count_sessions_status_idx  on public.count_sessions (status);
create index if not exists count_sessions_updated_idx on public.count_sessions (updated_at desc);

drop trigger if exists count_sessions_set_updated_at on public.count_sessions;
create trigger count_sessions_set_updated_at
  before update on public.count_sessions
  for each row execute function public.set_updated_at();

create table if not exists public.count_entries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  session_id    uuid not null references public.count_sessions (id) on delete cascade,
  part_id       uuid not null references public.parts (id) on delete cascade,
  expected_qty  numeric(12,2) not null default 0,
  actual_qty    numeric(12,2) not null default 0,
  notes         text
);

create index if not exists count_entries_session_idx on public.count_entries (session_id);
create index if not exists count_entries_part_idx    on public.count_entries (part_id);
create index if not exists count_entries_updated_idx on public.count_entries (updated_at desc);

drop trigger if exists count_entries_set_updated_at on public.count_entries;
create trigger count_entries_set_updated_at
  before update on public.count_entries
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.parts            enable row level security;
alter table public.part_batches     enable row level security;
alter table public.part_movements   enable row level security;
alter table public.count_sessions   enable row level security;
alter table public.count_entries    enable row level security;

drop policy if exists "parts: staff read"  on public.parts;
drop policy if exists "parts: staff write" on public.parts;
create policy "parts: staff read"  on public.parts for select to authenticated using (true);
create policy "parts: staff write" on public.parts for all    to authenticated using (true) with check (true);

drop policy if exists "part_batches: staff read"  on public.part_batches;
drop policy if exists "part_batches: staff write" on public.part_batches;
create policy "part_batches: staff read"  on public.part_batches for select to authenticated using (true);
create policy "part_batches: staff write" on public.part_batches for all    to authenticated using (true) with check (true);

drop policy if exists "part_movements: staff read"   on public.part_movements;
drop policy if exists "part_movements: staff insert" on public.part_movements;
create policy "part_movements: staff read"
  on public.part_movements for select to authenticated using (true);
create policy "part_movements: staff insert"
  on public.part_movements for insert to authenticated with check (true);
-- Movements are immutable: no update/delete policy.

drop policy if exists "count_sessions: staff read"  on public.count_sessions;
drop policy if exists "count_sessions: staff write" on public.count_sessions;
create policy "count_sessions: staff read"  on public.count_sessions for select to authenticated using (true);
create policy "count_sessions: staff write" on public.count_sessions for all    to authenticated using (true) with check (true);

drop policy if exists "count_entries: staff read"  on public.count_entries;
drop policy if exists "count_entries: staff write" on public.count_entries;
create policy "count_entries: staff read"  on public.count_entries for select to authenticated using (true);
create policy "count_entries: staff write" on public.count_entries for all    to authenticated using (true) with check (true);
