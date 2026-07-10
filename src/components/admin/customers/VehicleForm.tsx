"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createVehicle, updateVehicle } from "@/lib/offline/vehicles";
import type { Vehicle } from "@/lib/supabase/types";

type VehicleFormProps = {
  customerId: string;
  mode: "create" | "edit";
  initial?: Vehicle;
};

export function VehicleForm({ customerId, mode, initial }: VehicleFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const yearRaw = String(form.get("year") ?? "").trim();
    const year = yearRaw ? Number.parseInt(yearRaw, 10) : null;
    if (yearRaw && Number.isNaN(year!)) {
      setError("Year must be a number.");
      setBusy(false);
      return;
    }
    const values = {
      customer_id: customerId,
      year,
      make: String(form.get("make") ?? "").trim() || null,
      model: String(form.get("model") ?? "").trim() || null,
      trim: String(form.get("trim") ?? "").trim() || null,
      vin: String(form.get("vin") ?? "").trim() || null,
      license_plate: String(form.get("license_plate") ?? "").trim() || null,
      color: String(form.get("color") ?? "").trim() || null,
      notes: String(form.get("notes") ?? "").trim() || null,
    };
    try {
      if (mode === "create") {
        await createVehicle(values);
      } else if (initial) {
        await updateVehicle(initial.id, values);
      }
      router.push(`/admin/customers/${customerId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Year" name="year" type="number" defaultValue={initial?.year?.toString() ?? ""} />
        <Field label="Make" name="make" defaultValue={initial?.make ?? ""} />
        <Field label="Model" name="model" defaultValue={initial?.model ?? ""} />
        <Field label="Trim" name="trim" defaultValue={initial?.trim ?? ""} />
        <Field label="Color" name="color" defaultValue={initial?.color ?? ""} />
        <Field label="License plate" name="license_plate" defaultValue={initial?.license_plate ?? ""} />
        <Field
          label="VIN"
          name="vin"
          defaultValue={initial?.vin ?? ""}
          className="sm:col-span-2"
        />
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
          placeholder="Fitment details, aftermarket parts, prior services…"
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
            "Add vehicle"
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
  type?: string;
  defaultValue?: string;
  className?: string;
};

function Field({ label, name, type = "text", defaultValue, className }: FieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="focus-field"
      />
    </div>
  );
}
