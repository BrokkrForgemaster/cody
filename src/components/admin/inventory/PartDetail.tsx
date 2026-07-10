"use client";

import { useLiveQuery } from "dexie-react-hooks";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Barcode,
  Loader2,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adjustStock,
  listBatchesForPart,
  listMovementsForPart,
  needsReorder,
  receiveStock,
  suggestedReorderQty,
} from "@/lib/offline/inventory";
import { deletePart, getPart } from "@/lib/offline/parts";
import type { MovementType, Part } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}
function parseDollarsToCents(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const num = Number.parseFloat(trimmed.replace(/[$,]/g, ""));
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100);
}

const MOVEMENT_STYLE: Record<MovementType, { label: string; className: string }> = {
  receive: { label: "Received", className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  use:     { label: "Used",     className: "border-blue-accent/40 bg-blue-accent/10 text-blue-accent" },
  adjust:  { label: "Adjusted", className: "border-cfg-orange/40 bg-cfg-orange/10 text-cfg-orange" },
  count:   { label: "Counted",  className: "border-white/20 bg-white/5 text-muted" },
  return:  { label: "Returned", className: "border-white/20 bg-white/5 text-muted" },
};

export function PartDetail({ id }: { id: string }) {
  const router = useRouter();
  const part = useLiveQuery(() => getPart(id), [id]);
  const movements = useLiveQuery(() => listMovementsForPart(id), [id]);
  const batches = useLiveQuery(() => listBatchesForPart(id), [id]);

  const [action, setAction] = useState<"receive" | "adjust" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (part === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (!part || part.deleted_at) {
    return (
      <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
        Part not found on this device.
      </div>
    );
  }

  const low = needsReorder(part);
  const suggested = low ? suggestedReorderQty(part) : 0;

  async function onDelete() {
    if (!part) return;
    setDeleting(true);
    await deletePart(part.id);
    router.push("/admin/inventory");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="panel-border rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{part.category} · {part.item_type}</p>
            <h2 className="font-heading text-3xl uppercase text-text">{part.name}</h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Barcode size={13} aria-hidden />
                {part.sku}
              </span>
              {part.barcode ? <span>Barcode {part.barcode}</span> : null}
              {part.location ? <span>{part.location}</span> : null}
              {part.vendor ? <span>{part.vendor}</span> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/inventory/${part.id}/edit`} className="cta-secondary text-xs">
              <Pencil size={14} aria-hidden />
              Edit
            </Link>
            {confirming ? (
              <>
                <button
                  type="button"
                  className="cta-primary text-xs"
                  onClick={onDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden />
                      Deleting…
                    </>
                  ) : (
                    "Confirm delete"
                  )}
                </button>
                <button type="button" className="cta-secondary text-xs" onClick={() => setConfirming(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="cta-secondary text-xs" onClick={() => setConfirming(true)}>
                <Trash2 size={14} aria-hidden />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="On hand"
            value={`${part.on_hand} ${part.uom}`}
            highlight={low ? "danger" : undefined}
            hint={`min ${part.min_qty}${part.par_qty ? ` · par ${part.par_qty}` : ""}`}
            icon={low ? AlertTriangle : Package}
          />
          <Stat label="Cost" value={formatCents(part.cost_cents)} hint={`last ${formatCents(part.last_cost_cents)}`} />
          <Stat label="Price" value={formatCents(part.price_cents)} />
          <Stat
            label="Reorder"
            value={low ? `${suggested} ${part.uom}` : "OK"}
            highlight={low ? "warning" : "ok"}
            hint={part.lead_time_days ? `lead ${part.lead_time_days}d` : undefined}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className={cn(
              "cta-secondary text-xs",
              action === "receive" && "!border-blue-accent !text-white",
            )}
            onClick={() => setAction(action === "receive" ? null : "receive")}
          >
            <ArrowDown size={14} aria-hidden />
            Receive
          </button>
          <button
            type="button"
            className={cn(
              "cta-secondary text-xs",
              action === "adjust" && "!border-blue-accent !text-white",
            )}
            onClick={() => setAction(action === "adjust" ? null : "adjust")}
          >
            <ArrowUp size={14} aria-hidden />
            Adjust
          </button>
        </div>

        {action === "receive" ? (
          <ReceiveForm part={part} onDone={() => setAction(null)} />
        ) : null}
        {action === "adjust" ? (
          <AdjustForm part={part} onDone={() => setAction(null)} />
        ) : null}
      </div>

      {batches && batches.length > 0 ? (
        <div className="panel-border rounded-lg p-6">
          <h3 className="font-heading text-xl uppercase text-text">Batches</h3>
          <ul className="mt-3 divide-y divide-white/5">
            {batches.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-semibold text-text">
                    #{b.batch_number}
                    <span className="ml-2 text-xs text-muted">
                      Received {new Date(b.received_on + "T00:00:00").toLocaleDateString()}
                      {b.expires_on
                        ? ` · Expires ${new Date(b.expires_on + "T00:00:00").toLocaleDateString()}`
                        : ""}
                    </span>
                  </p>
                </div>
                <div className="text-right text-xs text-muted">
                  {b.quantity_remaining} / {b.quantity_received} {part.uom} remaining
                  {b.unit_cost_cents !== null ? ` · ${formatCents(b.unit_cost_cents)}/${part.uom}` : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="panel-border rounded-lg p-6">
        <h3 className="font-heading text-xl uppercase text-text">Movement history</h3>
        {movements === undefined ? (
          <p className="mt-3 text-sm text-muted">Loading…</p>
        ) : movements.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No movements yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5">
            {movements.map((m) => {
              const style = MOVEMENT_STYLE[m.movement_type];
              return (
                <li key={m.id} className="flex flex-wrap items-start justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                          style.className,
                        )}
                      >
                        {style.label}
                      </span>
                      {m.reason ? (
                        <span className="text-xs text-muted">{m.reason}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(m.occurred_at).toLocaleString()}
                      {m.job_id ? (
                        <>
                          {" · "}
                          <Link href={`/admin/jobs/${m.job_id}`} className="hover:text-white">
                            Job
                          </Link>
                        </>
                      ) : null}
                    </p>
                    {m.notes ? <p className="mt-1 text-xs text-muted">{m.notes}</p> : null}
                  </div>
                  <div className={cn(
                    "text-right text-sm font-semibold",
                    m.quantity >= 0 ? "text-emerald-300" : "text-accent",
                  )}>
                    {m.quantity >= 0 ? "+" : ""}
                    {m.quantity} {part.uom}
                    {m.unit_cost_cents !== null ? (
                      <div className="text-[10px] text-muted">@ {formatCents(m.unit_cost_cents)}</div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  highlight,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: "danger" | "warning" | "ok";
  icon?: typeof Package;
}) {
  const Icon = icon;
  return (
    <div
      className={cn(
        "rounded-md border p-4",
        highlight === "danger" && "border-accent/40 bg-accent/5",
        highlight === "warning" && "border-cfg-orange/40 bg-cfg-orange/5",
        !highlight && "border-white/10 bg-white/5",
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {Icon ? <Icon size={12} aria-hidden /> : null}
        {label}
      </div>
      <p className="mt-1 font-heading text-2xl uppercase text-text">{value}</p>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function ReceiveForm({ part, onDone }: { part: Part; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showBatch = part.item_type === "consumable";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const qty = Number.parseFloat(String(form.get("quantity") ?? "0"));
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Quantity must be greater than 0.");
      setBusy(false);
      return;
    }
    try {
      await receiveStock({
        partId: part.id,
        quantity: qty,
        unitCostCents: parseDollarsToCents(String(form.get("unit_cost") ?? "")),
        batchNumber: String(form.get("batch_number") ?? "").trim() || null,
        expiresOn: String(form.get("expires_on") ?? "") || null,
        notes: String(form.get("notes") ?? "").trim() || null,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
        Receive stock
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <MiniField label={`Quantity (${part.uom})`} name="quantity" type="number" step="0.01" required />
        <MiniField label="Unit cost ($)" name="unit_cost" placeholder={`e.g. ${(part.cost_cents / 100).toFixed(2)}`} />
        {showBatch ? (
          <>
            <MiniField label="Batch #" name="batch_number" placeholder="AUTO if blank" />
            <MiniField label="Expires (optional)" name="expires_on" type="date" />
          </>
        ) : null}
      </div>
      <textarea
        name="notes"
        rows={2}
        placeholder="Notes"
        className="focus-field mt-3 resize-y text-sm"
      />
      {error ? (
        <p role="alert" className="mt-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button type="submit" className="cta-primary text-xs" disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={12} className="animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Receive"
          )}
        </button>
        <button type="button" className="cta-secondary text-xs" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AdjustForm({ part, onDone }: { part: Part; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const delta = Number.parseFloat(String(form.get("delta") ?? "0"));
    if (!Number.isFinite(delta) || delta === 0) {
      setError("Delta must be a non-zero number (positive to add, negative to remove).");
      setBusy(false);
      return;
    }
    try {
      await adjustStock({
        partId: part.id,
        delta,
        reason: String(form.get("reason") ?? "").trim() || null,
        notes: String(form.get("notes") ?? "").trim() || null,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cfg-orange">
        Adjust stock
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <MiniField label={`Delta (${part.uom}) — signed`} name="delta" type="number" step="0.01" required placeholder="e.g. -1" />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Reason</label>
          <select name="reason" defaultValue="" className="focus-field !py-2 text-sm">
            <option value="">—</option>
            <option value="damage">Damage</option>
            <option value="expired">Expired</option>
            <option value="lost">Lost</option>
            <option value="mispick">Mispick</option>
            <option value="return_to_vendor">Return to vendor</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <textarea name="notes" rows={2} placeholder="Notes" className="focus-field mt-3 resize-y text-sm" />
      {error ? (
        <p role="alert" className="mt-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button type="submit" className="cta-primary text-xs" disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={12} className="animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Adjust"
          )}
        </button>
        <button type="button" className="cta-secondary text-xs" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function MiniField({
  label,
  name,
  type = "text",
  required,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        step={step}
        className="focus-field !py-2 text-sm"
      />
    </div>
  );
}
