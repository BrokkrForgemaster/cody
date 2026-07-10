"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, ExternalLink, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCustomer, getCustomer } from "@/lib/offline/customers";
import { createJob } from "@/lib/offline/jobs";
import { deleteQuote, getQuote, updateQuote } from "@/lib/offline/quotes";
import type { QuoteStatus } from "@/lib/supabase/types";

const STATUSES: { value: QuoteStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export function QuoteDetail({ id }: { id: string }) {
  const router = useRouter();
  const quote = useLiveQuery(() => getQuote(id), [id]);
  const linkedCustomer = useLiveQuery(
    () => (quote?.customer_id ? getCustomer(quote.customer_id) : Promise.resolve(undefined)),
    [quote?.customer_id],
  );

  const [busy, setBusy] = useState<null | "customer" | "job" | "delete">(null);
  const [confirming, setConfirming] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);

  if (quote === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (!quote || quote.deleted_at) {
    return (
      <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
        Quote not found on this device.
      </div>
    );
  }

  const currentNotes = notes ?? quote.staff_notes ?? "";
  const leadName = [quote.lead_first_name, quote.lead_last_name].filter(Boolean).join(" ").trim();

  async function setStatus(status: QuoteStatus) {
    await updateQuote(quote!.id, { status });
  }

  async function saveNotes() {
    await updateQuote(quote!.id, { staff_notes: currentNotes || null });
    setNotes(null);
  }

  async function convertToCustomer() {
    if (!quote || quote.customer_id) return;
    setBusy("customer");
    const c = await createCustomer({
      first_name: quote.lead_first_name ?? "",
      last_name: quote.lead_last_name ?? "",
      email: quote.lead_email,
      phone: quote.lead_phone,
      source: quote.source === "website" ? "website" : "other",
      notes:
        [quote.desired_look, quote.current_issues, quote.message]
          .filter(Boolean)
          .join("\n\n") || null,
    });
    await updateQuote(quote.id, { customer_id: c.id });
    setBusy(null);
  }

  async function convertToJob() {
    if (!quote) return;
    setBusy("job");
    const title = leadName
      ? `${leadName}${quote.vehicle_make ? ` — ${quote.vehicle_make}` : ""}`
      : "New job from quote";
    const job = await createJob({
      title,
      summary: [quote.desired_look, quote.current_issues, quote.message]
        .filter(Boolean)
        .join("\n\n") || null,
      customer_id: quote.customer_id,
      vehicle_id: quote.vehicle_id,
      status: "new",
      stage: null,
      scheduled_for: null,
      created_by: null,
    });
    await updateQuote(quote.id, { status: "converted", job_id: job.id });
    router.push(`/admin/jobs/${job.id}`);
  }

  async function onDelete() {
    setBusy("delete");
    await deleteQuote(quote!.id);
    router.push("/admin/quotes");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="panel-border rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">
              {quote.source} · {new Date(quote.created_at).toLocaleString()}
            </p>
            <h2 className="font-heading text-3xl uppercase text-text">
              {leadName || "Unknown lead"}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              {quote.lead_email ? (
                <a href={`mailto:${quote.lead_email}`} className="hover:text-white">
                  {quote.lead_email}
                </a>
              ) : null}
              {quote.lead_phone ? (
                <a href={`tel:${quote.lead_phone}`} className="hover:text-white">
                  {quote.lead_phone}
                </a>
              ) : null}
              {quote.lead_city ? <span>{quote.lead_city}</span> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {confirming ? (
              <>
                <button
                  type="button"
                  className="cta-primary text-xs"
                  onClick={onDelete}
                  disabled={busy === "delete"}
                >
                  {busy === "delete" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden />
                      Deleting…
                    </>
                  ) : (
                    "Confirm delete"
                  )}
                </button>
                <button
                  type="button"
                  className="cta-secondary text-xs"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="cta-secondary text-xs"
                onClick={() => setConfirming(true)}
              >
                <Trash2 size={14} aria-hidden />
                Delete
              </button>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Vehicle">
            {[quote.vehicle_year, quote.vehicle_make, quote.vehicle_model, quote.vehicle_trim]
              .filter(Boolean)
              .join(" ") || "—"}
          </Info>
          <Info label="Timeline">{quote.timeline || "—"}</Info>
          <Info label="Budget">{quote.budget || "—"}</Info>
          <Info label="Services of interest">
            {quote.services_interest.length ? quote.services_interest.join(", ") : "—"}
          </Info>
          <Info label="Desired look" className="sm:col-span-2">
            {quote.desired_look || "—"}
          </Info>
          <Info label="Current issues" className="sm:col-span-2">
            {quote.current_issues || "—"}
          </Info>
          <Info label="Message" className="sm:col-span-2">
            {quote.message || "—"}
          </Info>
        </dl>
      </div>

      <div className="panel-border rounded-lg p-6">
        <h3 className="font-heading text-xl uppercase text-text">Workflow</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Status
            </span>
            <select
              value={quote.status}
              onChange={(e) => setStatus(e.target.value as QuoteStatus)}
              className="focus-field"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Linked customer
            </span>
            {linkedCustomer ? (
              <Link
                href={`/admin/customers/${linkedCustomer.id}`}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:border-blue-accent"
              >
                <CheckCircle2 size={14} className="text-emerald-300" aria-hidden />
                {linkedCustomer.first_name} {linkedCustomer.last_name}
                <ExternalLink size={12} className="ml-auto text-muted" aria-hidden />
              </Link>
            ) : (
              <button
                type="button"
                className="cta-secondary text-xs"
                onClick={convertToCustomer}
                disabled={busy === "customer"}
              >
                {busy === "customer" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden />
                    Creating…
                  </>
                ) : (
                  "Create customer record"
                )}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Convert to job
            </span>
            <button
              type="button"
              className="cta-primary text-xs"
              onClick={convertToJob}
              disabled={busy === "job" || quote.status === "converted"}
            >
              {busy === "job" ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden />
                  Creating…
                </>
              ) : quote.status === "converted" ? (
                "Already converted"
              ) : (
                "Create job from quote"
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <label
            htmlFor="staff_notes"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
          >
            Staff notes
          </label>
          <textarea
            id="staff_notes"
            rows={4}
            value={currentNotes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            className="focus-field resize-y"
            placeholder="Internal notes on this lead — call outcome, fit questions, quote details…"
          />
          <p className="text-xs text-muted">Saved automatically when you click away.</p>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-text">{children}</dd>
    </div>
  );
}
