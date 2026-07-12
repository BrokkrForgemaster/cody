-- Forged Customs — Invoices
-- Invoices with line items, Kentucky 6% sales tax, and optional shop fees.
-- Apply after 0006.

-- ============================================================
-- invoices
-- ============================================================
create table if not exists public.invoices (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,

  invoice_number      text not null,                -- e.g. INV-2026-001

  -- optional links to shop records
  customer_id         uuid references public.customers (id) on delete set null,
  vehicle_id          uuid references public.vehicles  (id) on delete set null,
  job_id              uuid references public.jobs       (id) on delete set null,

  status              text not null default 'draft'
                        check (status in ('draft','sent','paid','void')),

  issue_date          date not null default current_date,
  due_date            date,

  -- computed amounts (all in cents, stored for querying)
  subtotal_cents      integer not null default 0,
  shop_fee_label      text    not null default 'Shop Supplies Fee',
  shop_fee_cents      integer not null default 0,
  shop_fee_taxable    boolean not null default true,
  tax_rate_bps        integer not null default 600,  -- 600 = 6.00% (KY)
  tax_cents           integer not null default 0,
  total_cents         integer not null default 0,

  -- notes
  notes               text,   -- customer-visible footer note
  internal_notes      text,   -- staff only

  paid_on             date,
  created_by          uuid references auth.users (id) on delete set null
);

create unique index if not exists invoices_number_uidx
  on public.invoices (invoice_number)
  where deleted_at is null;

create index if not exists invoices_customer_idx on public.invoices (customer_id);
create index if not exists invoices_status_idx   on public.invoices (status);
create index if not exists invoices_issue_idx    on public.invoices (issue_date desc);
create index if not exists invoices_updated_idx  on public.invoices (updated_at desc);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- ============================================================
-- invoice_line_items
-- ============================================================
create table if not exists public.invoice_line_items (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  invoice_id          uuid not null references public.invoices (id) on delete cascade,
  sort_order          integer not null default 0,
  description         text not null,
  quantity            numeric(10,2) not null default 1,
  unit_price_cents    integer not null default 0,
  amount_cents        integer not null default 0,  -- = round(quantity * unit_price_cents)
  taxable             boolean not null default true
);

create index if not exists invoice_line_items_invoice_idx
  on public.invoice_line_items (invoice_id, sort_order);

drop trigger if exists invoice_line_items_set_updated_at on public.invoice_line_items;
create trigger invoice_line_items_set_updated_at
  before update on public.invoice_line_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS — staff read/write, same pattern as other tables
-- ============================================================
alter table public.invoices           enable row level security;
alter table public.invoice_line_items enable row level security;

drop policy if exists "invoices: staff read"  on public.invoices;
drop policy if exists "invoices: staff write" on public.invoices;
create policy "invoices: staff read"
  on public.invoices for select to authenticated using (true);
create policy "invoices: staff write"
  on public.invoices for all to authenticated using (true) with check (true);

drop policy if exists "invoice_line_items: staff read"  on public.invoice_line_items;
drop policy if exists "invoice_line_items: staff write" on public.invoice_line_items;
create policy "invoice_line_items: staff read"
  on public.invoice_line_items for select to authenticated using (true);
create policy "invoice_line_items: staff write"
  on public.invoice_line_items for all to authenticated using (true) with check (true);
