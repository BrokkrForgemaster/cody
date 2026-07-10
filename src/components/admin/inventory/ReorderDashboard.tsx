"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, ExternalLink, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { needsReorder, suggestedReorderQty, usageByPart } from "@/lib/offline/inventory";
import { listParts } from "@/lib/offline/parts";
import type { Part } from "@/lib/supabase/types";

function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function urgency(part: Part): number {
  const onHand = Number(part.on_hand) || 0;
  const min = Number(part.min_qty) || 0;
  if (min <= 0) return onHand <= 0 ? 100 : 0;
  return Math.max(0, ((min - onHand) / min) * 100);
}

export function ReorderDashboard() {
  const parts = useLiveQuery(() => listParts(true), []);
  const usage = useLiveQuery(() => usageByPart(30), []);

  const grouped = useMemo(() => {
    if (!parts) return [];
    const rows = parts.filter((p) => needsReorder(p));
    rows.sort((a, b) => urgency(b) - urgency(a));

    const byVendor = new Map<string, Part[]>();
    for (const p of rows) {
      const key = p.vendor?.trim() || "— No vendor —";
      const list = byVendor.get(key) ?? [];
      list.push(p);
      byVendor.set(key, list);
    }
    return [...byVendor.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [parts]);

  const totalItems = grouped.reduce((sum, [, items]) => sum + items.length, 0);
  const loading = parts === undefined;

  const estimateTotalCents = useMemo(() => {
    let total = 0;
    for (const [, items] of grouped) {
      for (const p of items) {
        const qty = suggestedReorderQty(p);
        total += qty * (p.cost_cents ?? 0);
      }
    }
    return total;
  }, [grouped]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.18em] text-muted">
          {loading
            ? "Loading…"
            : totalItems === 0
              ? "Nothing to reorder"
              : `${totalItems} item(s) below min · estimated ${formatCents(estimateTotalCents)}`}
        </div>
      </div>

      {loading ? (
        <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">Loading…</div>
      ) : totalItems === 0 ? (
        <div className="panel-border flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <RotateCcw size={26} className="text-emerald-300" aria-hidden />
          <p className="font-heading text-2xl uppercase text-text">Stock is healthy</p>
          <p className="max-w-md text-sm text-muted">
            Everything is at or above its minimum. When a part drops below its min qty, it will
            show up here with a suggested order-to-par quantity.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([vendor, items]) => {
            const vendorCents = items.reduce(
              (sum, p) => sum + suggestedReorderQty(p) * (p.cost_cents ?? 0),
              0,
            );
            return (
              <section
                key={vendor}
                className="panel-border overflow-hidden rounded-lg"
                aria-label={`Reorder from ${vendor}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg uppercase tracking-wide text-text">
                      {vendor}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold text-muted">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-muted">
                      Estimated {formatCents(vendorCents)}
                    </p>
                    <Link
                      href={`/admin/inventory/purchase-orders/new?vendor=${encodeURIComponent(vendor)}`}
                      className="cta-secondary text-xs"
                    >
                      Create PO
                    </Link>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Part</th>
                      <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell">On hand</th>
                      <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell">Min / Par</th>
                      <th className="hidden px-3 py-2 text-right font-semibold md:table-cell">Used (30d)</th>
                      <th className="px-3 py-2 text-right font-semibold">Suggested</th>
                      <th className="hidden px-3 py-2 text-right font-semibold md:table-cell">Est cost</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((p) => {
                      const qty = suggestedReorderQty(p);
                      const cost = qty * (p.cost_cents ?? 0);
                      const used = usage?.get(p.id) ?? 0;
                      return (
                        <tr key={p.id}>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle
                                size={12}
                                className="shrink-0 text-accent"
                                aria-hidden
                              />
                              <div className="min-w-0">
                                <Link
                                  href={`/admin/inventory/${p.id}`}
                                  className="truncate font-semibold text-text hover:text-blue-accent"
                                >
                                  {p.name}
                                </Link>
                                <p className="text-xs text-muted">
                                  {p.sku}
                                  {p.vendor_sku ? ` · vendor SKU ${p.vendor_sku}` : ""}
                                  {p.lead_time_days ? ` · lead ${p.lead_time_days}d` : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-3 py-2 text-right sm:table-cell">
                            {p.on_hand} {p.uom}
                          </td>
                          <td className="hidden px-3 py-2 text-right sm:table-cell text-xs text-muted">
                            {p.min_qty} / {p.par_qty ?? "—"}
                          </td>
                          <td className="hidden px-3 py-2 text-right md:table-cell text-xs text-muted">
                            {used ? `${used.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-text">
                            {qty} {p.uom}
                          </td>
                          <td className="hidden px-3 py-2 text-right md:table-cell text-muted">
                            {formatCents(cost)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Link
                              href={`/admin/inventory/${p.id}`}
                              className="inline-flex items-center gap-1 text-xs text-muted hover:text-blue-accent"
                            >
                              Open <ExternalLink size={11} aria-hidden />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
