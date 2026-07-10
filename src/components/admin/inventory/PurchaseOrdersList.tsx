"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Receipt } from "lucide-react";
import Link from "next/link";
import { listPurchaseOrders } from "@/lib/offline/purchaseOrders";
import type { PurchaseOrderStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<PurchaseOrderStatus, string> = {
  draft: "border-white/20 bg-white/5 text-muted",
  sent: "border-blue-accent/40 bg-blue-accent/10 text-blue-accent",
  partial_received: "border-cfg-orange/40 bg-cfg-orange/10 text-cfg-orange",
  received: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-white/10 bg-white/5 text-muted",
};

export function PurchaseOrdersList() {
  const pos = useLiveQuery(() => listPurchaseOrders(), []);
  const loading = pos === undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Link href="/admin/inventory/purchase-orders/new" className="cta-primary text-xs">
          <Plus size={14} aria-hidden />
          New PO
        </Link>
      </div>

      {loading ? (
        <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">Loading…</div>
      ) : pos.length === 0 ? (
        <div className="panel-border flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <Receipt size={26} className="text-blue-accent" aria-hidden />
          <p className="font-heading text-2xl uppercase text-text">No purchase orders yet</p>
          <p className="max-w-md text-sm text-muted">
            Create a PO from scratch, or generate one from the Reorder dashboard
            (per-vendor group → Create PO).
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {pos.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/inventory/purchase-orders/${p.id}`}
                className="panel-border group flex items-center justify-between gap-3 rounded-lg p-4 transition hover:border-blue-accent/60"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text">{p.vendor}</p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                        STATUS_STYLE[p.status],
                      )}
                    >
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {p.po_number ? `PO ${p.po_number} · ` : ""}
                    {p.ordered_on
                      ? `Ordered ${new Date(p.ordered_on + "T00:00:00").toLocaleDateString()}`
                      : `Created ${new Date(p.created_at).toLocaleDateString()}`}
                    {p.expected_on
                      ? ` · Expected ${new Date(p.expected_on + "T00:00:00").toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <span className="text-xs text-muted transition group-hover:text-blue-accent">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
