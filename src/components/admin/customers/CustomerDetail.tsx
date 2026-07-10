"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCustomer, getCustomer } from "@/lib/offline/customers";
import { VehiclesList } from "./VehiclesList";

export function CustomerDetail({ id }: { id: string }) {
  const router = useRouter();
  const customer = useLiveQuery(() => getCustomer(id), [id]);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (customer === undefined) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (customer === null || (customer && customer.deleted_at)) {
    return (
      <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
        This customer was not found on this device. If you just created them, wait a moment and
        refresh.
      </div>
    );
  }

  async function onDelete() {
    if (!customer) return;
    setDeleting(true);
    await deleteCustomer(customer.id);
    router.push("/admin/customers");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="panel-border rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{customer.source ?? "Customer"}</p>
            <h2 className="font-heading text-3xl uppercase text-text">
              {customer.first_name} {customer.last_name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
              {customer.email ? (
                <a href={`mailto:${customer.email}`} className="hover:text-white">
                  {customer.email}
                </a>
              ) : null}
              {customer.phone ? (
                <a href={`tel:${customer.phone}`} className="hover:text-white">
                  {customer.phone}
                </a>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/jobs/new?customer=${customer.id}`}
              className="cta-primary text-xs"
            >
              <Plus size={14} aria-hidden />
              New job
            </Link>
            <Link
              href={`/admin/customers/${customer.id}/edit`}
              className="cta-secondary text-xs"
            >
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
                  aria-busy={deleting}
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
                <button
                  type="button"
                  className="cta-secondary text-xs"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="cta-secondary text-xs"
                onClick={() => setConfirming(true)}
              >
                <Trash2 size={14} aria-hidden />
                Delete
              </button>
            )}
          </div>
        </div>

        {customer.notes ? (
          <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{customer.notes}</p>
        ) : null}
      </div>

      <div className="panel-border rounded-lg p-6">
        <VehiclesList customerId={customer.id} />
      </div>
    </div>
  );
}
