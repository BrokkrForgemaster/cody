// Dexie schema — mirrors public.* tables in Supabase for offline reads.
// Writes go through the mutation queue in queue.ts, not directly here.
import Dexie, { type Table } from "dexie";
import type {
  CountEntry,
  CountSession,
  Customer,
  FollowUp,
  Job,
  Part,
  PartBatch,
  PartMovement,
  Quote,
  ServiceNote,
  Vehicle,
} from "@/lib/supabase/types";

export type PendingMutation = {
  id: string; // uuid, matches the row's id when relevant
  createdAt: number; // epoch ms — used to preserve order
  table:
    | "customers"
    | "vehicles"
    | "service_notes"
    | "jobs"
    | "quotes"
    | "follow_ups"
    | "parts"
    | "part_batches"
    | "part_movements"
    | "count_sessions"
    | "count_entries";
  op: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  attempts: number;
  lastError?: string;
};

class ForgedCustomsDB extends Dexie {
  customers!: Table<Customer, string>;
  vehicles!: Table<Vehicle, string>;
  service_notes!: Table<ServiceNote, string>;
  jobs!: Table<Job, string>;
  quotes!: Table<Quote, string>;
  follow_ups!: Table<FollowUp, string>;
  parts!: Table<Part, string>;
  part_batches!: Table<PartBatch, string>;
  part_movements!: Table<PartMovement, string>;
  count_sessions!: Table<CountSession, string>;
  count_entries!: Table<CountEntry, string>;
  pending!: Table<PendingMutation, string>;
  meta!: Table<{ key: string; value: string }, string>;

  constructor() {
    super("forged-customs");
    this.version(1).stores({
      customers: "id, updated_at, last_name, email, phone, deleted_at",
      vehicles: "id, customer_id, updated_at, vin, deleted_at",
      service_notes: "id, vehicle_id, occurred_on, updated_at, deleted_at",
      pending: "id, createdAt, table, op",
      meta: "key",
    });
    this.version(2).stores({
      jobs: "id, status, customer_id, vehicle_id, updated_at, scheduled_for, deleted_at",
    });
    this.version(3).stores({
      quotes: "id, status, source, customer_id, updated_at, created_at, deleted_at",
      follow_ups: "id, status, due_on, customer_id, job_id, updated_at, deleted_at",
    });
    this.version(4).stores({
      parts: "id, sku, barcode, category, item_type, vendor, updated_at, deleted_at",
      part_batches: "id, part_id, batch_number, expires_on, updated_at, deleted_at",
      part_movements: "id, part_id, movement_type, occurred_at, job_id",
      count_sessions: "id, status, updated_at",
      count_entries: "id, session_id, part_id, updated_at",
    });
  }
}

let cached: ForgedCustomsDB | null = null;

export function getDB(): ForgedCustomsDB {
  if (typeof window === "undefined") {
    throw new Error("getDB() called on the server — Dexie is browser-only");
  }
  if (!cached) cached = new ForgedCustomsDB();
  return cached;
}
