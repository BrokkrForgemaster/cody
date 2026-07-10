"use client";

import { Loader2, Mail, Phone as PhoneIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { MessageChannel } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Props = {
  customerId: string | null;
  jobId?: string | null;
  customerFirstName?: string | null;
  email?: string | null;
  phone?: string | null;
  onSent?: () => void;
};

const TEMPLATES: {
  key: string;
  label: string;
  channel: MessageChannel | "either";
  subject?: string;
  body: string;
}[] = [
  {
    key: "ready_for_pickup",
    label: "Ready for pickup",
    channel: "either",
    subject: "Your vehicle is ready for pickup",
    body: `Hi {name},\n\nJust letting you know your vehicle is ready for pickup at Forged Customs. Give us a call when you're on the way and we'll have it out front.`,
  },
  {
    key: "quote_nudge",
    label: "Quote nudge",
    channel: "either",
    subject: "Following up on your Forged Customs quote",
    body: `Hi {name},\n\nJust wanted to follow up on the quote we sent over. Any questions we can answer, or ready to lock in a build date?`,
  },
  {
    key: "appointment_reminder",
    label: "Appointment reminder",
    channel: "either",
    subject: "Reminder: your Forged Customs appointment",
    body: `Hi {name},\n\nJust a reminder about your appointment with us. Let us know if anything changes on your end.`,
  },
  {
    key: "custom",
    label: "Custom",
    channel: "either",
    body: "",
  },
];

export function SendMessage({
  customerId,
  jobId,
  customerFirstName,
  email,
  phone,
  onSent,
}: Props) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<MessageChannel>(phone ? "sms" : "email");
  const [templateKey, setTemplateKey] = useState<string>("custom");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const template = useMemo(
    () => TEMPLATES.find((t) => t.key === templateKey) ?? TEMPLATES[3],
    [templateKey],
  );

  function applyTemplate(key: string) {
    setTemplateKey(key);
    const t = TEMPLATES.find((tp) => tp.key === key);
    if (!t) return;
    const name = customerFirstName ?? "there";
    setSubject(t.subject ?? "");
    setBody(t.body.replace(/\{name\}/g, name));
  }

  function openPanel() {
    setError(null);
    setOk(null);
    if (!templateKey || templateKey === "custom") applyTemplate("custom");
    else applyTemplate(templateKey);
    setTo(channel === "sms" ? phone ?? "" : email ?? "");
    setOpen(true);
  }

  function switchChannel(next: MessageChannel) {
    setChannel(next);
    setTo(next === "sms" ? phone ?? "" : email ?? "");
  }

  async function onSend() {
    setError(null);
    setOk(null);
    if (!to.trim() || !body.trim() || (channel === "email" && !subject.trim())) {
      setError("Fill in the recipient, subject (email), and body.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          job_id: jobId ?? null,
          channel,
          to_address: to.trim(),
          subject: channel === "email" ? subject : null,
          body,
          template: templateKey,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Send failed.");
      } else {
        setOk("Sent.");
        setBody("");
        onSent?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="cta-secondary text-xs" onClick={openPanel}>
        <Mail size={14} aria-hidden />
        Message customer
      </button>
    );
  }

  return (
    <div className="panel-border rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-md border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.14em]">
          <button
            type="button"
            onClick={() => switchChannel("sms")}
            disabled={!phone}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 transition",
              channel === "sms" ? "bg-accent text-white" : "text-muted hover:text-white",
              !phone && "cursor-not-allowed opacity-50",
            )}
          >
            <PhoneIcon size={12} aria-hidden />
            SMS
          </button>
          <button
            type="button"
            onClick={() => switchChannel("email")}
            disabled={!email}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 transition",
              channel === "email" ? "bg-accent text-white" : "text-muted hover:text-white",
              !email && "cursor-not-allowed opacity-50",
            )}
          >
            <Mail size={12} aria-hidden />
            Email
          </button>
        </div>
        <select
          value={templateKey}
          onChange={(e) => applyTemplate(e.target.value)}
          className="focus-field !py-1 !text-xs"
          aria-label="Template"
        >
          {TEMPLATES.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 grid gap-3">
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="focus-field !py-2 text-sm"
          placeholder={channel === "sms" ? "+18595550198" : "customer@example.com"}
          aria-label="Recipient"
        />
        {channel === "email" ? (
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="focus-field !py-2 text-sm"
            placeholder="Subject"
            aria-label="Subject"
          />
        ) : null}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={channel === "sms" ? 4 : 6}
          className="focus-field resize-y text-sm"
          placeholder="Message body"
          aria-label="Body"
        />
        {channel === "sms" ? (
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
            {body.length} chars / {Math.max(1, Math.ceil(body.length / 160))} segment(s)
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="mt-3 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
          {ok}
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <button type="button" className="cta-primary text-xs" onClick={onSend} disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={12} className="animate-spin" aria-hidden />
              Sending...
            </>
          ) : (
            <>
              <Mail size={12} aria-hidden />
              Send
            </>
          )}
        </button>
        <button type="button" className="cta-secondary text-xs" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
