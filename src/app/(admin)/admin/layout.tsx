import { AuthGate } from "@/components/admin/AuthGate";

/**
 * The admin area renders offline, so auth is gated client-side in AuthGate
 * (reads the persisted Supabase session with no network). Online enforcement
 * still runs in the server middleware (src/lib/supabase/middleware.ts). Keeping
 * this layout free of server data fetches lets the admin routes be cached and
 * served by the service worker with no connectivity.
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGate>{children}</AuthGate>;
}
