"use server";

import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { UserRole } from "@/lib/supabase/types";

export type { UserRole };

export type TeamMember = {
  id: string;
  email: string;
  lastSignIn: string | null;
  createdAt: string;
  mfaEnrolled: boolean;
  role: UserRole | null;
};

export async function listTeamMembers(): Promise<TeamMember[]> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(error.message);

  // listUsers() omits MFA factors — fetch each user individually in parallel
  const full = await Promise.all(
    data.users.map((u) =>
      supabase.auth.admin.getUserById(u.id).then((r) => r.data.user ?? u),
    ),
  );

  return full.map((user) => ({
    id: user.id,
    email: user.email ?? "unknown",
    lastSignIn: user.last_sign_in_at ?? null,
    createdAt: user.created_at,
    mfaEnrolled: (user.factors ?? []).some(
      (f) => f.factor_type === "totp" && f.status === "verified",
    ),
    role: (user.app_metadata?.role as UserRole | undefined) ?? null,
  }));
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });
  if (error) throw new Error(error.message);
}

export async function inviteEmployee(email: string, origin: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  });
  if (error) throw new Error(error.message);
}

export async function initiatePasswordReset(email: string, origin: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    },
  });
  if (error) throw new Error(error.message);
}
