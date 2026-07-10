// Cycle count sessions. Open a session, scan/enter parts and actual counts,
// commit — which generates `adjust` movements for anything with variance.
import type { CountEntry, CountSession, CountSessionStatus } from "@/lib/supabase/types";
import { getDB } from "./db";
import { adjustStock } from "./inventory";
import { enqueue } from "./queue";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function refreshCountSessions(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = (await import("@/lib/supabase/client")).getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("count_sessions.cursor");
  const cursor = cursorRow?.value;
  const result = cursor
    ? await supabase
        .from("count_sessions")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("count_sessions").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: CountSession[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };
  await db.count_sessions.bulkPut(data);
  await db.meta.put({
    key: "count_sessions.cursor",
    value: data[data.length - 1].updated_at,
  });
  return { count: data.length };
}

export async function refreshCountEntries(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = (await import("@/lib/supabase/client")).getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("count_entries.cursor");
  const cursor = cursorRow?.value;
  const result = cursor
    ? await supabase
        .from("count_entries")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("count_entries").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: CountEntry[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };
  await db.count_entries.bulkPut(data);
  await db.meta.put({
    key: "count_entries.cursor",
    value: data[data.length - 1].updated_at,
  });
  return { count: data.length };
}

export async function listCountSessions(): Promise<CountSession[]> {
  const rows = await getDB().count_sessions.toArray();
  rows.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  return rows;
}

export async function getCountSession(id: string): Promise<CountSession | undefined> {
  return getDB().count_sessions.get(id);
}

export async function listEntriesForSession(sessionId: string): Promise<CountEntry[]> {
  const rows = await getDB().count_entries.where("session_id").equals(sessionId).toArray();
  rows.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
  return rows;
}

export async function createCountSession(input: {
  title: string;
  location?: string | null;
  notes?: string | null;
  opened_by?: string | null;
}): Promise<CountSession> {
  const now = new Date().toISOString();
  const id = uuid();
  const row: CountSession = {
    id,
    created_at: now,
    updated_at: now,
    title: input.title,
    status: "in_progress",
    location: input.location ?? null,
    opened_by: input.opened_by ?? null,
    opened_at: now,
    committed_at: null,
    notes: input.notes ?? null,
  };
  await getDB().count_sessions.put(row);
  await enqueue({
    id: `count_sessions:insert:${id}`,
    table: "count_sessions",
    op: "insert",
    payload: row,
  });
  return row;
}

export async function updateCountSession(
  id: string,
  patch: Partial<CountSession>,
): Promise<CountSession | undefined> {
  const db = getDB();
  const current = await db.count_sessions.get(id);
  if (!current) return undefined;
  const next: CountSession = {
    ...current,
    ...patch,
    id,
    updated_at: new Date().toISOString(),
  };
  await db.count_sessions.put(next);
  await enqueue({
    id: `count_sessions:update:${id}:${next.updated_at}`,
    table: "count_sessions",
    op: "update",
    payload: { id, ...patch, updated_at: next.updated_at },
  });
  return next;
}

export async function upsertCountEntry(input: {
  session_id: string;
  part_id: string;
  expected_qty: number;
  actual_qty: number;
  notes?: string | null;
}): Promise<CountEntry> {
  const db = getDB();
  const existing = await db.count_entries
    .where("session_id")
    .equals(input.session_id)
    .filter((e) => e.part_id === input.part_id)
    .first();
  const now = new Date().toISOString();
  if (existing) {
    const next: CountEntry = {
      ...existing,
      expected_qty: input.expected_qty,
      actual_qty: input.actual_qty,
      notes: input.notes ?? existing.notes,
      updated_at: now,
    };
    await db.count_entries.put(next);
    await enqueue({
      id: `count_entries:update:${existing.id}:${now}`,
      table: "count_entries",
      op: "update",
      payload: {
        id: existing.id,
        expected_qty: next.expected_qty,
        actual_qty: next.actual_qty,
        notes: next.notes,
        updated_at: now,
      },
    });
    return next;
  }
  const id = uuid();
  const row: CountEntry = {
    id,
    created_at: now,
    updated_at: now,
    session_id: input.session_id,
    part_id: input.part_id,
    expected_qty: input.expected_qty,
    actual_qty: input.actual_qty,
    notes: input.notes ?? null,
  };
  await db.count_entries.put(row);
  await enqueue({
    id: `count_entries:insert:${id}`,
    table: "count_entries",
    op: "insert",
    payload: row,
  });
  return row;
}

export async function removeCountEntry(id: string): Promise<void> {
  const db = getDB();
  const current = await db.count_entries.get(id);
  if (!current) return;
  await db.count_entries.delete(id);
  await enqueue({
    id: `count_entries:delete:${id}`,
    table: "count_entries",
    op: "delete",
    payload: { id },
  });
}

/**
 * Commit a count session: for every entry with variance (actual != expected),
 * emit an `adjust` movement with reason "cycle_count". Then mark the session
 * as committed.
 */
export async function commitCountSession(
  sessionId: string,
  performedBy?: string | null,
): Promise<{ variances: number }> {
  const session = await getCountSession(sessionId);
  if (!session) throw new Error("Session not found.");
  if (session.status !== "in_progress") throw new Error("Session already closed.");

  const entries = await listEntriesForSession(sessionId);
  let variances = 0;
  for (const e of entries) {
    const delta = e.actual_qty - e.expected_qty;
    if (delta === 0) continue;
    await adjustStock({
      partId: e.part_id,
      delta,
      reason: "cycle_count",
      notes: `Count session: ${session.title}`,
      performedBy: performedBy ?? null,
      movementType: "count",
    });
    variances += 1;
  }

  await updateCountSession(sessionId, {
    status: "committed" as CountSessionStatus,
    committed_at: new Date().toISOString(),
  });

  return { variances };
}

export async function cancelCountSession(sessionId: string): Promise<void> {
  await updateCountSession(sessionId, { status: "cancelled" as CountSessionStatus });
}
