"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCountSession } from "@/lib/offline/counts";

export function NewCountSessionForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) {
      setError("Title is required.");
      setBusy(false);
      return;
    }
    try {
      const s = await createCountSession({
        title,
        location: String(form.get("location") ?? "").trim() || null,
        notes: String(form.get("notes") ?? "").trim() || null,
      });
      router.push(`/admin/inventory/counts/${s.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted" htmlFor="title">
          Title *
        </label>
        <input
          id="title"
          name="title"
          required
          className="focus-field"
          placeholder="e.g. Q3 powder bay full count"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted" htmlFor="location">
          Location (optional)
        </label>
        <input
          id="location"
          name="location"
          className="focus-field"
          placeholder="Powder Bay / Paint Locker / Front Shelves…"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted" htmlFor="notes">
          Notes
        </label>
        <textarea id="notes" name="notes" rows={3} className="focus-field resize-y" />
      </div>
      {error ? (
        <p role="alert" className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3">
        <button type="submit" className="cta-primary" disabled={busy} aria-busy={busy}>
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Opening…
            </>
          ) : (
            "Open session"
          )}
        </button>
        <button type="button" className="cta-secondary" onClick={() => router.back()} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}
