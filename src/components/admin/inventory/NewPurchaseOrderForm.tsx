"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { needsReorder, suggestedReorderQty } from "@/lib/offline/inventory";
import { listParts } from "@/lib/offline/parts";
import { createPurchaseOrder } from "@/lib/offline/purchaseOrders";
import type { Part } from "@/lib/supabase/types";

type Line = {
  key: string;
  part_id: string | null;
  label: string;
  vendor_sku: string;
  quantity_ordered: string;
  unit_cost_dollars: string;
  notes: string;
};

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
function id(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function NewPurchaseOrderForm({ initialVendor }: { initialVendor?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendor, setVendor] = useState(initialVendor ?? "");
  const [lines, setLines] = useState<Line[]>([]);

  const parts = useLiveQuery(() => listParts(true), []);

  const vendorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of parts ?? []) if (p.vendor) set.add(p.vendor);
    if (initialVendor) set.add(initialVendor);
    return [...set].sort();
  }, [parts, initialVendor]);

  const partsForVendor = useMemo(() => {
    if (!vendor) return [] as Part[];
    return (parts ?? []).filter((p) => p.vendor === vendor);
  }, [parts, vendor]);

  function addBlankLine() {
    setLines((cur) => [
      ...cur,
      { key: id(), part_id: null, label: "", vendor_sku: "", quantity_ordered: "1", unit_cost_dollars: "", notes: "" },
    ]);
  }

  function prefillFromReorder() {
    const need = partsForVendor.filter(needsReorder);
    if (need.length === 0) {
      setError(`No ${vendor} items are below their reorder minimum.`);
      return;
    }
    setError(null);
    const newLines: Line[] = need.map((p) => ({
      key: id(),
      part_id: p.id,
      label: p.name,
      vendor_sku: p.vendor_sku ?? "",
      quantity_ordered: String(suggestedReorderQty(p)),
      unit_cost_dollars: centsToDollars(p.cost_cents),
      notes: "",
    }));
    setLines((cur) => [...cur, ...newLines]);
  }

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((cur) => cur.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }
  function removeLine(key: string) {
    setLines((cur) => cur.filter((l) => l.key !== key));
  }

  function pickPart(key: string, partId: string) {
    if (!partId) {
      updateLine(key, { part_id: null });
      return;
    }
    const p = (parts ?? []).find((pp) => pp.id === partId);
    if (!p) return;
    updateLine(key, {
      part_id: p.id,
      label: p.name,
      vendor_sku: p.vendor_sku ?? "",
      unit_cost_dollars: centsToDollars(p.cost_cents),
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const v = vendor.trim();
    if (!v) {
      setError("Vendor is required.");
      setBusy(false);
      return;
    }
    const cleanLines = lines.filter((l) => l.label.trim().length > 0);
    if (cleanLines.length === 0) {
      setError("Add at least one line item.");
      setBusy(false);
      return;
    }
    try {
      const po = await createPurchaseOrder(
        {
          vendor: v,
          po_number: String(form.get("po_number") ?? "").trim() || null,
          status: "draft",
          ordered_on: String(form.get("ordered_on") ?? "") || null,
          expected_on: String(form.get("expected_on") ?? "") || null,
          received_on: null,
          notes: String(form.get("notes") ?? "").trim() || null,
          created_by: null,
        },
        cleanLines.map((l) => ({
          part_id: l.part_id,
          label: l.label.trim(),
          vendor_sku: l.vendor_sku.trim() || null,
          quantity_ordered: Number.parseFloat(l.quantity_ordered) || 0,
          quantity_received: 0,
          unit_cost_cents: parseDollarsToCents(l.unit_cost_dollars),
          notes: l.notes.trim() || null,
        })),
      );
      router.push(`/admin/inventory/purchase-orders/${po.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="vendor" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Vendor *
          </label>
          <input
            id="vendor"
            list="vendor-options"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            required
            className="focus-field"
            placeholder="Vendor name"
          />
          <datalist id="vendor-options">
            {vendorOptions.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="po_number" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            PO # (optional)
          </label>
          <input id="po_number" name="po_number" className="focus-field" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="ordered_on" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Ordered on
          </label>
          <input id="ordered_on" name="ordered_on" type="date" className="focus-field" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="expected_on" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Expected on
          </label>
          <input id="expected_on" name="expected_on" type="date" className="focus-field" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Line items</p>
        <div className="flex gap-2">
          {vendor ? (
            <button
              type="button"
              className="cta-secondary text-xs"
              onClick={prefillFromReorder}
              disabled={partsForVendor.filter(needsReorder).length === 0}
            >
              Prefill low-stock ({partsForVendor.filter(needsReorder).length})
            </button>
          ) : null}
          <button type="button" className="cta-secondary text-xs" onClick={addBlankLine}>
            <Plus size={12} aria-hidden />
            Add line
          </button>
        </div>
      </div>

      {lines.length === 0 ? (
        <p className="rounded-md border border-dashed border-white/10 p-4 text-center text-sm text-muted">
          No lines yet. Pick a vendor and use "Prefill low-stock", or add lines manually.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {lines.map((l) => (
            <div key={l.key} className="rounded-md border border-white/10 bg-black/25 p-3">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_120px_auto]">
                <div className="flex flex-col gap-1">
                  <select
                    value={l.part_id ?? ""}
                    onChange={(e) => pickPart(l.key, e.target.value)}
                    className="focus-field !py-2 text-sm"
                  >
                    <option value="">— Ad-hoc / not linked —</option>
                    {partsForVendor.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                  <input
                    value={l.label}
                    onChange={(e) => updateLine(l.key, { label: e.target.value })}
                    placeholder="Label"
                    className="focus-field !py-2 text-sm"
                    required
                  />
                </div>
                <input
                  value={l.quantity_ordered}
                  onChange={(e) => updateLine(l.key, { quantity_ordered: e.target.value })}
                  type="number"
                  step="0.01"
                  className="focus-field !py-2 text-sm"
                  placeholder="Qty"
                />
                <input
                  value={l.unit_cost_dollars}
                  onChange={(e) => updateLine(l.key, { unit_cost_dollars: e.target.value })}
                  className="focus-field !py-2 text-sm"
                  placeholder="Unit $"
                />
                <button
                  type="button"
                  onClick={() => removeLine(l.key)}
                  className="rounded-md border border-white/10 bg-white/5 p-2 text-muted transition hover:border-accent hover:text-white"
                  aria-label="Remove line"
                >
                  <Trash2 size={12} aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Notes
        </label>
        <textarea id="notes" name="notes" rows={3} className="focus-field resize-y" />
      </div>

      {error ? (
        <p role="alert" className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button type="submit" className="cta-primary" disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Creating…
            </>
          ) : (
            "Create PO"
          )}
        </button>
        <button type="button" className="cta-secondary" onClick={() => router.back()} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}
