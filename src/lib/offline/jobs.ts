// Job data helpers — same pattern as customers.ts.
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Job,
  JobInsert,
  JobStatus,
  JobUpdate,
} from "@/lib/supabase/types";
import { getDB } from "./db";
import { createFollowUp } from "./followUps";
import { enqueue } from "./queue";

const DELIVERY_FOLLOW_UP_DAYS = 14;

function isoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

/**
 * When a job transitions to `delivered`, spawn a 2-week post-delivery
 * follow-up linked to the job + customer. Idempotent: if a non-deleted
 * `post_delivery` follow-up already exists for this job, does nothing.
 *
 * Future: an email sender will iterate `follow_ups` where
 * `kind = 'post_delivery' AND status = 'pending' AND due_on <= today`
 * and email the customer, then mark the follow-up done.
 */
async function ensureDeliveryFollowUp(job: Job): Promise<void> {
  const existing = await getDB()
    .follow_ups.where("job_id")
    .equals(job.id)
    .filter((f) => f.kind === "post_delivery" && !f.deleted_at)
    .first();
  if (existing) return;

  await createFollowUp({
    title: `Post-delivery check: ${job.title}`,
    notes:
      "Auto-scheduled 2 weeks after job delivery. Future release will email the customer automatically.",
    kind: "post_delivery",
    status: "pending",
    due_on: isoDate(DELIVERY_FOLLOW_UP_DAYS),
    customer_id: job.customer_id,
    job_id: job.id,
    completed_at: null,
    assigned_to: null,
    created_by: null,
  });
}

type JobRow = Job;

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

export async function refreshJobs(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("jobs.cursor");
  const cursor = cursorRow?.value;

  const result = cursor
    ? await supabase
        .from("jobs")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("jobs").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: JobRow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };

  await db.jobs.bulkPut(data);
  const latest = data[data.length - 1].updated_at;
  await db.meta.put({ key: "jobs.cursor", value: latest });
  return { count: data.length };
}

export async function listJobs(): Promise<Job[]> {
  const db = getDB();
  const rows = await db.jobs
    .orderBy("updated_at")
    .reverse()
    .filter((j) => !j.deleted_at)
    .toArray();
  return rows;
}

export async function listJobsForCustomer(customerId: string): Promise<Job[]> {
  const db = getDB();
  const rows = await db.jobs
    .where("customer_id")
    .equals(customerId)
    .filter((j) => !j.deleted_at)
    .toArray();
  rows.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  return rows;
}

export async function getJob(id: string): Promise<Job | undefined> {
  return getDB().jobs.get(id);
}

export async function createJob(input: JobInsert): Promise<Job> {
  const now = new Date().toISOString();
  const id = input.id ?? uuid();
  const row: Job = {
    id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    customer_id: input.customer_id ?? null,
    vehicle_id: input.vehicle_id ?? null,
    title: input.title,
    summary: input.summary ?? null,
    status: input.status ?? "new",
    stage: input.stage ?? null,
    scheduled_for: input.scheduled_for ?? null,
    created_by: input.created_by ?? null,
  };
  await getDB().jobs.put(row);
  await enqueue({
    id: `jobs:insert:${id}`,
    table: "jobs",
    op: "insert",
    payload: row,
  });
  if (row.status === "delivered") {
    await ensureDeliveryFollowUp(row);
  }
  return row;
}

export async function updateJob(id: string, patch: JobUpdate): Promise<Job | undefined> {
  const db = getDB();
  const current = await db.jobs.get(id);
  if (!current) return undefined;
  const next: Job = {
    ...current,
    ...patch,
    id,
    updated_at: new Date().toISOString(),
  };
  await db.jobs.put(next);
  await enqueue({
    id: `jobs:update:${id}:${next.updated_at}`,
    table: "jobs",
    op: "update",
    payload: { id, ...patch, updated_at: next.updated_at },
  });
  if (current.status !== "delivered" && next.status === "delivered") {
    await ensureDeliveryFollowUp(next);
  }
  return next;
}

export async function setJobStatus(id: string, status: JobStatus): Promise<Job | undefined> {
  return updateJob(id, { status });
}

export async function deleteJob(id: string): Promise<void> {
  const db = getDB();
  const current = await db.jobs.get(id);
  if (!current) return;
  const now = new Date().toISOString();
  await db.jobs.put({ ...current, deleted_at: now, updated_at: now });
  await enqueue({
    id: `jobs:delete:${id}`,
    table: "jobs",
    op: "delete",
    payload: { id },
  });
}
