"use client";

import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowDown,
  CheckCircle2,
  Loader2,
  Send,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  deletePurchaseOrder,
  getPurchaseOrder,
  listItemsForPO,
  receiveAgainstItem,
  setPurchaseOrderStatus,
} from "@/lib/offline/purchaseOrders";
import type { PurchaseOrderStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<PurchaseOrderStatus, string> = {
  draft: "border-white/20 bg-white/5 text-muted",
  sent: "border-blue-accent/40 bg-blue-accent/10 text-blue-accent",
  partial_received: "border-cfg-orange/40 bg-cfg-orange/10 text-cfg-orange",
  received: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-white/10 bg-white/5 text-muted",
};

function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

export function PurchaseOrderDetail({ id }: { id: string }) {
  const router = useRouter();
  const po = useLiveQuery(() => getPurchaseOrder(id), [id]);
  const items = useLiveQuery(() => listItemsForPO(id), [id]);

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (po === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (!po || po.deleted_at) {
    return (
      <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
        PO not found on this device.
      </div>
    );
  }

  const totalCents = (items ?? []).reduce(
    (s, i) => s + (i.unit_cost_cents ?? 0) * (i.quantity_ordered ?? 0),
    0,
  );
  const totalReceived = (items ?? []).reduce((s, i) => s + (i.quantity_received ?? 0), 0);
  const totalOrdered = (items ?? []).reduce((s, i) => s + (i.quantity_ordered ?? 0), 0);

  async function markSent() {
    await setPurchaseOrderStatus(po!.id, "sent");
  }
  async function cancelPO() {
    await setPurchaseOrderStatus(po!.id, "cancelled");
  }
  async function onDelete() {
    setDeleting(true);
    await deletePurchaseOrder(po!.id);
    router.push("/admin/inventory/purchase-orders");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="panel-border rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="eyebrow">
                {po.po_number ? `PO ${po.po_number}` : "Purchase order"}
              </p>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                  STATUS_STYLE[po.status],
                )}
              >
                {po.status.replace("_", " ")}
              </span>
            </div>
            <h2 className="mt-1 font-heading text-3xl uppercase text-text">{po.vendor}</h2>
            <p className="mt-1 text-sm text-muted">
              {po.ordered_on
                ? `Ordered ${new Date(po.ordered_on + "T00:00:00").toLocaleDateString()}`
                : "Not yet ordered"}
              {po.expected_on
                ? ` · Expected ${new Date(po.expected_on + "T00:00:00").toLocaleDateString()}`
                : ""}
              {po.received_on
                ? ` · Received ${new Date(po.received_on + "T00:00:00").toLocaleDateString()}`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {po.status === "draft" ? (
              <button type="button" className="cta-primary text-xs" onClick={markSent}>
                <Send size={14} aria-hidden />
                Mark sent
              </button>
            ) : null}
            {po.status !== "cancelled" && po.status !== "received" ? (
              <button type="button" className="cta-secondary text-xs" onClick={cancelPO}>
                <X size={14} aria-hidden />
                Cancel
              </button>
            ) : null}
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
        {po.notes ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{po.notes}</p>
        ) : null}
      </div>

      <div className="panel-border overflow-hidden rounded-lg">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="font-heading text-lg uppercase text-text">Line items</h3>
          <p className="text-xs text-muted">
            {totalReceived} / {totalOrdered} received · Total {formatCents(totalCents)}
          </p>
        </div>
        {items === undefined ? (
          <p className="p-6 text-center text-sm text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">No items on this PO.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((item) => (
              <ReceiveRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ReceiveRow({ item }: { item: {
  id: string;
  part_id: string | null;
  label: string;
  vendor_sku: string | null;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost_cents: number | null;
  notes: string | null;
} }) {
  const [qty, setQty] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = Math.max(0, item.quantity_ordered - item.quantity_received);
  const complete = remaining <= 0;

  async function onReceive() {
    setError(null);
    const parsed = Number.parseFloat(qty);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Quantity must be positive.");
      return;
    }
    setBusy(true);
    try {
      await receiveAgainstItem({ itemId: item.id, quantity: parsed });
      setQty("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.part_id ? (
            <Link
              href={`/admin/inventory/${item.part_id}`}
              className="font-semibold text-text hover:text-blue-accent"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-text">{item.label}</span>
          )}
          {complete ? (
            <CheckCircle2 size={13} className="text-emerald-300" aria-hidden />
          ) : null}
        </div>
        <p className="text-xs text-muted">
          {item.vendor_sku ? `vendor SKU ${item.vendor_sku} · ` : ""}
          {item.quantity_received} / {item.quantity_ordered} received
          {item.unit_cost_cents !== null
            ? ` · ${(item.unit_cost_cents / 100).toFixed(2)}/each`
            : ""}
        </p>
      </div>
      {complete ? null : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            step="0.01"
            min={0}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder={`Receive up to ${remaining}`}
            className="focus-field !w-40 !py-2 text-sm"
            aria-label="Quantity to receive"
          />
          <button
            type="button"
            className="cta-primary text-xs"
            onClick={onReceive}
            disabled={busy || !qty || !item.part_id}
            title={!item.part_id ? "This line isn't linked to a part, so receiving isn't possible." : undefined}
          >
            {busy ? (
              <>
                <Loader2 size={12} className="animate-spin" aria-hidden />
                …
              </>
            ) : (
              <>
                <ArrowDown size={12} aria-hidden />
                Receive
              </>
            )}
          </button>
        </div>
      )}
      {error ? (
        <p role="alert" className="basis-full rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs text-white">
          {error}
        </p>
      ) : null}
    </li>
  );
}
