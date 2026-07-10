// Message reads (offline mirror). Sends go through the server API route.
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/supabase/types";
import { getDB } from "./db";

type MessageRow = Message;

export async function refreshMessages(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("messages.cursor");
  const cursor = cursorRow?.value;
  const result = cursor
    ? await supabase
        .from("messages")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("messages").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: MessageRow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };
  await db.messages.bulkPut(data);
  await db.meta.put({ key: "messages.cursor", value: data[data.length - 1].updated_at });
  return { count: data.length };
}

export async function listMessagesForCustomer(customerId: string): Promise<Message[]> {
  const rows = await getDB().messages
    .where("customer_id")
    .equals(customerId)
    .filter((m) => !m.deleted_at)
    .toArray();
  rows.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return rows;
}

export async function listMessagesForJob(jobId: string): Promise<Message[]> {
  const rows = await getDB().messages
    .where("job_id")
    .equals(jobId)
    .filter((m) => !m.deleted_at)
    .toArray();
  rows.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return rows;
}
