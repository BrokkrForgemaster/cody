// High-level inventory operations. Each op is a single unit of work that
// updates on_hand + writes an immutable movement + (for receives on
// consumables) optionally logs a batch. Local first, syncs through the queue.
import type {
  MovementType,
  Part,
  PartBatch,
  PartMovement,
} from "@/lib/supabase/types";
import { getDB } from "./db";
import { enqueue } from "./queue";
import { updatePart } from "./parts";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function writeMovement(row: PartMovement): Promise<void> {
  await getDB().part_movements.put(row);
  await enqueue({
    id: `part_movements:insert:${row.id}`,
    table: "part_movements",
    op: "insert",
    payload: row,
  });
}

export async function listMovementsForPart(partId: string): Promise<PartMovement[]> {
  const rows = await getDB().part_movements
    .where("part_id")
    .equals(partId)
    .toArray();
  rows.sort((a, b) => (b.occurred_at ?? "").localeCompare(a.occurred_at ?? ""));
  return rows;
}

export async function listMovementsForJob(jobId: string): Promise<PartMovement[]> {
  const rows = await getDB().part_movements.where("job_id").equals(jobId).toArray();
  rows.sort((a, b) => (b.occurred_at ?? "").localeCompare(a.occurred_at ?? ""));
  return rows;
}

export async function listBatchesForPart(partId: string): Promise<PartBatch[]> {
  const rows = await getDB().part_batches
    .where("part_id")
    .equals(partId)
    .filter((b) => !b.deleted_at)
    .toArray();
  rows.sort((a, b) => (b.received_on ?? "").localeCompare(a.received_on ?? ""));
  return rows;
}

// ---------- receive ----------

type ReceiveArgs = {
  partId: string;
  quantity: number;
  unitCostCents?: number | null;
  batchNumber?: string | null;
  expiresOn?: string | null;
  notes?: string | null;
  performedBy?: string | null;
  occurredAt?: string;
};

/**
 * Receive stock into inventory. Updates on_hand, rolls weighted-average
 * cost_cents, records last_cost_cents. If a batch number is provided (or
 * the item is a consumable), also creates/updates a part_batches row.
 * Writes a `receive` movement.
 */
export async function receiveStock(args: ReceiveArgs): Promise<PartMovement> {
  const { partId, quantity } = args;
  if (quantity <= 0) throw new Error("Received quantity must be positive.");

  const now = args.occurredAt ?? new Date().toISOString();
  const part = await getDB().parts.get(partId);
  if (!part) throw new Error("Part not found.");

  const unitCost = args.unitCostCents ?? null;
  const oldOnHand = Number(part.on_hand) || 0;
  const newOnHand = oldOnHand + quantity;

  // Weighted average cost roll-forward when we have a cost signal.
  let newCost = part.cost_cents;
  if (unitCost !== null && Number.isFinite(unitCost)) {
    const totalOldValue = oldOnHand * (part.cost_cents ?? 0);
    const totalNewValue = quantity * unitCost;
    const denom = oldOnHand + quantity;
    newCost = denom > 0 ? Math.round((totalOldValue + totalNewValue) / denom) : unitCost;
  }

  // Batch handling for consumables / whenever a batch number is provided.
  let batchId: string | null = null;
  if (args.batchNumber || part.item_type === "consumable") {
    const batchNumber = args.batchNumber?.trim() || `AUTO-${now.slice(0, 10)}`;
    const existing = await getDB().part_batches
      .where("part_id")
      .equals(partId)
      .filter((b) => !b.deleted_at && b.batch_number === batchNumber)
      .first();

    if (existing) {
      batchId = existing.id;
      const next: PartBatch = {
        ...existing,
        quantity_received: (existing.quantity_received ?? 0) + quantity,
        quantity_remaining: (existing.quantity_remaining ?? 0) + quantity,
        unit_cost_cents: unitCost ?? existing.unit_cost_cents,
        expires_on: args.expiresOn ?? existing.expires_on,
        updated_at: now,
      };
      await getDB().part_batches.put(next);
      await enqueue({
        id: `part_batches:update:${next.id}:${now}`,
        table: "part_batches",
        op: "update",
        payload: {
          id: next.id,
          quantity_received: next.quantity_received,
          quantity_remaining: next.quantity_remaining,
          unit_cost_cents: next.unit_cost_cents,
          expires_on: next.expires_on,
          updated_at: now,
        },
      });
    } else {
      const id = uuid();
      const batch: PartBatch = {
        id,
        created_at: now,
        updated_at: now,
        deleted_at: null,
        part_id: partId,
        batch_number: batchNumber,
        received_on: now.slice(0, 10),
        unit_cost_cents: unitCost,
        quantity_received: quantity,
        quantity_remaining: quantity,
        expires_on: args.expiresOn ?? null,
        notes: null,
      };
      await getDB().part_batches.put(batch);
      await enqueue({
        id: `part_batches:insert:${id}`,
        table: "part_batches",
        op: "insert",
        payload: batch,
      });
      batchId = id;
    }
  }

  await updatePart(partId, {
    on_hand: newOnHand,
    cost_cents: newCost,
    last_cost_cents: unitCost ?? part.last_cost_cents,
  });

  const movement: PartMovement = {
    id: uuid(),
    created_at: now,
    occurred_at: now,
    part_id: partId,
    batch_id: batchId,
    movement_type: "receive",
    quantity,
    unit_cost_cents: unitCost,
    job_id: null,
    reason: null,
    notes: args.notes ?? null,
    performed_by: args.performedBy ?? null,
  };
  await writeMovement(movement);
  return movement;
}

// ---------- use ----------

type UseArgs = {
  partId: string;
  quantity: number;
  jobId?: string | null;
  batchId?: string | null;
  notes?: string | null;
  performedBy?: string | null;
  occurredAt?: string;
};

export async function useStock(args: UseArgs): Promise<PartMovement> {
  const { partId, quantity } = args;
  if (quantity <= 0) throw new Error("Used quantity must be positive.");

  const now = args.occurredAt ?? new Date().toISOString();
  const part = await getDB().parts.get(partId);
  if (!part) throw new Error("Part not found.");

  const newOnHand = (Number(part.on_hand) || 0) - quantity;

  // If a batch is being drawn from, decrement its remaining.
  let batchId = args.batchId ?? null;
  if (batchId) {
    const batch = await getDB().part_batches.get(batchId);
    if (batch && batch.part_id === partId) {
      const remaining = Math.max(0, (batch.quantity_remaining ?? 0) - quantity);
      const next: PartBatch = { ...batch, quantity_remaining: remaining, updated_at: now };
      await getDB().part_batches.put(next);
      await enqueue({
        id: `part_batches:update:${batch.id}:${now}`,
        table: "part_batches",
        op: "update",
        payload: { id: batch.id, quantity_remaining: remaining, updated_at: now },
      });
    } else {
      batchId = null;
    }
  }

  await updatePart(partId, { on_hand: newOnHand });

  const movement: PartMovement = {
    id: uuid(),
    created_at: now,
    occurred_at: now,
    part_id: partId,
    batch_id: batchId,
    movement_type: "use",
    quantity: -quantity,
    unit_cost_cents: part.cost_cents ?? null,
    job_id: args.jobId ?? null,
    reason: null,
    notes: args.notes ?? null,
    performed_by: args.performedBy ?? null,
  };
  await writeMovement(movement);
  return movement;
}

// ---------- adjust ----------

type AdjustArgs = {
  partId: string;
  delta: number; // signed
  reason?: string | null; // "damage", "expired", "lost", "mispick", "cycle_count"
  notes?: string | null;
  performedBy?: string | null;
  movementType?: MovementType; // defaults to "adjust"
  occurredAt?: string;
};

export async function adjustStock(args: AdjustArgs): Promise<PartMovement> {
  const { partId, delta } = args;
  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error("Adjustment must be a non-zero number.");
  }

  const now = args.occurredAt ?? new Date().toISOString();
  const part = await getDB().parts.get(partId);
  if (!part) throw new Error("Part not found.");

  const newOnHand = (Number(part.on_hand) || 0) + delta;
  await updatePart(partId, { on_hand: newOnHand });

  const movement: PartMovement = {
    id: uuid(),
    created_at: now,
    occurred_at: now,
    part_id: partId,
    batch_id: null,
    movement_type: args.movementType ?? "adjust",
    quantity: delta,
    unit_cost_cents: null,
    job_id: null,
    reason: args.reason ?? null,
    notes: args.notes ?? null,
    performed_by: args.performedBy ?? null,
  };
  await writeMovement(movement);
  return movement;
}

// ---------- refresh helpers (called from SyncBoot) ----------

export async function refreshBatches(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = (await import("@/lib/supabase/client")).getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("part_batches.cursor");
  const cursor = cursorRow?.value;
  const result = cursor
    ? await supabase
        .from("part_batches")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("part_batches").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: PartBatch[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };
  await db.part_batches.bulkPut(data);
  await db.meta.put({ key: "part_batches.cursor", value: data[data.length - 1].updated_at });
  return { count: data.length };
}

export async function refreshMovements(): Promise<{ count: number }> {
  // Movements are append-only; cursor by occurred_at.
  const db = getDB();
  const supabase = (await import("@/lib/supabase/client")).getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("part_movements.cursor");
  const cursor = cursorRow?.value;
  const result = cursor
    ? await supabase
        .from("part_movements")
        .select("*")
        .order("occurred_at", { ascending: true })
        .gt("occurred_at", cursor)
    : await supabase.from("part_movements").select("*").order("occurred_at", { ascending: true });
  const { data, error } = result as { data: PartMovement[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };
  await db.part_movements.bulkPut(data);
  await db.meta.put({
    key: "part_movements.cursor",
    value: data[data.length - 1].occurred_at,
  });
  return { count: data.length };
}

// ---------- analytics ----------

/**
 * Usage per part over the last `days` days, based on `use` movements.
 * Returns a map of partId → total quantity used.
 */
export async function usageByPart(days = 30): Promise<Map<string, number>> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffIso = cutoff.toISOString();

  const movements = await getDB()
    .part_movements.filter(
      (m) => m.movement_type === "use" && (m.occurred_at ?? "") >= cutoffIso,
    )
    .toArray();

  const totals = new Map<string, number>();
  for (const m of movements) {
    totals.set(m.part_id, (totals.get(m.part_id) ?? 0) + Math.abs(m.quantity));
  }
  return totals;
}

/**
 * Last movement time per part (any type). Used for dead-stock detection.
 */
export async function lastMovementByPart(): Promise<Map<string, string>> {
  const movements = await getDB().part_movements.toArray();
  const map = new Map<string, string>();
  for (const m of movements) {
    const t = m.occurred_at ?? m.created_at ?? "";
    const cur = map.get(m.part_id);
    if (!cur || t > cur) map.set(m.part_id, t);
  }
  return map;
}

export function needsReorder(part: Part): boolean {
  return part.active !== false && Number(part.on_hand) <= Number(part.min_qty);
}

export function suggestedReorderQty(part: Part): number {
  const target = part.par_qty ?? part.min_qty * 2;
  const need = Math.max(0, target - Number(part.on_hand));
  return Math.ceil(need);
}
