"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { listCustomers } from "@/lib/offline/customers";
import { createJob, updateJob } from "@/lib/offline/jobs";
import { listVehiclesForCustomer } from "@/lib/offline/vehicles";
import type { Job, JobStage, JobStatus } from "@/lib/supabase/types";

const STATUSES: { value: JobStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_shop", label: "In Shop" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STAGES: { value: JobStage; label: string }[] = [
  { value: "paint", label: "Paint" },
  { value: "coat", label: "Coat" },
  { value: "qc", label: "QC" },
  { value: "other", label: "Other" },
];

type JobFormProps = {
  mode: "create" | "edit";
  initial?: Job;
  initialCustomerId?: string;
  initialVehicleId?: string;
};

export function JobForm({ mode, initial, initialCustomerId, initialVehicleId }: JobFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string>(
    initial?.customer_id ?? initialCustomerId ?? "",
  );
  const [status, setStatus] = useState<JobStatus>(initial?.status ?? "new");

  const customers = useLiveQuery(() => listCustomers(), []);
  const vehicles = useLiveQuery(
    () => (customerId ? listVehiclesForCustomer(customerId) : Promise.resolve([])),
    [customerId],
  );

  const sortedCustomers = useMemo(() => {
    return [...(customers ?? [])].sort((a, b) =>
      `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`),
    );
  }, [customers]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) {
      setError("Title is required.");
      setBusy(false);
      return;
    }
    const values = {
      title,
      summary: String(form.get("summary") ?? "").trim() || null,
      status,
      stage: status === "in_shop" ? ((form.get("stage") as JobStage) || null) : null,
      customer_id: customerId || null,
      vehicle_id: String(form.get("vehicle_id") ?? "") || null,
      scheduled_for: String(form.get("scheduled_for") ?? "") || null,
      created_by: initial?.created_by ?? null,
    };
    try {
      if (mode === "create") {
        const row = await createJob(values);
        router.push(`/admin/jobs/${row.id}`);
      } else if (initial) {
        await updateJob(initial.id, values);
        router.push(`/admin/jobs/${initial.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="title"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
        >
          Title <span className="text-accent">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          className="focus-field"
          placeholder="e.g. Ford F-150 headlight retrofit"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="customer_id"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
          >
            Customer
          </label>
          <select
            id="customer_id"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="focus-field"
          >
            <option value="">— None —</option>
            {sortedCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.last_name}, {c.first_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="vehicle_id"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
          >
            Vehicle
          </label>
          <select
            id="vehicle_id"
            name="vehicle_id"
            defaultValue={initial?.vehicle_id ?? initialVehicleId ?? ""}
            className="focus-field"
            disabled={!customerId}
          >
            <option value="">— None —</option>
            {vehicles?.map((v) => (
              <option key={v.id} value={v.id}>
                {[v.year, v.make, v.model, v.trim].filter(Boolean).join(" ") || "Vehicle"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="status"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatus)}
            className="focus-field"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {status === "in_shop" ? (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="stage"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
            >
              Stage
            </label>
            <select
              id="stage"
              name="stage"
              defaultValue={initial?.stage ?? ""}
              className="focus-field"
            >
              <option value="">— None —</option>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="scheduled_for"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
          >
            Scheduled for
          </label>
          <input
            id="scheduled_for"
            name="scheduled_for"
            type="date"
            defaultValue={initial?.scheduled_for ?? ""}
            className="focus-field"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="summary"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
        >
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={5}
          defaultValue={initial?.summary ?? ""}
          className="focus-field resize-y"
          placeholder="Scope, parts to order, customer preferences, expected turnaround…"
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
            "Create job"
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
