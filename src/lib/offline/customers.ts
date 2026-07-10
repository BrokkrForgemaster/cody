// Customer-specific offline data access. Reads from Dexie for instant
// results, writes go through the mutation queue.
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
} from "@/lib/supabase/types";
import { getDB } from "./db";
import { enqueue } from "./queue";

type CustomerRow = Customer;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for very old browsers — not expected in shop use, but safe.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Pull the latest customers from Supabase into Dexie. Uses an incremental
 * cursor based on `updated_at` so subsequent refreshes only fetch changes.
 */
export async function refreshCustomers(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("customers.cursor");
  const cursor = cursorRow?.value;

  const result = cursor
    ? await supabase
        .from("customers")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase
        .from("customers")
        .select("*")
        .order("updated_at", { ascending: true });
  const { data, error } = result as { data: CustomerRow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };

  await db.customers.bulkPut(data);
  const latest = data[data.length - 1].updated_at;
  await db.meta.put({ key: "customers.cursor", value: latest });
  return { count: data.length };
}

export async function listCustomers(): Promise<Customer[]> {
  const db = getDB();
  const rows = await db.customers
    .orderBy("last_name")
    .filter((c) => !c.deleted_at)
    .toArray();
  return rows;
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  return getDB().customers.get(id);
}

export async function createCustomer(input: CustomerInsert): Promise<Customer> {
  const now = new Date().toISOString();
  const id = input.id ?? uuid();
  const row: Customer = {
    id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    source: input.source ?? null,
    notes: input.notes ?? null,
  };
  await getDB().customers.put(row);
  await enqueue({
    id: `customers:insert:${id}`,
    table: "customers",
    op: "insert",
    payload: row,
  });
  return row;
}

export async function updateCustomer(
  id: string,
  patch: CustomerUpdate,
): Promise<Customer | undefined> {
  const db = getDB();
  const current = await db.customers.get(id);
  if (!current) return undefined;
  const next: Customer = {
    ...current,
    ...patch,
    id,
    updated_at: new Date().toISOString(),
  };
  await db.customers.put(next);
  await enqueue({
    id: `customers:update:${id}:${next.updated_at}`,
    table: "customers",
    op: "update",
    payload: { id, ...patch, updated_at: next.updated_at },
  });
  return next;
}

export async function deleteCustomer(id: string): Promise<void> {
  const db = getDB();
  const current = await db.customers.get(id);
  if (!current) return;
  const now = new Date().toISOString();
  await db.customers.put({ ...current, deleted_at: now, updated_at: now });
  await enqueue({
    id: `customers:delete:${id}`,
    table: "customers",
    op: "delete",
    payload: { id },
  });
}
