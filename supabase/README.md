# Supabase — Forged Customs

Database schema and migration files for the shop ops app.

## Applying migrations

Two options — pick whichever you prefer.

### Option A: Supabase dashboard (no CLI)

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the contents of the latest `migrations/*.sql` file that hasn't been applied yet.
3. **Run**.
4. Verify in **Table Editor** that the new tables show up.

### Option B: Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

## Order

Apply files in filename order (`0001_*`, `0002_*`, …). Each is idempotent (`create table if not exists`, `drop policy if exists` then `create policy`) so re-running is safe.

## Row-Level Security

Every table has RLS enabled. Phase 1 policies grant full access to any `authenticated` role — i.e., anyone signed in to the app is treated as trusted shop staff. When we introduce multi-shop or role-based access, policies get scoped to a `shop_members` lookup.

The **public** `/quote` form on the marketing site is *not* covered by these policies — it will submit via a server route using the service_role key (bypasses RLS), landing quotes into the shop's inbox without exposing any auth surface to the public.
