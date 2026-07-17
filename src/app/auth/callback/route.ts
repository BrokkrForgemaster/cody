import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null): string {
  if (value === "/auth/reset-password") return value;
  if (value === "/admin" || value?.startsWith("/admin/")) return value;
  return "/admin";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=reset_failed`);
}
