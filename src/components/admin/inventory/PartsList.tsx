"use client";

import { useLiveQuery } from "dexie-react-hooks";
import {
  AlertTriangle,
  Barcode,
  Package,
  Plus,
  Printer,
  ScanLine,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { listParts } from "@/lib/offline/parts";
import { needsReorder } from "@/lib/offline/inventory";
import type { PartCategory, PartItemType } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: PartCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lighting", label: "Lighting" },
  { value: "powder", label: "Powder" },
  { value: "paint", label: "Paint" },
  { value: "coating", label: "Coating" },
  { value: "fabrication", label: "Fabrication" },
  { value: "consumable", label: "Consumable" },
  { value: "tool", label: "Tool" },
  { value: "other", label: "Other" },
];

const TYPE_STYLE: Record<PartItemType, string> = {
  part: "border-blue-accent/40 bg-blue-accent/10 text-blue-accent",
  consumable: "border-cfg-orange/40 bg-cfg-orange/10 text-cfg-orange",
  tool: "border-white/20 bg-white/5 text-muted",
  kit: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
};

function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export function PartsList() {
  const parts = useLiveQuery(() => listParts(true), []);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<PartCategory | "all">("all");
  const [onlyLow, setOnlyLow] = useState(false);

  const filtered = useMemo(() => {
    if (!parts) return [];
    const needle = q.trim().toLowerCase();
    return parts.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (onlyLow && !needsReorder(p)) return false;
      if (!needle) return true;
      const hay = [p.sku, p.barcode ?? "", p.name, p.vendor ?? "", p.location ?? ""]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [parts, q, category, onlyLow]);

  const loading = parts === undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search SKU, barcode, name, vendor, location…"
            className="focus-field !py-2 pl-9 text-sm"
            aria-label="Search parts"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/inventory/scan" className="cta-secondary text-xs">
            <ScanLine size={14} aria-hidden />
            Scan
          </Link>
          <Link href="/admin/inventory/labels" className="cta-secondary text-xs">
            <Printer size={14} aria-hidden />
            Print labels
          </Link>
          <Link href="/admin/inventory/new" className="cta-primary text-xs">
            <Plus size={14} aria-hidden />
            New part
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-md border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.12em]">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={cn(
                "rounded px-2.5 py-1.5 transition",
                category === c.value ? "bg-accent text-white" : "text-muted hover:text-white",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <input
            type="checkbox"
            checked={onlyLow}
            onChange={(e) => setOnlyLow(e.target.checked)}
            className="accent-accent"
          />
          Low stock only
        </label>
      </div>

      {loading ? (
        <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
          Loading…
        </div>
      ) : parts.length === 0 ? (
        <div className="panel-border flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <Package size={28} className="text-blue-accent" aria-hidden />
          <p className="font-heading text-2xl uppercase text-text">No parts yet</p>
          <p className="max-w-md text-sm text-muted">
            Add your first SKU. Each part tracks cost, price, on-hand, min/par, vendor, and
            (optionally) a barcode you can print labels for.
          </p>
          <Link href="/admin/inventory/new" className="cta-primary mt-2">
            <Plus size={14} aria-hidden />
            New part
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
          No parts match the current filters.
        </div>
      ) : (
        <div className="panel-border overflow-hidden rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">Part</th>
                <th className="hidden px-3 py-3 text-left font-semibold sm:table-cell">Type</th>
                <th className="hidden px-3 py-3 text-right font-semibold md:table-cell">Cost</th>
                <th className="hidden px-3 py-3 text-right font-semibold md:table-cell">Price</th>
                <th className="px-3 py-3 text-right font-semibold">On hand</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => {
                const low = needsReorder(p);
                return (
                  <tr key={p.id} className="transition hover:bg-white/5">
                    <td className="px-3 py-3">
                      <Link
                        href={`/admin/inventory/${p.id}`}
                        className="flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-text hover:text-blue-accent">
                          {p.name}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted">
                          <Barcode size={11} aria-hidden />
                          {p.sku}
                          {p.location ? <span>· {p.location}</span> : null}
                          {p.vendor ? <span>· {p.vendor}</span> : null}
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-3 py-3 sm:table-cell">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                          TYPE_STYLE[p.item_type],
                        )}
                      >
                        {p.item_type}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3 text-right md:table-cell">
                      {formatCents(p.cost_cents)}
                    </td>
                    <td className="hidden px-3 py-3 text-right md:table-cell">
                      {formatCents(p.price_cents)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {low ? (
                          <AlertTriangle
                            size={13}
                            className="text-accent"
                            aria-label="Low stock"
                          />
                        ) : null}
                        <span
                          className={cn(
                            "font-semibold",
                            low ? "text-accent" : "text-text",
                          )}
                        >
                          {p.on_hand} {p.uom}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted">min {p.min_qty}</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/admin/inventory/${p.id}`}
                        className="text-xs text-muted hover:text-blue-accent"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
