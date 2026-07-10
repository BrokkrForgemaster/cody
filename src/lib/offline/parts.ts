// Parts (SKU master) data helpers.
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Part, PartInsert, PartUpdate } from "@/lib/supabase/types";
import { getDB } from "./db";
import { enqueue } from "./queue";

type PartRow = Part;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function refreshParts(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("parts.cursor");
  const cursor = cursorRow?.value;

  const result = cursor
    ? await supabase
        .from("parts")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("parts").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: PartRow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };

  await db.parts.bulkPut(data);
  const latest = data[data.length - 1].updated_at;
  await db.meta.put({ key: "parts.cursor", value: latest });
  return { count: data.length };
}

export async function listParts(includeInactive = false): Promise<Part[]> {
  const rows = await getDB().parts
    .filter((p) => !p.deleted_at && (includeInactive || p.active !== false))
    .toArray();
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

export async function getPart(id: string): Promise<Part | undefined> {
  return getDB().parts.get(id);
}

export async function findPartByBarcode(barcode: string): Promise<Part | undefined> {
  const normalized = barcode.trim();
  if (!normalized) return undefined;
  return getDB().parts
    .filter((p) => !p.deleted_at && (p.barcode === normalized || p.sku === normalized))
    .first();
}

export async function createPart(input: PartInsert): Promise<Part> {
  const now = new Date().toISOString();
  const id = input.id ?? uuid();
  const row: Part = {
    id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    sku: input.sku,
    barcode: input.barcode ?? null,
    name: input.name,
    category: input.category ?? "other",
    item_type: input.item_type ?? "part",
    uom: input.uom ?? "each",
    cost_cents: input.cost_cents ?? 0,
    last_cost_cents: input.last_cost_cents ?? null,
    price_cents: input.price_cents ?? null,
    on_hand: input.on_hand ?? 0,
    min_qty: input.min_qty ?? 0,
    par_qty: input.par_qty ?? null,
    vendor: input.vendor ?? null,
    vendor_sku: input.vendor_sku ?? null,
    lead_time_days: input.lead_time_days ?? null,
    location: input.location ?? null,
    notes: input.notes ?? null,
    active: input.active ?? true,
  };
  await getDB().parts.put(row);
  await enqueue({
    id: `parts:insert:${id}`,
    table: "parts",
    op: "insert",
    payload: row,
  });
  return row;
}

export async function updatePart(id: string, patch: PartUpdate): Promise<Part | undefined> {
  const db = getDB();
  const current = await db.parts.get(id);
  if (!current) return undefined;
  const next: Part = { ...current, ...patch, id, updated_at: new Date().toISOString() };
  await db.parts.put(next);
  await enqueue({
    id: `parts:update:${id}:${next.updated_at}`,
    table: "parts",
    op: "update",
    payload: { id, ...patch, updated_at: next.updated_at },
  });
  return next;
}

export async function deletePart(id: string): Promise<void> {
  const db = getDB();
  const current = await db.parts.get(id);
  if (!current) return;
  const now = new Date().toISOString();
  await db.parts.put({ ...current, deleted_at: now, updated_at: now });
  await enqueue({
    id: `parts:delete:${id}`,
    table: "parts",
    op: "delete",
    payload: { id },
  });
}
