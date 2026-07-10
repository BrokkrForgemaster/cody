// Attachment metadata (rows) mirror. Actual file bytes live in Supabase
// Storage bucket "job-attachments" — never in Dexie. Uploads and deletes
// go straight through the Supabase browser client (they require network).
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  AttachmentKind,
  AttachmentTag,
  JobAttachment,
  JobAttachmentInsert,
} from "@/lib/supabase/types";
import { getDB } from "./db";

const BUCKET = "job-attachments";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type AttachmentRow = JobAttachment;

export async function refreshAttachments(): Promise<{ count: number }> {
  const db = getDB();
  const supabase = getSupabaseBrowserClient();
  const cursorRow = await db.meta.get("job_attachments.cursor");
  const cursor = cursorRow?.value;
  const result = cursor
    ? await supabase
        .from("job_attachments")
        .select("*")
        .order("updated_at", { ascending: true })
        .gt("updated_at", cursor)
    : await supabase.from("job_attachments").select("*").order("updated_at", { ascending: true });
  const { data, error } = result as { data: AttachmentRow[] | null; error: Error | null };
  if (error) throw error;
  if (!data || data.length === 0) return { count: 0 };
  await db.job_attachments.bulkPut(data);
  await db.meta.put({
    key: "job_attachments.cursor",
    value: data[data.length - 1].updated_at,
  });
  return { count: data.length };
}

export async function listAttachmentsForJob(jobId: string): Promise<JobAttachment[]> {
  const rows = await getDB().job_attachments
    .where("job_id")
    .equals(jobId)
    .filter((a) => !a.deleted_at)
    .toArray();
  rows.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return rows;
}

export type UploadOptions = {
  jobId: string;
  file: File;
  tag?: AttachmentTag;
  caption?: string | null;
};

export async function uploadJobAttachment(opts: UploadOptions): Promise<JobAttachment> {
  const { jobId, file } = opts;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("You need to be online to upload photos.");
  }
  const supabase = getSupabaseBrowserClient();

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const key = `${jobId}/${Date.now()}-${uuid()}${ext ? `.${ext}` : ""}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(key, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
  if (upErr) throw new Error(upErr.message);

  const kind: AttachmentKind = file.type.startsWith("image/") ? "photo" : "document";
  const now = new Date().toISOString();
  const insert: JobAttachmentInsert = {
    job_id: jobId,
    storage_path: key,
    filename: file.name,
    content_type: file.type || null,
    size_bytes: file.size,
    kind,
    tag: opts.tag ?? null,
    caption: opts.caption ?? null,
    uploaded_by: null,
  };
  // Direct insert (not through mutation queue) so we can use the returned id.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("job_attachments") as any)
    .insert(insert)
    .select("*")
    .single();
  if (error) {
    // Best-effort cleanup: remove the file we just uploaded so we don't
    // leak orphans in Storage.
    await supabase.storage.from(BUCKET).remove([key]).catch(() => undefined);
    throw new Error(error.message);
  }

  const row = data as JobAttachment;
  await getDB().job_attachments.put(row);
  return row;
}

export async function deleteJobAttachment(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const existing = await getDB().job_attachments.get(id);
  if (!existing) return;

  // Delete file first; if it fails we still try to remove the DB row so
  // the UI stays consistent, but the actual leaked file can be cleaned
  // by a maintenance job.
  await supabase.storage.from(BUCKET).remove([existing.storage_path]).catch(() => undefined);

  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("job_attachments") as any)
    .update({ deleted_at: now, updated_at: now })
    .eq("id", id);
  await getDB().job_attachments.put({ ...existing, deleted_at: now, updated_at: now });
}

/**
 * Create a short-lived signed URL for viewing an attachment. Signed URLs
 * are needed because the bucket is private.
 */
export async function signedUrlFor(
  attachment: JobAttachment,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(attachment.storage_path, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}
