// Daily cron: send post-delivery follow-up emails whose due_on is today or earlier.
// Protected by the CRON_SECRET env var.
//   Vercel Cron:   configured in vercel.json ("0 14 * * *" UTC = 10am ET)
//   Manual test:   POST /api/cron/follow-ups?token=<CRON_SECRET>
import { NextResponse } from "next/server";
import { sendDueFollowUpEmails } from "@/lib/notifications/sendDueFollowUps";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${expected}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("token") === expected;
}

export async function GET(request: Request) {
  return handle(request);
}
export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const supabase = getSupabaseServiceClient();
    const result = await sendDueFollowUpEmails(supabase);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /not set|not configured/i.test(message) ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
