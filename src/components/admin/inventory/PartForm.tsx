"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPart, updatePart } from "@/lib/offline/parts";
import type { Part, PartCategory, PartItemType } from "@/lib/supabase/types";

const CATEGORY_OPTIONS: { value: PartCategory; label: string }[] = [
  { value: "lighting", label: "Lighting" },
  { value: "powder", label: "Powder" },
  { value: "paint", label: "Paint" },
  { value: "coating", label: "Coating" },
  { value: "fabrication", label: "Fabrication" },
  { value: "consumable", label: "Consumable" },
  { value: "tool", label: "Tool" },
  { value: "other", label: "Other" },
];

const TYPE_OPTIONS: { value: PartItemType; label: string }[] = [
  { value: "part", label: "Part" },
  { value: "consumable", label: "Consumable" },
  { value: "tool", label: "Tool" },
  { value: "kit", label: "Kit" },
];

const UOM_OPTIONS = ["each", "lb", "oz", "gal", "qt", "pt", "ft", "in", "kit", "box"];

function parseDollarsToCents(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const num = Number.parseFloat(trimmed.replace(/[$,]/g, ""));
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100);
}

function centsToDollars(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return (cents / 100).toFixed(2);
}

type Props = {
  mode: "create" | "edit";
  initial?: Part;
  initialBarcode?: string;
};

export function PartForm({ mode, initial, initialBarcode }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const sku = String(form.get("sku") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();
    if (!sku || !name) {
      setError("SKU and name are required.");
      setBusy(false);
      return;
    }
    const values = {
      sku,
      barcode: String(form.get("barcode") ?? "").trim() || null,
      name,
      category: (form.get("category") as PartCategory) || "other",
      item_type: (form.get("item_type") as PartItemType) || "part",
      uom: String(form.get("uom") ?? "each").trim() || "each",
      cost_cents: parseDollarsToCents(String(form.get("cost") ?? "")) ?? 0,
      last_cost_cents: parseDollarsToCents(String(form.get("last_cost") ?? "")),
      price_cents: parseDollarsToCents(String(form.get("price") ?? "")),
      on_hand: mode === "create"
        ? Number.parseFloat(String(form.get("on_hand") ?? "0")) || 0
        : (initial?.on_hand ?? 0),
      min_qty: Number.parseFloat(String(form.get("min_qty") ?? "0")) || 0,
      par_qty: form.get("par_qty")
        ? Number.parseFloat(String(form.get("par_qty"))) || null
        : null,
      vendor: String(form.get("vendor") ?? "").trim() || null,
      vendor_sku: String(form.get("vendor_sku") ?? "").trim() || null,
      lead_time_days: form.get("lead_time_days")
        ? Number.parseInt(String(form.get("lead_time_days")), 10) || null
        : null,
      location: String(form.get("location") ?? "").trim() || null,
      notes: String(form.get("notes") ?? "").trim() || null,
      active: form.get("active") === "on",
    };
    try {
      if (mode === "create") {
        const row = await createPart(values);
        router.push(`/admin/inventory/${row.id}`);
      } else if (initial) {
        await updatePart(initial.id, values);
        router.push(`/admin/inventory/${initial.id}`);
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
        <Field label="SKU *" name="sku" required defaultValue={initial?.sku} />
        <Field
          label="Barcode"
          name="barcode"
          defaultValue={initial?.barcode ?? initialBarcode ?? ""}
        />
      </div>

      <Field label="Name *" name="name" required defaultValue={initial?.name} />

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Category" name="category" options={CATEGORY_OPTIONS} defaultValue={initial?.category} />
        <SelectField label="Type" name="item_type" options={TYPE_OPTIONS} defaultValue={initial?.item_type} />
        <div className="flex flex-col gap-2">
          <label htmlFor="uom" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Unit of measure
          </label>
          <input
            id="uom"
            name="uom"
            list="uom-options"
            defaultValue={initial?.uom ?? "each"}
            className="focus-field"
          />
          <datalist id="uom-options">
            {UOM_OPTIONS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Cost ($)"
          name="cost"
          defaultValue={centsToDollars(initial?.cost_cents)}
          placeholder="e.g. 12.50"
        />
        <Field
          label="Last cost ($)"
          name="last_cost"
          defaultValue={centsToDollars(initial?.last_cost_cents)}
        />
        <Field
          label="Price ($)"
          name="price"
          defaultValue={centsToDollars(initial?.price_cents)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {mode === "create" ? (
          <Field label="Opening on-hand" name="on_hand" type="number" defaultValue="0" step="0.01" />
        ) : null}
        <Field label="Min qty (reorder trigger)" name="min_qty" type="number" defaultValue={String(initial?.min_qty ?? 0)} step="0.01" />
        <Field label="Par qty (order-up-to)" name="par_qty" type="number" defaultValue={initial?.par_qty !== null && initial?.par_qty !== undefined ? String(initial.par_qty) : ""} step="0.01" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Vendor" name="vendor" defaultValue={initial?.vendor ?? ""} />
        <Field label="Vendor SKU" name="vendor_sku" defaultValue={initial?.vendor_sku ?? ""} />
        <Field label="Lead time (days)" name="lead_time_days" type="number" defaultValue={initial?.lead_time_days !== null && initial?.lead_time_days !== undefined ? String(initial.lead_time_days) : ""} />
      </div>

      <Field label="Location / bin" name="location" defaultValue={initial?.location ?? ""} placeholder="e.g. Powder Bay 2 / Shelf A3" />

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Notes
        </label>
        <textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ""} className="focus-field resize-y" />
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="accent-accent"
        />
        Active (shows in main list)
      </label>

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
              Saving…
            </>
          ) : mode === "create" ? (
            "Create part"
          ) : (
            "Save changes"
          )}
        </button>
        <button type="button" className="cta-secondary" onClick={() => router.back()} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        className="focus-field"
      />
    </div>
  );
}

function SelectField<T extends string>({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: T; label: string }[];
  defaultValue?: T;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className="focus-field">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
