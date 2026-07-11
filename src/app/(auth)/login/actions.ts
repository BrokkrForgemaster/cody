"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  REMEMBERED_LOGIN_EMAIL_COOKIE,
  rememberedEmailCookieOptions,
} from "./rememberedEmailCookie";

export type LoginState = { error?: string } | null;

export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const rememberEmail = formData.get("rememberEmail") === "on";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const cookieStore = await cookies();
  if (rememberEmail) {
    cookieStore.set(REMEMBERED_LOGIN_EMAIL_COOKIE, email, rememberedEmailCookieOptions);
  } else {
    cookieStore.set(REMEMBERED_LOGIN_EMAIL_COOKIE, "", {
      ...rememberedEmailCookieOptions,
      maxAge: 0,
    });
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
