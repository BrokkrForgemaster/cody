"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Activity, ArrowDownRight, ArrowUpRight, Snowflake } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { lastMovementByPart, usageByPart } from "@/lib/offline/inventory";
import { listParts } from "@/lib/offline/parts";
import type { Part } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const WINDOW_OPTIONS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
] as const;

function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function daysBetween(a: string | undefined, b: Date): number {
  if (!a) return Infinity;
  const then = new Date(a);
  return Math.floor((b.getTime() - then.getTime()) / 86_400_000);
}

export function InventoryAnalytics() {
  const [windowDays, setWindowDays] = useState<7 | 30 | 90>(30);
  const parts = useLiveQuery(() => listParts(true), []);
  const usage = useLiveQuery(() => usageByPart(windowDays), [windowDays]);
  const last = useLiveQuery(() => lastMovementByPart(), []);

  const now = useMemo(() => new Date(), []);

  const enriched = useMemo(() => {
    if (!parts) return [];
    return parts.map((p) => {
      const used = usage?.get(p.id) ?? 0;
      const lastTs = last?.get(p.id);
      const daysSince = daysBetween(lastTs, now);
      const usageValue = used * (p.cost_cents ?? 0);
      return { part: p, used, lastTs, daysSince, usageValue };
    });
  }, [parts, usage, last, now]);

  const topMovers = useMemo(
    () => [...enriched].filter((e) => e.used > 0).sort((a, b) => b.used - a.used).slice(0, 8),
    [enriched],
  );

  const deadStock = useMemo(
    () =>
      [...enriched]
        .filter(
          (e) =>
            (e.daysSince === Infinity || e.daysSince >= 90) && Number(e.part.on_hand) > 0,
        )
        .sort((a, b) => (b.daysSince === Infinity ? 1 : 0) - (a.daysSince === Infinity ? 1 : 0) || b.daysSince - a.daysSince)
        .slice(0, 12),
    [enriched],
  );

  const summary = useMemo(() => {
    let totalOnHandValueCents = 0;
    let totalUsageValueCents = 0;
    let activeCount = 0;
    let deadCount = 0;
    for (const e of enriched) {
      const p = e.part;
      totalOnHandValueCents += Number(p.on_hand) * (p.cost_cents ?? 0);
      totalUsageValueCents += e.usageValue;
      if (e.used > 0) activeCount += 1;
      if ((e.daysSince === Infinity || e.daysSince >= 90) && Number(p.on_hand) > 0) deadCount += 1;
    }
    return { totalOnHandValueCents, totalUsageValueCents, activeCount, deadCount };
  }, [enriched]);

  const loading = parts === undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-md border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.14em]">
          {WINDOW_OPTIONS.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => setWindowDays(w.value)}
              className={cn(
                "rounded px-3 py-1.5 transition",
                windowDays === w.value ? "bg-accent text-white" : "text-muted hover:text-white",
              )}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          label="Inventory value"
          value={formatCents(summary.totalOnHandValueCents)}
          hint="on-hand × avg cost"
        />
        <Card
          label={`Usage value (${windowDays}d)`}
          value={formatCents(summary.totalUsageValueCents)}
          hint="used × avg cost"
        />
        <Card
          label="Active SKUs"
          value={String(summary.activeCount)}
          hint={`with movement in ${windowDays}d`}
        />
        <Card
          label="Dead stock"
          value={String(summary.deadCount)}
          hint="on-hand & no movement 90d+"
          highlight={summary.deadCount > 0 ? "warning" : undefined}
        />
      </section>

      <section className="panel-border rounded-lg p-6" aria-label="Top movers">
        <div className="flex items-center gap-2">
          <ArrowUpRight size={16} className="text-emerald-300" aria-hidden />
          <h3 className="font-heading text-xl uppercase text-text">Top movers</h3>
          <span className="text-xs text-muted">by units used in {windowDays}d</span>
        </div>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Loading…</p>
        ) : topMovers.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No usage recorded yet in this window. Log part usage on a job (or a
            manual adjustment) and it will show up here.
          </p>
        ) : (
          <MoversTable rows={topMovers.map((r) => ({ part: r.part, used: r.used, value: r.usageValue }))} />
        )}
      </section>

      <section className="panel-border rounded-lg p-6" aria-label="Dead stock">
        <div className="flex items-center gap-2">
          <Snowflake size={16} className="text-blue-accent" aria-hidden />
          <h3 className="font-heading text-xl uppercase text-text">Dead stock</h3>
          <span className="text-xs text-muted">on-hand with no movement in 90+ days</span>
        </div>
        {loading ? (
          <p className="mt-3 text-sm text-muted">Loading…</p>
        ) : deadStock.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing dead. Every SKU with stock has moved in the last 90 days.</p>
        ) : (
          <DeadStockTable rows={deadStock} />
        )}
      </section>
    </div>
  );
}

function Card({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-4",
        highlight === "warning"
          ? "border-cfg-orange/40 bg-cfg-orange/5"
          : "border-white/10 bg-white/5",
      )}
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        <Activity size={11} aria-hidden />
        {label}
      </p>
      <p className="mt-1 font-heading text-2xl uppercase text-text">{value}</p>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function MoversTable({ rows }: { rows: { part: Part; used: number; value: number }[] }) {
  return (
    <table className="mt-3 w-full text-sm">
      <thead className="text-xs uppercase tracking-[0.14em] text-muted">
        <tr>
          <th className="px-2 py-2 text-left font-semibold">Part</th>
          <th className="px-2 py-2 text-right font-semibold">Used</th>
          <th className="hidden px-2 py-2 text-right font-semibold sm:table-cell">Value</th>
          <th className="px-2 py-2 text-right font-semibold">On hand</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {rows.map(({ part, used, value }) => (
          <tr key={part.id}>
            <td className="px-2 py-2">
              <Link
                href={`/admin/inventory/${part.id}`}
                className="text-text hover:text-blue-accent"
              >
                {part.name}
                <span className="ml-2 text-xs text-muted">{part.sku}</span>
              </Link>
            </td>
            <td className="px-2 py-2 text-right font-semibold text-emerald-300">
              {used.toFixed(2)} {part.uom}
            </td>
            <td className="hidden px-2 py-2 text-right sm:table-cell text-muted">
              {value ? `$${(value / 100).toFixed(2)}` : "—"}
            </td>
            <td className="px-2 py-2 text-right text-muted">
              {part.on_hand} {part.uom}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DeadStockTable({
  rows,
}: {
  rows: { part: Part; lastTs?: string; daysSince: number }[];
}) {
  return (
    <table className="mt-3 w-full text-sm">
      <thead className="text-xs uppercase tracking-[0.14em] text-muted">
        <tr>
          <th className="px-2 py-2 text-left font-semibold">Part</th>
          <th className="hidden px-2 py-2 text-right font-semibold sm:table-cell">Last movement</th>
          <th className="px-2 py-2 text-right font-semibold">On hand</th>
          <th className="hidden px-2 py-2 text-right font-semibold md:table-cell">Value</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {rows.map(({ part, lastTs, daysSince }) => (
          <tr key={part.id}>
            <td className="px-2 py-2">
              <Link
                href={`/admin/inventory/${part.id}`}
                className="text-text hover:text-blue-accent"
              >
                {part.name}
                <span className="ml-2 text-xs text-muted">{part.sku}</span>
              </Link>
            </td>
            <td className="hidden px-2 py-2 text-right sm:table-cell text-muted">
              {lastTs
                ? `${new Date(lastTs).toLocaleDateString()} · ${daysSince}d ago`
                : (
                  <span className="inline-flex items-center gap-1">
                    <ArrowDownRight size={11} aria-hidden /> never
                  </span>
                )}
            </td>
            <td className="px-2 py-2 text-right text-text">
              {part.on_hand} {part.uom}
            </td>
            <td className="hidden px-2 py-2 text-right md:table-cell text-muted">
              {`$${((Number(part.on_hand) * (part.cost_cents ?? 0)) / 100).toFixed(2)}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
