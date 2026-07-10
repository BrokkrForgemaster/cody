import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  FollowUp,
  FollowUpInsert,
  FollowUpStatus,
  FollowUpUpdate,
} from "@/lib/supabase/types";
import { getDB } from "./db";
import { enqueue } from "./queue";

type FollowUpRow = FollowUp;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function refreshFollowUps(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("follow_ups.cursor");
  const cursor = cursorRow?.value;

  const result = cursor
    ? await supabase
        .from("follow_ups")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("follow_ups").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: FollowUpRow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };

  await db.follow_ups.bulkPut(data);
  const latest = data[data.length - 1].updated_at;
  await db.meta.put({ key: "follow_ups.cursor", value: latest });
  return { count: data.length };
}

export async function listFollowUps(includeDone = false): Promise<FollowUp[]> {
  const rows = await getDB().follow_ups
    .filter((f) => !f.deleted_at && (includeDone || f.status === "pending"))
    .toArray();
  rows.sort((a, b) => {
    const ad = a.due_on ?? "9999-12-31";
    const bd = b.due_on ?? "9999-12-31";
    if (ad !== bd) return ad.localeCompare(bd);
    return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
  });
  return rows;
}

export async function getFollowUp(id: string): Promise<FollowUp | undefined> {
  return getDB().follow_ups.get(id);
}

export async function createFollowUp(input: FollowUpInsert): Promise<FollowUp> {
  const now = new Date().toISOString();
  const id = input.id ?? uuid();
  const row: FollowUp = {
    id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    title: input.title,
    notes: input.notes ?? null,
    kind: input.kind ?? "general",
    status: input.status ?? "pending",
    due_on: input.due_on ?? null,
    customer_id: input.customer_id ?? null,
    job_id: input.job_id ?? null,
    completed_at: input.completed_at ?? null,
    assigned_to: input.assigned_to ?? null,
    created_by: input.created_by ?? null,
  };
  await getDB().follow_ups.put(row);
  await enqueue({
    id: `follow_ups:insert:${id}`,
    table: "follow_ups",
    op: "insert",
    payload: row,
  });
  return row;
}

export async function updateFollowUp(
  id: string,
  patch: FollowUpUpdate,
): Promise<FollowUp | undefined> {
  const db = getDB();
  const current = await db.follow_ups.get(id);
  if (!current) return undefined;
  const next: FollowUp = { ...current, ...patch, id, updated_at: new Date().toISOString() };
  await db.follow_ups.put(next);
  await enqueue({
    id: `follow_ups:update:${id}:${next.updated_at}`,
    table: "follow_ups",
    op: "update",
    payload: { id, ...patch, updated_at: next.updated_at },
  });
  return next;
}

export async function setFollowUpStatus(
  id: string,
  status: FollowUpStatus,
): Promise<FollowUp | undefined> {
  const patch: FollowUpUpdate = { status };
  if (status === "done") patch.completed_at = new Date().toISOString();
  if (status !== "done") patch.completed_at = null;
  return updateFollowUp(id, patch);
}

export async function deleteFollowUp(id: string): Promise<void> {
  const db = getDB();
  const current = await db.follow_ups.get(id);
  if (!current) return;
  const now = new Date().toISOString();
  await db.follow_ups.put({ ...current, deleted_at: now, updated_at: now });
  await enqueue({
    id: `follow_ups:delete:${id}`,
    table: "follow_ups",
    op: "delete",
    payload: { id },
  });
}
