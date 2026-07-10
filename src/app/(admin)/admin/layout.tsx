import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function initialsFor(email: string): string {
  const [local] = email.split("@");
  if (!local) return "??";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware also enforces this, but a server-side guard here is defense
  // in depth in case middleware is bypassed by a config change.
  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "user@forgedcustoms";

  return (
    <AdminShell userInitials={initialsFor(email)} userEmail={email}>
      {children}
    </AdminShell>
  );
}
