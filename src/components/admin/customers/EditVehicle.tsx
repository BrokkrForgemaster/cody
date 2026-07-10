"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getVehicle } from "@/lib/offline/vehicles";
import { VehicleForm } from "./VehicleForm";

type Props = {
  customerId: string;
  vehicleId: string;
};

export function EditVehicle({ customerId, vehicleId }: Props) {
  const vehicle = useLiveQuery(() => getVehicle(vehicleId), [vehicleId]);

  if (vehicle === undefined) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (!vehicle || vehicle.deleted_at) {
    return <p className="text-sm text-muted">Vehicle not found on this device.</p>;
  }
  if (vehicle.customer_id !== customerId) {
    return <p className="text-sm text-muted">This vehicle belongs to a different customer.</p>;
  }

  return <VehicleForm customerId={customerId} mode="edit" initial={vehicle} />;
}
