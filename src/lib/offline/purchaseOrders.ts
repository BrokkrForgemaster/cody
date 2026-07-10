// Purchase order helpers. Same pattern as other tables — Dexie mirror,
// mutation queue. Receiving against a PO also generates receive movements
// via inventory.receiveStock().
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  PurchaseOrder,
  PurchaseOrderInsert,
  PurchaseOrderItem,
  PurchaseOrderItemInsert,
  PurchaseOrderItemUpdate,
  PurchaseOrderStatus,
  PurchaseOrderUpdate,
} from "@/lib/supabase/types";
import { getDB } from "./db";
import { receiveStock } from "./inventory";
import { enqueue } from "./queue";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type PORow = PurchaseOrder;
type POItemRow = PurchaseOrderItem;

export async function refreshPurchaseOrders(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("purchase_orders.cursor");
  const cursor = cursorRow?.value;
  const result = cursor
    ? await supabase
        .from("purchase_orders")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("purchase_orders").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: PORow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };
  await db.purchase_orders.bulkPut(data);
  await db.meta.put({
    key: "purchase_orders.cursor",
    value: data[data.length - 1].updated_at,
  });
  return { count: data.length };
}

export async function refreshPurchaseOrderItems(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("purchase_order_items.cursor");
  const cursor = cursorRow?.value;
  const result = cursor
    ? await supabase
        .from("purchase_order_items")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase
        .from("purchase_order_items")
        .select("*")
        .order("updated_at", { ascending: true });
  const { data, error } = result as { data: POItemRow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };
  await db.purchase_order_items.bulkPut(data);
  await db.meta.put({
    key: "purchase_order_items.cursor",
    value: data[data.length - 1].updated_at,
  });
  return { count: data.length };
}

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  const rows = await getDB().purchase_orders.toArray();
  return rows
    .filter((p) => !p.deleted_at)
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
  return getDB().purchase_orders.get(id);
}

export async function listItemsForPO(poId: string): Promise<PurchaseOrderItem[]> {
  const rows = await getDB().purchase_order_items
    .where("purchase_order_id")
    .equals(poId)
    .toArray();
  rows.sort((a, b) => a.label.localeCompare(b.label));
  return rows;
}

export async function createPurchaseOrder(
  input: PurchaseOrderInsert,
  items: Omit<PurchaseOrderItemInsert, "purchase_order_id">[] = [],
): Promise<PurchaseOrder> {
  const now = new Date().toISOString();
  const id = input.id ?? uuid();
  const row: PurchaseOrder = {
    id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    po_number: input.po_number ?? null,
    vendor: input.vendor,
    status: input.status ?? "draft",
    ordered_on: input.ordered_on ?? null,
    expected_on: input.expected_on ?? null,
    received_on: input.received_on ?? null,
    notes: input.notes ?? null,
    created_by: input.created_by ?? null,
  };
  await getDB().purchase_orders.put(row);
  await enqueue({
    id: `purchase_orders:insert:${id}`,
    table: "purchase_orders",
    op: "insert",
    payload: row,
  });

  for (const item of items) {
    await addPurchaseOrderItem({ ...item, purchase_order_id: id });
  }

  return row;
}

export async function updatePurchaseOrder(
  id: string,
  patch: PurchaseOrderUpdate,
): Promise<PurchaseOrder | undefined> {
  const db = getDB();
  const current = await db.purchase_orders.get(id);
  if (!current) return undefined;
  const next: PurchaseOrder = {
    ...current,
    ...patch,
    id,
    updated_at: new Date().toISOString(),
  };
  await db.purchase_orders.put(next);
  await enqueue({
    id: `purchase_orders:update:${id}:${next.updated_at}`,
    table: "purchase_orders",
    op: "update",
    payload: { id, ...patch, updated_at: next.updated_at },
  });
  return next;
}

export async function setPurchaseOrderStatus(
  id: string,
  status: PurchaseOrderStatus,
): Promise<void> {
  const patch: PurchaseOrderUpdate = { status };
  if (status === "received") patch.received_on = new Date().toISOString().slice(0, 10);
  await updatePurchaseOrder(id, patch);
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  const db = getDB();
  const current = await db.purchase_orders.get(id);
  if (!current) return;
  const now = new Date().toISOString();
  await db.purchase_orders.put({ ...current, deleted_at: now, updated_at: now });
  await enqueue({
    id: `purchase_orders:delete:${id}`,
    table: "purchase_orders",
    op: "delete",
    payload: { id },
  });
}

export async function addPurchaseOrderItem(
  input: PurchaseOrderItemInsert,
): Promise<PurchaseOrderItem> {
  const now = new Date().toISOString();
  const id = input.id ?? uuid();
  const row: PurchaseOrderItem = {
    id,
    created_at: now,
    updated_at: now,
    purchase_order_id: input.purchase_order_id,
    part_id: input.part_id ?? null,
    label: input.label,
    vendor_sku: input.vendor_sku ?? null,
    quantity_ordered: input.quantity_ordered ?? 0,
    quantity_received: input.quantity_received ?? 0,
    unit_cost_cents: input.unit_cost_cents ?? null,
    notes: input.notes ?? null,
  };
  await getDB().purchase_order_items.put(row);
  await enqueue({
    id: `purchase_order_items:insert:${id}`,
    table: "purchase_order_items",
    op: "insert",
    payload: row,
  });
  return row;
}

export async function updatePurchaseOrderItem(
  id: string,
  patch: PurchaseOrderItemUpdate,
): Promise<PurchaseOrderItem | undefined> {
  const db = getDB();
  const current = await db.purchase_order_items.get(id);
  if (!current) return undefined;
  const next: PurchaseOrderItem = {
    ...current,
    ...patch,
    id,
    updated_at: new Date().toISOString(),
  };
  await db.purchase_order_items.put(next);
  await enqueue({
    id: `purchase_order_items:update:${id}:${next.updated_at}`,
    table: "purchase_order_items",
    op: "update",
    payload: { id, ...patch, updated_at: next.updated_at },
  });
  return next;
}

export async function removePurchaseOrderItem(id: string): Promise<void> {
  const db = getDB();
  const current = await db.purchase_order_items.get(id);
  if (!current) return;
  await db.purchase_order_items.delete(id);
  await enqueue({
    id: `purchase_order_items:delete:${id}`,
    table: "purchase_order_items",
    op: "delete",
    payload: { id },
  });
}

/**
 * Receive some (or all) of an ordered line. Emits a stock receive movement
 * for the linked part, bumps the item's quantity_received, and rolls the PO
 * status to partial_received / received automatically.
 */
export async function receiveAgainstItem(args: {
  itemId: string;
  quantity: number;
  batchNumber?: string | null;
  notes?: string | null;
}): Promise<void> {
  const { itemId, quantity } = args;
  if (quantity <= 0) throw new Error("Received quantity must be positive.");
  const db = getDB();
  const item = await db.purchase_order_items.get(itemId);
  if (!item) throw new Error("Item not found.");
  if (!item.part_id) throw new Error("This line item isn't linked to a part.");

  await receiveStock({
    partId: item.part_id,
    quantity,
    unitCostCents: item.unit_cost_cents ?? null,
    batchNumber: args.batchNumber ?? null,
    notes: args.notes ?? `Received against PO`,
  });

  await updatePurchaseOrderItem(itemId, {
    quantity_received: (item.quantity_received ?? 0) + quantity,
  });

  // Recompute PO status.
  const poId = item.purchase_order_id;
  const items = await listItemsForPO(poId);
  const totalOrdered = items.reduce((s, i) => s + (i.quantity_ordered ?? 0), 0);
  const totalReceived = items.reduce(
    (s, i) =>
      s +
      (i.id === itemId
        ? (i.quantity_received ?? 0) + quantity
        : i.quantity_received ?? 0),
    0,
  );
  let nextStatus: PurchaseOrderStatus;
  if (totalReceived === 0) nextStatus = "sent";
  else if (totalReceived >= totalOrdered) nextStatus = "received";
  else nextStatus = "partial_received";
  await setPurchaseOrderStatus(poId, nextStatus);
}
