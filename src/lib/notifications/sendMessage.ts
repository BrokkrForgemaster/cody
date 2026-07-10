// Server-only send function used by /api/admin/messages/send. Handles both
// channels (SMS via Twilio, email via Resend), logs a `messages` row, sets
// status/provider_id/error appropriately.
import type { SupabaseClient } from "@supabase/supabase-js";
import { getResend, resendFrom } from "./resend";
import { getTwilio, twilioFrom } from "./twilio";
import type { MessageChannel } from "@/lib/supabase/types";

export type SendMessageInput = {
  customer_id?: string | null;
  job_id?: string | null;
  channel: MessageChannel;
  to_address: string;
  subject?: string | null;
  body: string;
  template?: string | null;
  sent_by?: string | null;
};

export type SendMessageResult = {
  id: string;
  status: "sent" | "failed";
  providerId: string | null;
  error?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, "public", "public", any>;

export async function sendMessage(
  supabase: AnyClient,
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const now = new Date().toISOString();
  const row = {
    customer_id: input.customer_id ?? null,
    job_id: input.job_id ?? null,
    channel: input.channel,
    direction: "out" as const,
    to_address: input.to_address,
    from_address: null as string | null,
    subject: input.subject ?? null,
    body: input.body,
    template: input.template ?? "custom",
    status: "sending" as const,
    provider_id: null as string | null,
    error: null as string | null,
    sent_at: null as string | null,
    sent_by: input.sent_by ?? null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data: created, error: insertErr } = await client
    .from("messages")
    .insert(row)
    .select("id")
    .single();
  if (insertErr || !created) {
    throw new Error(insertErr?.message ?? "Failed to log message.");
  }
  const messageId = (created as { id: string }).id;

  try {
    let providerId: string | null = null;
    let fromAddress: string;
    if (input.channel === "email") {
      const resend = getResend();
      fromAddress = resendFrom();
      const res = await resend.emails.send({
        from: fromAddress,
        to: input.to_address,
        subject: input.subject ?? "(no subject)",
        text: input.body,
      });
      providerId = (res as { data?: { id?: string } | null }).data?.id ?? null;
    } else {
      const twilio = getTwilio();
      fromAddress = twilioFrom();
      const res = await twilio.messages.create({
        from: fromAddress,
        to: input.to_address,
        body: input.body,
      });
      providerId = res.sid ?? null;
    }

    await client
      .from("messages")
      .update({
        status: "sent",
        provider_id: providerId,
        from_address: fromAddress,
        sent_at: now,
      })
      .eq("id", messageId);

    return { id: messageId, status: "sent", providerId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await client
      .from("messages")
      .update({ status: "failed", error: message })
      .eq("id", messageId);
    return { id: messageId, status: "failed", providerId: null, error: message };
  }
}
