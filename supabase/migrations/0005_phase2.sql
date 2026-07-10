-- Forged Customs — phase 2
-- follow_ups.email_sent_at column + purchase_orders + purchase_order_items
-- + messages + job_attachments. Apply after 0004.

-- ============================================================
-- follow_ups: add email_sent_at for the auto-email cron
-- ============================================================
alter table public.follow_ups add column if not exists email_sent_at timestamptz;
create index if not exists follow_ups_email_sent_idx on public.follow_ups (email_sent_at);

-- ============================================================
-- purchase_orders  (received-stock paper trail)
-- ============================================================
create table if not exists public.purchase_orders (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  po_number     text,  -- optional human ref
  vendor        text not null,
  status        text not null default 'draft'
                  check (status in ('draft','sent','partial_received','received','cancelled')),
  ordered_on    date,
  expected_on   date,
  received_on   date,
  notes         text,
  created_by    uuid references auth.users (id) on delete set null
);

create index if not exists purchase_orders_status_idx  on public.purchase_orders (status);
create index if not exists purchase_orders_vendor_idx  on public.purchase_orders (vendor);
create index if not exists purchase_orders_updated_idx on public.purchase_orders (updated_at desc);

drop trigger if exists purchase_orders_set_updated_at on public.purchase_orders;
create trigger purchase_orders_set_updated_at
  before update on public.purchase_orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- purchase_order_items
-- ============================================================
create table if not exists public.purchase_order_items (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  purchase_order_id     uuid not null references public.purchase_orders (id) on delete cascade,
  part_id               uuid references public.parts (id) on delete set null,
  label                 text not null,     -- snapshot of part name
  vendor_sku            text,
  quantity_ordered      numeric(12,2) not null default 0,
  quantity_received     numeric(12,2) not null default 0,
  unit_cost_cents       integer,
  notes                 text
);

create index if not exists purchase_order_items_po_idx      on public.purchase_order_items (purchase_order_id);
create index if not exists purchase_order_items_part_idx    on public.purchase_order_items (part_id);
create index if not exists purchase_order_items_updated_idx on public.purchase_order_items (updated_at desc);

drop trigger if exists purchase_order_items_set_updated_at on public.purchase_order_items;
create trigger purchase_order_items_set_updated_at
  before update on public.purchase_order_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- messages  (outbound comms: SMS + email)
-- ============================================================
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  customer_id   uuid references public.customers (id) on delete set null,
  job_id        uuid references public.jobs (id) on delete set null,
  channel       text not null check (channel in ('sms','email')),
  direction     text not null default 'out' check (direction in ('in','out')),
  to_address    text not null,  -- phone or email
  from_address  text,
  subject       text,           -- email only
  body          text not null,
  template      text,            -- 'ready_for_pickup' | 'quote_nudge' | 'appointment' | 'custom' | 'post_delivery'
  status        text not null default 'queued'
                  check (status in ('queued','sending','sent','failed')),
  provider_id   text,           -- provider message id (Twilio SID, Resend id)
  error         text,
  sent_at       timestamptz,
  sent_by       uuid references auth.users (id) on delete set null
);

create index if not exists messages_customer_idx on public.messages (customer_id);
create index if not exists messages_job_idx      on public.messages (job_id);
create index if not exists messages_status_idx   on public.messages (status);
create index if not exists messages_updated_idx  on public.messages (updated_at desc);

drop trigger if exists messages_set_updated_at on public.messages;
create trigger messages_set_updated_at
  before update on public.messages
  for each row execute function public.set_updated_at();

-- ============================================================
-- job_attachments  (photos, documents)
-- ============================================================
create table if not exists public.job_attachments (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  job_id        uuid not null references public.jobs (id) on delete cascade,
  storage_path  text not null,        -- key in Supabase Storage bucket
  filename      text not null,
  content_type  text,
  size_bytes    bigint,
  kind          text not null default 'photo'
                  check (kind in ('photo','document')),
  tag           text,                 -- 'before' | 'after' | 'reference' | null
  caption       text,
  uploaded_by   uuid references auth.users (id) on delete set null
);

create index if not exists job_attachments_job_idx     on public.job_attachments (job_id, created_at desc);
create index if not exists job_attachments_updated_idx on public.job_attachments (updated_at desc);

drop trigger if exists job_attachments_set_updated_at on public.job_attachments;
create trigger job_attachments_set_updated_at
  before update on public.job_attachments
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.purchase_orders       enable row level security;
alter table public.purchase_order_items  enable row level security;
alter table public.messages              enable row level security;
alter table public.job_attachments       enable row level security;

drop policy if exists "purchase_orders: staff read"  on public.purchase_orders;
drop policy if exists "purchase_orders: staff write" on public.purchase_orders;
create policy "purchase_orders: staff read"  on public.purchase_orders for select to authenticated using (true);
create policy "purchase_orders: staff write" on public.purchase_orders for all    to authenticated using (true) with check (true);

drop policy if exists "purchase_order_items: staff read"  on public.purchase_order_items;
drop policy if exists "purchase_order_items: staff write" on public.purchase_order_items;
create policy "purchase_order_items: staff read"  on public.purchase_order_items for select to authenticated using (true);
create policy "purchase_order_items: staff write" on public.purchase_order_items for all    to authenticated using (true) with check (true);

drop policy if exists "messages: staff read"  on public.messages;
drop policy if exists "messages: staff write" on public.messages;
create policy "messages: staff read"  on public.messages for select to authenticated using (true);
create policy "messages: staff write" on public.messages for all    to authenticated using (true) with check (true);

drop policy if exists "job_attachments: staff read"  on public.job_attachments;
drop policy if exists "job_attachments: staff write" on public.job_attachments;
create policy "job_attachments: staff read"  on public.job_attachments for select to authenticated using (true);
create policy "job_attachments: staff write" on public.job_attachments for all    to authenticated using (true) with check (true);

-- ============================================================
-- Storage bucket setup for job attachments
-- (Also create via dashboard if this doesn't run — dashboard is the safest.)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('job-attachments', 'job-attachments', false)
on conflict (id) do nothing;

-- Bucket RLS: only authenticated staff can read/write files.
drop policy if exists "job-attachments: staff select" on storage.objects;
drop policy if exists "job-attachments: staff insert" on storage.objects;
drop policy if exists "job-attachments: staff update" on storage.objects;
drop policy if exists "job-attachments: staff delete" on storage.objects;

create policy "job-attachments: staff select"
  on storage.objects for select to authenticated
  using (bucket_id = 'job-attachments');
create policy "job-attachments: staff insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'job-attachments');
create policy "job-attachments: staff update"
  on storage.objects for update to authenticated
  using (bucket_id = 'job-attachments');
create policy "job-attachments: staff delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'job-attachments');
