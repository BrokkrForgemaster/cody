import { NextResponse } from "next/server";
import { sendMessage, type SendMessageInput } from "@/lib/notifications/sendMessage";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await getSupabaseServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let body: SendMessageInput;
  try {
    body = (await request.json()) as SendMessageInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.to_address || !body.body || (body.channel !== "sms" && body.channel !== "email")) {
    return NextResponse.json(
      { ok: false, error: "Channel, to_address, and body are required." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseServiceClient();
    const result = await sendMessage(supabase, { ...body, sent_by: user.id });
    if (result.status === "failed") {
      return NextResponse.json(
        { ok: false, id: result.id, error: result.error ?? "Send failed." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, id: result.id, providerId: result.providerId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /not set|not configured/i.test(message) ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
