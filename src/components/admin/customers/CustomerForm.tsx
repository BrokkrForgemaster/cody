"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCustomer, updateCustomer } from "@/lib/offline/customers";
import type { Customer, CustomerSource } from "@/lib/supabase/types";

const SOURCE_OPTIONS: { value: CustomerSource; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "walk-in", label: "Walk-in" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

type CustomerFormProps = {
  mode: "create" | "edit";
  initial?: Customer;
};

export function CustomerForm({ mode, initial }: CustomerFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const values = {
      first_name: String(form.get("first_name") ?? "").trim(),
      last_name: String(form.get("last_name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim() || null,
      phone: String(form.get("phone") ?? "").trim() || null,
      source: (form.get("source") as CustomerSource) || null,
      notes: String(form.get("notes") ?? "").trim() || null,
    };
    if (!values.first_name || !values.last_name) {
      setError("First and last name are required.");
      setBusy(false);
      return;
    }
    try {
      if (mode === "create") {
        const row = await createCustomer(values);
        router.push(`/admin/customers/${row.id}`);
      } else if (initial) {
        await updateCustomer(initial.id, values);
        router.push(`/admin/customers/${initial.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="first_name" required defaultValue={initial?.first_name} />
        <Field label="Last name" name="last_name" required defaultValue={initial?.last_name} />
        <Field label="Email" name="email" type="email" defaultValue={initial?.email ?? ""} />
        <Field label="Phone" name="phone" type="tel" defaultValue={initial?.phone ?? ""} />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="source"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
        >
          Source
        </label>
        <select
          id="source"
          name="source"
          defaultValue={initial?.source ?? ""}
          className="focus-field"
        >
          <option value="">—</option>
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="notes"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={initial?.notes ?? ""}
          className="focus-field resize-y"
          placeholder="Preferred contact time, referrer, vehicle details customer mentioned…"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="cta-primary" disabled={busy} aria-busy={busy}>
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Saving…
            </>
          ) : mode === "create" ? (
            "Create customer"
          ) : (
            "Save changes"
          )}
        </button>
        <button
          type="button"
          className="cta-secondary"
          onClick={() => router.back()}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
};

function Field({ label, name, required, type = "text", defaultValue }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
      >
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="focus-field"
      />
    </div>
  );
}
