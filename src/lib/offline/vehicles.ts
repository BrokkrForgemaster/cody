// Vehicle-specific offline data access. Mirror of customers.ts —
// same pattern (Dexie mirror + optimistic writes + mutation queue drain).
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Vehicle, VehicleInsert, VehicleUpdate } from "@/lib/supabase/types";
import { getDB } from "./db";
import { enqueue } from "./queue";

type VehicleRow = Vehicle;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function refreshVehicles(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("vehicles.cursor");
  const cursor = cursorRow?.value;

  const result = cursor
    ? await supabase
        .from("vehicles")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase
        .from("vehicles")
        .select("*")
        .order("updated_at", { ascending: true });
  const { data, error } = result as { data: VehicleRow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };

  await db.vehicles.bulkPut(data);
  const latest = data[data.length - 1].updated_at;
  await db.meta.put({ key: "vehicles.cursor", value: latest });
  return { count: data.length };
}

export async function listVehiclesForCustomer(customerId: string): Promise<Vehicle[]> {
  const db = getDB();
  const rows = await db.vehicles
    .where("customer_id")
    .equals(customerId)
    .filter((v) => !v.deleted_at)
    .toArray();
  rows.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  return rows;
}

export async function getVehicle(id: string): Promise<Vehicle | undefined> {
  return getDB().vehicles.get(id);
}

export async function createVehicle(input: VehicleInsert): Promise<Vehicle> {
  const now = new Date().toISOString();
  const id = input.id ?? uuid();
  const row: Vehicle = {
    id,
    customer_id: input.customer_id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    year: input.year ?? null,
    make: input.make ?? null,
    model: input.model ?? null,
    trim: input.trim ?? null,
    vin: input.vin ?? null,
    license_plate: input.license_plate ?? null,
    color: input.color ?? null,
    notes: input.notes ?? null,
  };
  await getDB().vehicles.put(row);
  await enqueue({
    id: `vehicles:insert:${id}`,
    table: "vehicles",
    op: "insert",
    payload: row,
  });
  return row;
}

export async function updateVehicle(
  id: string,
  patch: VehicleUpdate,
): Promise<Vehicle | undefined> {
  const db = getDB();
  const current = await db.vehicles.get(id);
  if (!current) return undefined;
  const next: Vehicle = {
    ...current,
    ...patch,
    id,
    updated_at: new Date().toISOString(),
  };
  await db.vehicles.put(next);
  await enqueue({
    id: `vehicles:update:${id}:${next.updated_at}`,
    table: "vehicles",
    op: "update",
    payload: { id, ...patch, updated_at: next.updated_at },
  });
  return next;
}

export async function deleteVehicle(id: string): Promise<void> {
  const db = getDB();
  const current = await db.vehicles.get(id);
  if (!current) return;
  const now = new Date().toISOString();
  await db.vehicles.put({ ...current, deleted_at: now, updated_at: now });
  await enqueue({
    id: `vehicles:delete:${id}`,
    table: "vehicles",
    op: "delete",
    payload: { id },
  });
}
