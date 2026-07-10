import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Quote, QuoteInsert, QuoteStatus, QuoteUpdate } from "@/lib/supabase/types";
import { getDB } from "./db";
import { enqueue } from "./queue";

type QuoteRow = Quote;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function refreshQuotes(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("quotes.cursor");
  const cursor = cursorRow?.value;

  const result = cursor
    ? await supabase
        .from("quotes")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("quotes").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: QuoteRow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };

  await db.quotes.bulkPut(data);
  const latest = data[data.length - 1].updated_at;
  await db.meta.put({ key: "quotes.cursor", value: latest });
  return { count: data.length };
}

export async function listQuotes(): Promise<Quote[]> {
  const rows = await getDB().quotes
    .orderBy("created_at")
    .reverse()
    .filter((q) => !q.deleted_at)
    .toArray();
  return rows;
}

export async function getQuote(id: string): Promise<Quote | undefined> {
  return getDB().quotes.get(id);
}

export async function createQuote(input: QuoteInsert): Promise<Quote> {
  const now = new Date().toISOString();
  const id = input.id ?? uuid();
  const row: Quote = {
    id,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    source: input.source ?? "staff",
    status: input.status ?? "new",
    customer_id: input.customer_id ?? null,
    vehicle_id: input.vehicle_id ?? null,
    configuration_id: input.configuration_id ?? null,
    job_id: input.job_id ?? null,
    lead_first_name: input.lead_first_name ?? null,
    lead_last_name: input.lead_last_name ?? null,
    lead_email: input.lead_email ?? null,
    lead_phone: input.lead_phone ?? null,
    lead_city: input.lead_city ?? null,
    vehicle_year: input.vehicle_year ?? null,
    vehicle_make: input.vehicle_make ?? null,
    vehicle_model: input.vehicle_model ?? null,
    vehicle_trim: input.vehicle_trim ?? null,
    services_interest: input.services_interest ?? [],
    timeline: input.timeline ?? null,
    budget: input.budget ?? null,
    desired_look: input.desired_look ?? null,
    current_issues: input.current_issues ?? null,
    message: input.message ?? null,
    staff_notes: input.staff_notes ?? null,
    estimated_total_cents: input.estimated_total_cents ?? null,
  };
  await getDB().quotes.put(row);
  await enqueue({
    id: `quotes:insert:${id}`,
    table: "quotes",
    op: "insert",
    payload: row,
  });
  return row;
}

export async function updateQuote(id: string, patch: QuoteUpdate): Promise<Quote | undefined> {
  const db = getDB();
  const current = await db.quotes.get(id);
  if (!current) return undefined;
  const next: Quote = { ...current, ...patch, id, updated_at: new Date().toISOString() };
  await db.quotes.put(next);
  await enqueue({
    id: `quotes:update:${id}:${next.updated_at}`,
    table: "quotes",
    op: "update",
    payload: { id, ...patch, updated_at: next.updated_at },
  });
  return next;
}

export async function setQuoteStatus(id: string, status: QuoteStatus): Promise<Quote | undefined> {
  return updateQuote(id, { status });
}

export async function deleteQuote(id: string): Promise<void> {
  const db = getDB();
  const current = await db.quotes.get(id);
  if (!current) return;
  const now = new Date().toISOString();
  await db.quotes.put({ ...current, deleted_at: now, updated_at: now });
  await enqueue({
    id: `quotes:delete:${id}`,
    table: "quotes",
    op: "delete",
    payload: { id },
  });
}
