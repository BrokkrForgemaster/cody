"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createQuote } from "@/lib/offline/quotes";
import type { QuoteSource } from "@/lib/supabase/types";

const SOURCES: { value: QuoteSource; label: string }[] = [
  { value: "staff", label: "Staff-created" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

export function NewQuoteForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const quote = await createQuote({
        source: (form.get("source") as QuoteSource) || "staff",
        status: "new",
        customer_id: null,
        vehicle_id: null,
        configuration_id: null,
        job_id: null,
        lead_first_name: String(form.get("lead_first_name") ?? "").trim() || null,
        lead_last_name: String(form.get("lead_last_name") ?? "").trim() || null,
        lead_email: String(form.get("lead_email") ?? "").trim() || null,
        lead_phone: String(form.get("lead_phone") ?? "").trim() || null,
        lead_city: String(form.get("lead_city") ?? "").trim() || null,
        vehicle_year: String(form.get("vehicle_year") ?? "").trim() || null,
        vehicle_make: String(form.get("vehicle_make") ?? "").trim() || null,
        vehicle_model: String(form.get("vehicle_model") ?? "").trim() || null,
        vehicle_trim: String(form.get("vehicle_trim") ?? "").trim() || null,
        services_interest: [],
        timeline: String(form.get("timeline") ?? "").trim() || null,
        budget: String(form.get("budget") ?? "").trim() || null,
        desired_look: null,
        current_issues: null,
        message: String(form.get("message") ?? "").trim() || null,
        staff_notes: null,
        estimated_total_cents: null,
      });
      router.push(`/admin/quotes/${quote.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="lead_first_name" />
        <Field label="Last name" name="lead_last_name" />
        <Field label="Email" name="lead_email" type="email" />
        <Field label="Phone" name="lead_phone" type="tel" />
        <Field label="City" name="lead_city" />
        <div className="flex flex-col gap-2">
          <label htmlFor="source" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Source
          </label>
          <select id="source" name="source" defaultValue="staff" className="focus-field">
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Year" name="vehicle_year" />
        <Field label="Make" name="vehicle_make" />
        <Field label="Model" name="vehicle_model" />
        <Field label="Trim" name="vehicle_trim" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Timeline" name="timeline" />
        <Field label="Budget" name="budget" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Notes / message
        </label>
        <textarea id="message" name="message" rows={4} className="focus-field resize-y" />
      </div>

      {error ? (
        <p role="alert" className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="cta-primary" disabled={busy} aria-busy={busy}>
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Creating…
            </>
          ) : (
            "Create quote"
          )}
        </button>
        <button type="button" className="cta-secondary" onClick={() => router.back()} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
        {label}
      </label>
      <input id={name} name={name} type={type} className="focus-field" />
    </div>
  );
}
