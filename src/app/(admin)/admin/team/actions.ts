"use server";

import { headers } from "next/headers";
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

const PASSWORD_SETUP_PATH = "/auth/reset-password";

function normalizeOrigin(value: string): string {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return new URL(withScheme).origin;
}

async function getAppOrigin(): Promise<string> {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (configured?.trim()) {
    return normalizeOrigin(configured.trim());
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) throw new Error("Unable to determine app URL for invitation link.");

  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return normalizeOrigin(`${proto}://${host}`);
}

async function getPasswordSetupRedirectTo(): Promise<string> {
  const url = new URL("/auth/callback", await getAppOrigin());
  url.searchParams.set("next", PASSWORD_SETUP_PATH);
  return url.toString();
}

export async function inviteEmployee(email: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: await getPasswordSetupRedirectTo(),
  });
  if (error) throw new Error(error.message);
}

export async function initiatePasswordReset(email: string): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await getPasswordSetupRedirectTo(),
  });
  if (error) throw new Error(error.message);
}
