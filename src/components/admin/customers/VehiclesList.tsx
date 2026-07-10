"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Car, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteVehicle, listVehiclesForCustomer } from "@/lib/offline/vehicles";

function formatVehicle(v: {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
}): string {
  const parts = [
    v.year?.toString(),
    v.make ?? "",
    v.model ?? "",
    v.trim ?? "",
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : "Untitled vehicle";
}

export function VehiclesList({ customerId }: { customerId: string }) {
  const vehicles = useLiveQuery(
    () => listVehiclesForCustomer(customerId),
    [customerId],
  );
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function onDelete(id: string) {
    setDeletingId(id);
    await deleteVehicle(id);
    setDeletingId(null);
    setConfirmingId(null);
  }

  const loading = vehicles === undefined;
  const empty = !loading && vehicles?.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl uppercase text-text">Vehicles</h3>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {loading ? "…" : `${vehicles?.length ?? 0} on file`}
          </p>
        </div>
        <Link
          href={`/admin/customers/${customerId}/vehicles/new`}
          className="cta-secondary text-xs"
        >
          <Plus size={14} aria-hidden />
          Add vehicle
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : empty ? (
        <div className="rounded-md border border-dashed border-white/10 p-6 text-center text-sm text-muted">
          <Car size={22} className="mx-auto mb-2 text-blue-accent" aria-hidden />
          No vehicles yet. Add the first one to start tracking service history.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {vehicles!.map((v) => (
            <li
              key={v.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-white/10 bg-black/25 p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-text">{formatVehicle(v)}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  {v.vin ? <span>VIN {v.vin}</span> : null}
                  {v.license_plate ? <span>Plate {v.license_plate}</span> : null}
                  {v.color ? <span>{v.color}</span> : null}
                </div>
                {v.notes ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{v.notes}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/customers/${customerId}/vehicles/${v.id}/edit`}
                  className="cta-secondary text-xs"
                >
                  <Pencil size={12} aria-hidden />
                  Edit
                </Link>
                {confirmingId === v.id ? (
                  <>
                    <button
                      type="button"
                      className="cta-primary text-xs"
                      onClick={() => onDelete(v.id)}
                      disabled={deletingId === v.id}
                    >
                      {deletingId === v.id ? (
                        <>
                          <Loader2 size={12} className="animate-spin" aria-hidden />
                          Deleting…
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </button>
                    <button
                      type="button"
                      className="cta-secondary text-xs"
                      onClick={() => setConfirmingId(null)}
                      disabled={deletingId === v.id}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="cta-secondary text-xs"
                    onClick={() => setConfirmingId(v.id)}
                  >
                    <Trash2 size={12} aria-hidden />
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
