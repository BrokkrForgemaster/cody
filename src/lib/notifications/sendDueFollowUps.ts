// Shared send logic used by both the cron endpoint and the in-app manual
// trigger. Sends emails via Resend for any pending `post_delivery` follow-ups
// whose due date is today or earlier, then logs a `messages` row and marks
// the follow-up done.
import type { SupabaseClient } from "@supabase/supabase-js";
import { getResend, resendFrom } from "./resend";
import { siteSettings } from "@/data/siteSettings";

type PendingRow = {
  id: string;
  title: string;
  due_on: string | null;
  customer_id: string | null;
  job_id: string | null;
};

type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
};

type JobRow = { id: string; title: string };

export type SendResult = {
  checked: number;
  sent: number;
  skipped: number;
  errors: { id: string; error: string }[];
};

function templateEmail(customer: CustomerRow, job: JobRow | null): {
  subject: string;
  html: string;
  text: string;
} {
  const name = customer.first_name || "there";
  const jobLine = job ? ` your ${job.title.toLowerCase()}` : " your recent project";
  const businessName = siteSettings.businessName;
  const phone = siteSettings.phone;
  const subject = `Checking in on${jobLine} — ${businessName}`;
  const text = [
    `Hi ${name},`,
    "",
    `It's been about two weeks since we wrapped up${jobLine} at ${businessName}.`,
    "How's it holding up? Any questions, tweaks, or issues we should know about?",
    "",
    "If everything looks great, we'd love a quick review — it really helps a small shop.",
    "",
    "Just hit reply, or give us a call anytime.",
    "",
    `— The ${businessName} team`,
    phone,
  ].join("\n");
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; color:#0B0B0B; max-width:560px; margin:auto; padding:24px;">
      <h2 style="margin:0 0 12px; font-family: 'Bebas Neue', Impact, sans-serif; letter-spacing:0.02em;">${businessName}</h2>
      <p>Hi ${name},</p>
      <p>It's been about two weeks since we wrapped up${jobLine} at ${businessName}. How's it holding up? Any questions, tweaks, or issues we should know about?</p>
      <p>If everything looks great, we'd love a quick review — it really helps a small shop.</p>
      <p>Just hit reply, or give us a call anytime.</p>
      <p style="margin-top:32px; color:#555;">— The ${businessName} team<br/>${phone}</p>
    </div>
  `;
  return { subject, html, text };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, "public", "public", any>;

export async function sendDueFollowUpEmails(
  supabase: AnyClient,
  sentBy: string | null = null,
): Promise<SendResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const today = new Date().toISOString().slice(0, 10);

  const { data: pending, error: qErr } = await client
    .from("follow_ups")
    .select("id, title, due_on, customer_id, job_id")
    .eq("kind", "post_delivery")
    .eq("status", "pending")
    .is("email_sent_at", null)
    .not("customer_id", "is", null)
    .lte("due_on", today);

  if (qErr) throw new Error(qErr.message);

  const rows = (pending ?? []) as PendingRow[];
  if (rows.length === 0) return { checked: 0, sent: 0, skipped: 0, errors: [] };

  const customerIds = [
    ...new Set(rows.map((r) => r.customer_id).filter((v): v is string => !!v)),
  ];
  const { data: customers } = await client
    .from("customers")
    .select("id, first_name, last_name, email")
    .in("id", customerIds);
  const customersById = new Map<string, CustomerRow>();
  for (const c of (customers ?? []) as CustomerRow[]) customersById.set(c.id, c);

  const jobIds = [...new Set(rows.map((r) => r.job_id).filter((v): v is string => !!v))];
  const jobsById = new Map<string, JobRow>();
  if (jobIds.length > 0) {
    const { data: jobs } = await client.from("jobs").select("id, title").in("id", jobIds);
    for (const j of (jobs ?? []) as JobRow[]) jobsById.set(j.id, j);
  }

  const resend = getResend();
  const from = resendFrom();

  let sent = 0;
  let skipped = 0;
  const errors: { id: string; error: string }[] = [];

  for (const row of rows) {
    const cust = row.customer_id ? customersById.get(row.customer_id) : undefined;
    if (!cust || !cust.email) {
      skipped += 1;
      continue;
    }
    const job = row.job_id ? jobsById.get(row.job_id) ?? null : null;
    const { subject, html, text } = templateEmail(cust, job);
    try {
      const res = await resend.emails.send({
        from,
        to: cust.email,
        subject,
        html,
        text,
      });
      const providerId = (res as { data?: { id?: string } | null }).data?.id ?? null;
      const now = new Date().toISOString();
      await client
        .from("follow_ups")
        .update({ email_sent_at: now, status: "done", completed_at: now })
        .eq("id", row.id);
      await client.from("messages").insert({
        customer_id: cust.id,
        job_id: row.job_id,
        channel: "email",
        direction: "out",
        to_address: cust.email,
        from_address: from,
        subject,
        body: text,
        template: "post_delivery",
        status: "sent",
        provider_id: providerId,
        sent_at: now,
        sent_by: sentBy,
      });
      sent += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ id: row.id, error: message });
    }
  }

  return { checked: rows.length, sent, skipped, errors };
}
