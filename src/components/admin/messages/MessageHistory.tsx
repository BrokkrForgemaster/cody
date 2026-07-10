"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, Check, Loader2, Mail, MessageSquare } from "lucide-react";
import { listMessagesForCustomer, listMessagesForJob } from "@/lib/offline/messages";
import type { Message } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Props = { customerId?: string; jobId?: string };

export function MessageHistory({ customerId, jobId }: Props) {
  const rows = useLiveQuery(() => {
    if (customerId) return listMessagesForCustomer(customerId);
    if (jobId) return listMessagesForJob(jobId);
    return Promise.resolve([] as Message[]);
  }, [customerId, jobId]);

  const loading = rows === undefined;

  if (loading) {
    return <p className="text-sm text-muted">Loading messages...</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-white/10 p-4 text-center text-sm text-muted">
        No messages sent yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((m) => (
        <li key={m.id} className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {m.channel === "email" ? (
                <Mail size={13} className="text-blue-accent" aria-hidden />
              ) : (
                <MessageSquare size={13} className="text-blue-accent" aria-hidden />
              )}
              <span className="text-xs uppercase tracking-[0.16em] text-muted">
                {m.channel}
              </span>
              <span className="text-xs text-muted">-&gt; {m.to_address}</span>
              <StatusPill status={m.status} />
            </div>
            <span className="text-xs text-muted">
              {new Date(m.sent_at ?? m.created_at).toLocaleString()}
            </span>
          </div>
          {m.subject ? (
            <p className="mt-2 text-sm font-semibold text-text">{m.subject}</p>
          ) : null}
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{m.body}</p>
          {m.error ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-accent">
              <AlertTriangle size={11} aria-hidden />
              {m.error}
            </p>
          ) : null}
          {m.template && m.template !== "custom" ? (
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted">
              Template: {m.template.replace(/_/g, " ")}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function StatusPill({ status }: { status: Message["status"] }) {
  const map = {
    queued: { className: "border-white/10 bg-white/5 text-muted", icon: Loader2, label: "Queued" },
    sending: { className: "border-blue-accent/40 bg-blue-accent/10 text-blue-accent", icon: Loader2, label: "Sending" },
    sent: { className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", icon: Check, label: "Sent" },
    failed: { className: "border-accent/40 bg-accent/10 text-accent", icon: AlertTriangle, label: "Failed" },
  } as const;
  const s = map[status];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        s.className,
      )}
    >
      <Icon size={9} aria-hidden />
      {s.label}
    </span>
  );
}
