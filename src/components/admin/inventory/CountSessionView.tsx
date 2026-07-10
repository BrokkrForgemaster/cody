"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, Loader2, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  cancelCountSession,
  commitCountSession,
  getCountSession,
  listEntriesForSession,
  removeCountEntry,
  upsertCountEntry,
} from "@/lib/offline/counts";
import { findPartByBarcode, listParts } from "@/lib/offline/parts";
import { cn } from "@/lib/utils";

export function CountSessionView({ id }: { id: string }) {
  const router = useRouter();
  const session = useLiveQuery(() => getCountSession(id), [id]);
  const entries = useLiveQuery(() => listEntriesForSession(id), [id]);
  const parts = useLiveQuery(() => listParts(true), []);

  const partById = useMemo(() => {
    const m = new Map<string, (typeof parts extends (infer T)[] | undefined ? T : never)>();
    for (const p of parts ?? []) m.set(p.id, p);
    return m;
  }, [parts]);

  const [committing, setCommitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [lookup, setLookup] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [actualQty, setActualQty] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (session === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (!session) {
    return (
      <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
        Session not found on this device.
      </div>
    );
  }

  const isOpen = session.status === "in_progress";
  const variance = (entries ?? []).filter((e) => e.actual_qty !== e.expected_qty).length;

  async function onAddByLookup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const code = lookup.trim();
    if (!code) return;
    const part = await findPartByBarcode(code);
    if (!part) {
      setError(`No part matches "${code}".`);
      return;
    }
    setSelectedPartId(part.id);
    setActualQty(String(part.on_hand));
    setLookup("");
  }

  async function onCommitEntry() {
    setError(null);
    const partId = selectedPartId;
    if (!partId) {
      setError("Choose a part first.");
      return;
    }
    const part = partById.get(partId);
    if (!part) {
      setError("Part not found on this device.");
      return;
    }
    const actual = Number.parseFloat(actualQty);
    if (!Number.isFinite(actual)) {
      setError("Actual quantity must be a number.");
      return;
    }
    await upsertCountEntry({
      session_id: id,
      part_id: partId,
      expected_qty: Number(part.on_hand),
      actual_qty: actual,
    });
    setSelectedPartId("");
    setActualQty("");
  }

  async function onCommitSession() {
    if (!confirm(`Commit this session? ${variance} variance(s) will become stock adjustments.`)) {
      return;
    }
    setCommitting(true);
    await commitCountSession(id);
    setCommitting(false);
    router.refresh();
  }

  async function onCancelSession() {
    if (!confirm("Cancel this session? Entries stay for reference but no adjustments run.")) {
      return;
    }
    setCancelling(true);
    await cancelCountSession(id);
    setCancelling(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="panel-border rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">
              Count session · {session.status.replace("_", " ")}
              {variance > 0 ? ` · ${variance} variance(s)` : ""}
            </p>
            <h2 className="font-heading text-3xl uppercase text-text">{session.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {session.location ? `${session.location} · ` : ""}
              Opened {new Date(session.opened_at).toLocaleString()}
              {session.committed_at
                ? ` · Committed ${new Date(session.committed_at).toLocaleString()}`
                : ""}
            </p>
          </div>
          {isOpen ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="cta-primary text-xs"
                onClick={onCommitSession}
                disabled={committing || (entries?.length ?? 0) === 0}
              >
                {committing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden />
                    Committing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} aria-hidden />
                    Commit ({entries?.length ?? 0})
                  </>
                )}
              </button>
              <button
                type="button"
                className="cta-secondary text-xs"
                onClick={onCancelSession}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden />
                    Cancelling…
                  </>
                ) : (
                  <>
                    <X size={14} aria-hidden />
                    Cancel session
                  </>
                )}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isOpen ? (
        <div className="panel-border rounded-lg p-6">
          <h3 className="font-heading text-lg uppercase text-text">Add / update entry</h3>

          <form onSubmit={onAddByLookup} className="mt-3 flex gap-2">
            <input
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              className="focus-field !py-2 text-sm"
              placeholder="Scan or type a SKU / barcode…"
              aria-label="Lookup by SKU or barcode"
            />
            <button type="submit" className="cta-secondary text-xs">
              Lookup
            </button>
          </form>

          <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_auto]">
            <select
              value={selectedPartId}
              onChange={(e) => {
                const pid = e.target.value;
                setSelectedPartId(pid);
                const p = partById.get(pid);
                if (p) setActualQty(String(p.on_hand));
              }}
              className="focus-field"
            >
              <option value="">— Choose part —</option>
              {[...(parts ?? [])]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Actual qty"
              value={actualQty}
              onChange={(e) => setActualQty(e.target.value)}
              className="focus-field"
              aria-label="Actual quantity"
            />
            <button type="button" className="cta-primary text-xs" onClick={onCommitEntry}>
              <Plus size={14} aria-hidden />
              Save entry
            </button>
          </div>

          {error ? (
            <p role="alert" className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="panel-border overflow-hidden rounded-lg">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="font-heading text-lg uppercase text-text">Entries</h3>
        </div>
        {entries === undefined ? (
          <p className="p-6 text-center text-sm text-muted">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">No entries yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Part</th>
                <th className="px-3 py-2 text-right font-semibold">Expected</th>
                <th className="px-3 py-2 text-right font-semibold">Actual</th>
                <th className="px-3 py-2 text-right font-semibold">Variance</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((e) => {
                const part = partById.get(e.part_id);
                const delta = e.actual_qty - e.expected_qty;
                return (
                  <tr key={e.id}>
                    <td className="px-3 py-2">
                      {part ? (
                        <Link
                          href={`/admin/inventory/${part.id}`}
                          className="text-text hover:text-blue-accent"
                        >
                          {part.name}
                          <span className="ml-2 text-xs text-muted">{part.sku}</span>
                        </Link>
                      ) : (
                        <span className="text-muted">Unknown part</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{e.expected_qty}</td>
                    <td className="px-3 py-2 text-right">{e.actual_qty}</td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right font-semibold",
                        delta > 0
                          ? "text-emerald-300"
                          : delta < 0
                            ? "text-accent"
                            : "text-muted",
                      )}
                    >
                      {delta > 0 ? "+" : ""}
                      {delta}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isOpen ? (
                        <button
                          type="button"
                          onClick={() => removeCountEntry(e.id)}
                          className="rounded-md border border-white/10 bg-white/5 p-1.5 text-muted transition hover:border-accent hover:text-white"
                          aria-label="Remove entry"
                        >
                          <Trash2 size={12} aria-hidden />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
