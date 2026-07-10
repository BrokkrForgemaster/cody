// Server-side Supabase client with the service_role key. Bypasses RLS.
// ONLY use in server code (route handlers, server actions). Never leak this
// client to the browser. The service_role key is a secret.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let cached: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseServiceClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local — required for server-side privileged writes (e.g. public /quote form).",
    );
  }

  cached = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
