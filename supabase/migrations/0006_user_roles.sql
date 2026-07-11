-- User role hierarchy: admin > manager > employee
-- Roles are stored in auth.users.raw_app_meta_data as { "role": "admin" | "manager" | "employee" }
-- The service_role key is required to read/write app_metadata from the app (Team page).
--
-- ── Bootstrap: set a user's role to admin ────────────────────────────────────
-- Run this in the Supabase SQL editor (or via supabase db push) to give your
-- account the admin role before the Team panel is operational.
--
-- Replace the email below with your own, then run the statement.

UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'chad.powell0@gmail.com';
