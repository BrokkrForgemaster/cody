// Authenticated equivalent of the cron endpoint. Lets shop staff manually
// trigger the send from within /admin/follow-ups.
import { NextResponse } from "next/server";
import { sendDueFollowUpEmails } from "@/lib/notifications/sendDueFollowUps";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await getSupabaseServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  try {
    const supabase = getSupabaseServiceClient();
    const result = await sendDueFollowUpEmails(supabase, user.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /not set|not configured/i.test(message) ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
