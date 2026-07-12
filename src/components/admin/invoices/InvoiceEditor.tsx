"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import {
  deleteInvoice,
  listCustomerVehicles,
  saveInvoice,
} from "@/app/(admin)/admin/invoices/actions";
import type { FullInvoice, InvoiceStatus } from "@/app/(admin)/admin/invoices/actions";
import type { Vehicle } from "@/lib/supabase/types";

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
};

type LineItem = {
  localId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amountCents: number;
  taxable: boolean;
};

const TAX_RATE_BPS = 600; // 6% Kentucky

function parseDollars(v: string): number {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function currency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

function computeLineCents(quantity: string, unitPrice: string): number {
  const qty = parseFloat(quantity) || 0;
  const price = parseDollars(unitPrice);
  return Math.round(qty * price);
}

function computeTotals(
  items: LineItem[],
  shopFeeCents: number,
  shopFeeTaxable: boolean,
): { subtotalCents: number; taxCents: number; totalCents: number } {
  const subtotalCents = items.reduce((s, i) => s + i.amountCents, 0);
  const taxableBase =
    items.filter((i) => i.taxable).reduce((s, i) => s + i.amountCents, 0) +
    (shopFeeTaxable ? shopFeeCents : 0);
  const taxCents = Math.round((taxableBase * TAX_RATE_BPS) / 10000);
  return { subtotalCents, taxCents, totalCents: subtotalCents + shopFeeCents + taxCents };
}

let localIdCounter = 0;
function nextLocalId() {
  return `li-${++localIdCounter}`;
}

const INPUT =
  "w-full rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text focus:border-blue-accent/60 focus:outline-none placeholder:text-muted/50";
const LABEL = "mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-muted";

type Props = {
  invoice: FullInvoice;
  customers: Customer[];
};

export function InvoiceEditor({ invoice, customers }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Header fields
  const [status, setStatus] = useState<InvoiceStatus>(invoice.status);
  const [issueDate, setIssueDate] = useState(invoice.issue_date);
  const [dueDate, setDueDate] = useState(invoice.due_date ?? "");

  // Customer / vehicle
  const [customerId, setCustomerId] = useState(invoice.customer_id ?? "");
  const [vehicleId, setVehicleId] = useState(invoice.vehicle_id ?? "");
  const [jobId, setJobId] = useState(invoice.job_id ?? "");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!customerId) {
      setVehicles([]);
      setVehicleId("");
      return;
    }
    listCustomerVehicles(customerId).then((v) => {
      setVehicles(v);
      if (!v.find((x) => x.id === vehicleId)) setVehicleId("");
    });
  }, [customerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Line items
  const [items, setItems] = useState<LineItem[]>(() =>
    invoice.line_items.length > 0
      ? invoice.line_items.map((li) => ({
          localId: nextLocalId(),
          description: li.description,
          quantity: String(li.quantity),
          unitPrice: formatCents(li.unit_price_cents),
          amountCents: li.amount_cents,
          taxable: li.taxable,
        }))
      : [
          {
            localId: nextLocalId(),
            description: "",
            quantity: "1",
            unitPrice: "0.00",
            amountCents: 0,
            taxable: true,
          },
        ],
  );

  // Shop fee
  const [shopFeeLabel, setShopFeeLabel] = useState(invoice.shop_fee_label);
  const [shopFeeStr, setShopFeeStr] = useState(formatCents(invoice.shop_fee_cents));
  const [shopFeeTaxable, setShopFeeTaxable] = useState(invoice.shop_fee_taxable);

  // Notes
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [internalNotes, setInternalNotes] = useState(invoice.internal_notes ?? "");

  function updateItem(localId: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) return item;
        const next = { ...item, ...patch };
        next.amountCents = computeLineCents(next.quantity, next.unitPrice);
        return next;
      }),
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        localId: nextLocalId(),
        description: "",
        quantity: "1",
        unitPrice: "0.00",
        amountCents: 0,
        taxable: true,
      },
    ]);
  }

  function removeItem(localId: string) {
    setItems((prev) => prev.filter((i) => i.localId !== localId));
  }

  const shopFeeCents = parseDollars(shopFeeStr);
  const { subtotalCents, taxCents, totalCents } = computeTotals(items, shopFeeCents, shopFeeTaxable);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await saveInvoice({
          id: invoice.id,
          customerId,
          vehicleId,
          jobId,
          status,
          issueDate,
          dueDate,
          notes,
          internalNotes,
          shopFeeLabel,
          shopFeeCents,
          shopFeeTaxable,
          subtotalCents,
          taxCents,
          totalCents,
          items: items.map((item, i) => ({
            description: item.description,
            quantity: parseFloat(item.quantity) || 0,
            unitPriceCents: parseDollars(item.unitPrice),
            amountCents: item.amountCents,
            taxable: item.taxable,
            sortOrder: i,
          })),
        });
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed.");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete ${invoice.invoice_number}? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteInvoice(invoice.id);
      router.push("/admin/invoices");
    });
  }

  const isVoid = invoice.status === "void";

  return (
    <div className="space-y-6">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="panel-border flex flex-wrap items-center justify-between gap-4 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-semibold text-text">
            {invoice.invoice_number}
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            disabled={isVoid}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-text focus:border-blue-accent/60 focus:outline-none disabled:opacity-50"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="void">Void</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/invoice/${invoice.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted transition hover:text-blue-accent"
          >
            <ExternalLink size={12} aria-hidden />
            View / print
          </Link>

          {error && <p className="text-xs text-accent">{error}</p>}
          {saved && <p className="text-xs text-emerald-400">Saved</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={pending || isVoid}
            className="cta-primary text-xs disabled:opacity-50"
          >
            {pending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
            Save
          </button>
        </div>
      </div>

      {/* ── Dates ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Issue date</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            disabled={isVoid}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isVoid}
            className={INPUT}
          />
        </div>
      </div>

      {/* ── Customer / Vehicle / Job ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={LABEL}>Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            disabled={isVoid}
            className={INPUT}
          >
            <option value="">— none —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.last_name}, {c.first_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Vehicle</label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            disabled={isVoid || !customerId}
            className={INPUT}
          >
            <option value="">— none —</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year} {v.make} {v.model}
                {v.trim ? ` ${v.trim}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Job ID (optional)</label>
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="paste job UUID"
            disabled={isVoid}
            className={INPUT}
          />
        </div>
      </div>

      {/* ── Line items ───────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">
          Line items
        </h2>
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                <th className="px-3 py-2">Description</th>
                <th className="w-20 px-3 py-2">Qty</th>
                <th className="w-28 px-3 py-2">Unit price</th>
                <th className="w-28 px-3 py-2 text-right">Amount</th>
                <th className="w-16 px-3 py-2 text-center">Tax</th>
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {items.map((item) => (
                <tr key={item.localId}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.localId, { description: e.target.value })
                      }
                      placeholder="Description"
                      disabled={isVoid}
                      className={INPUT}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.localId, { quantity: e.target.value })}
                      disabled={isVoid}
                      className={INPUT}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.localId, { unitPrice: e.target.value })}
                      onBlur={(e) =>
                        updateItem(item.localId, {
                          unitPrice: formatCents(parseDollars(e.target.value)),
                        })
                      }
                      disabled={isVoid}
                      className={INPUT}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-text">
                    {currency(item.amountCents)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.taxable}
                      onChange={(e) => updateItem(item.localId, { taxable: e.target.checked })}
                      disabled={isVoid}
                      className="accent-blue-accent"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeItem(item.localId)}
                      disabled={isVoid || items.length === 1}
                      className="text-muted transition hover:text-accent disabled:opacity-30"
                      aria-label="Remove line"
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isVoid && (
            <div className="border-t border-white/10 p-2">
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted transition hover:text-blue-accent"
              >
                <Plus size={12} aria-hidden />
                Add line
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Shop fee + Totals ─────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shop fee */}
        <div className="panel-border rounded-lg p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">
            Shop fee
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Label</label>
              <input
                type="text"
                value={shopFeeLabel}
                onChange={(e) => setShopFeeLabel(e.target.value)}
                disabled={isVoid}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Amount ($)</label>
              <input
                type="text"
                inputMode="decimal"
                value={shopFeeStr}
                onChange={(e) => setShopFeeStr(e.target.value)}
                onBlur={(e) => setShopFeeStr(formatCents(parseDollars(e.target.value)))}
                disabled={isVoid}
                className={INPUT}
              />
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={shopFeeTaxable}
              onChange={(e) => setShopFeeTaxable(e.target.checked)}
              disabled={isVoid}
              className="accent-blue-accent"
            />
            Taxable
          </label>
        </div>

        {/* Totals */}
        <div className="panel-border rounded-lg p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">
            Totals
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd>{currency(subtotalCents)}</dd>
            </div>
            {shopFeeCents > 0 && (
              <div className="flex justify-between text-muted">
                <dt>{shopFeeLabel || "Shop fee"}</dt>
                <dd>{currency(shopFeeCents)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <dt>Tax (6% KY)</dt>
              <dd>{currency(taxCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-text">
              <dt>Total</dt>
              <dd>{currency(totalCents)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* ── Notes ────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Customer-visible notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Appears on the printed invoice…"
            disabled={isVoid}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Internal notes</label>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={4}
            placeholder="Staff only, not shown to customer…"
            disabled={isVoid}
            className={INPUT}
          />
        </div>
      </div>

      {/* ── Danger zone ──────────────────────────────────────────── */}
      {!isVoid && (
        <div className="border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted transition hover:text-accent disabled:opacity-50"
          >
            Delete invoice
          </button>
        </div>
      )}
    </div>
  );
}
