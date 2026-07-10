"use client";

import { useLiveQuery } from "dexie-react-hooks";
import {
  AlertTriangle,
  ExternalLink,
  ImageIcon,
  Loader2,
  Paperclip,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteJobAttachment,
  listAttachmentsForJob,
  signedUrlFor,
  uploadJobAttachment,
} from "@/lib/offline/attachments";
import type { AttachmentTag, JobAttachment } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const TAG_STYLE: Record<Exclude<AttachmentTag, null>, string> = {
  before: "border-blue-accent/40 bg-blue-accent/10 text-blue-accent",
  after: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  reference: "border-white/20 bg-white/5 text-muted",
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function JobAttachments({ jobId }: { jobId: string }) {
  const attachments = useLiveQuery(() => listAttachmentsForJob(jobId), [jobId]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadTag, setUploadTag] = useState<AttachmentTag>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<JobAttachment | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const photos = useMemo(
    () => (attachments ?? []).filter((a) => a.kind === "photo"),
    [attachments],
  );
  const docs = useMemo(
    () => (attachments ?? []).filter((a) => a.kind !== "photo"),
    [attachments],
  );

  useEffect(() => {
    if (!preview) {
      setPreviewUrl(null);
      return;
    }
    let cancelled = false;
    signedUrlFor(preview).then((url) => {
      if (!cancelled) setPreviewUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [preview]);

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadJobAttachment({ jobId, file, tag: uploadTag });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this attachment?")) return;
    try {
      await deleteJobAttachment(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const loading = attachments === undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-md border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.14em]">
            {(["before", "after", "reference"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setUploadTag(uploadTag === t ? null : t)}
                className={cn(
                  "rounded px-2.5 py-1 transition",
                  uploadTag === t ? "bg-accent text-white" : "text-muted hover:text-white",
                )}
                aria-pressed={uploadTag === t}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            hidden
            onChange={onFileChosen}
          />
          <button
            type="button"
            className="cta-primary text-xs"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={14} aria-hidden />
                Upload
              </>
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-white">
          <AlertTriangle size={12} className="mr-1 inline" aria-hidden />
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : (attachments?.length ?? 0) === 0 ? (
        <p className="rounded-md border border-dashed border-white/10 p-6 text-center text-sm text-muted">
          No attachments yet. Upload before/after photos or reference files.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {photos.length > 0 ? (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted">Photos ({photos.length})</p>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((a) => (
                  <li key={a.id} className="group relative overflow-hidden rounded-md border border-white/10 bg-black/25">
                    <button
                      type="button"
                      onClick={() => setPreview(a)}
                      className="block aspect-square w-full"
                    >
                      <PhotoThumb attachment={a} />
                    </button>
                    <div className="pointer-events-none absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 text-[10px]">
                      {a.tag ? (
                        <span
                          className={cn(
                            "rounded-full border px-1.5 py-0.5 font-semibold uppercase tracking-[0.14em]",
                            TAG_STYLE[a.tag],
                          )}
                        >
                          {a.tag}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="rounded-full border border-white/20 bg-black/60 px-1.5 py-0.5 text-muted">
                        {formatSize(a.size_bytes)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(a.id)}
                      className="pointer-events-auto absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Delete attachment"
                    >
                      <Trash2 size={11} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {docs.length > 0 ? (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted">Documents ({docs.length})</p>
              <ul className="flex flex-col gap-2">
                {docs.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/10 bg-black/25 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip size={14} className="text-muted" aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">{a.filename}</p>
                        <p className="text-xs text-muted">
                          {a.content_type ?? "file"} / {formatSize(a.size_bytes)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <DownloadButton attachment={a} />
                      <button
                        type="button"
                        onClick={() => onDelete(a.id)}
                        className="rounded-md border border-white/10 bg-white/5 p-1.5 text-muted transition hover:border-accent hover:text-white"
                        aria-label="Delete attachment"
                      >
                        <Trash2 size={12} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {preview ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={preview.caption ?? preview.filename}
                className="max-h-[85vh] max-w-full rounded-lg border border-white/10"
              />
            ) : (
              <div className="grid h-64 w-64 place-items-center rounded-lg border border-white/10 bg-black text-sm text-muted">
                <Loader2 size={22} className="animate-spin" aria-hidden />
              </div>
            )}
            <button
              type="button"
              className="absolute -right-3 -top-3 grid size-8 place-items-center rounded-full border border-white/20 bg-black text-white"
              onClick={() => setPreview(null)}
              aria-label="Close preview"
            >
              <X size={14} aria-hidden />
            </button>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{preview.filename}</span>
              {preview.tag ? <span className="text-blue-accent">{preview.tag}</span> : null}
              {previewUrl ? (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Open <ExternalLink size={11} aria-hidden />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PhotoThumb({ attachment }: { attachment: JobAttachment }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    signedUrlFor(attachment).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [attachment]);
  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-black text-muted">
        <ImageIcon size={20} aria-hidden />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={attachment.caption ?? attachment.filename} className="h-full w-full object-cover" />
  );
}

function DownloadButton({ attachment }: { attachment: JobAttachment }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="cta-secondary text-xs"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const url = await signedUrlFor(attachment);
        if (url) window.open(url, "_blank", "noopener");
        setBusy(false);
      }}
    >
      {busy ? <Loader2 size={12} className="animate-spin" aria-hidden /> : (
        <>
          <ExternalLink size={12} aria-hidden />
          Open
        </>
      )}
    </button>
  );
}
