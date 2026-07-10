"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { ClipboardCheck, Plus } from "lucide-react";
import Link from "next/link";
import { listCountSessions } from "@/lib/offline/counts";
import { cn } from "@/lib/utils";
import type { CountSessionStatus } from "@/lib/supabase/types";

const STATUS_STYLE: Record<CountSessionStatus, string> = {
  in_progress: "border-blue-accent/40 bg-blue-accent/10 text-blue-accent",
  committed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-white/20 bg-white/5 text-muted",
};

export function CountSessionsList() {
  const sessions = useLiveQuery(() => listCountSessions(), []);
  const loading = sessions === undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Link href="/admin/inventory/counts/new" className="cta-primary text-xs">
          <Plus size={14} aria-hidden />
          New count session
        </Link>
      </div>

      {loading ? (
        <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
          Loading…
        </div>
      ) : sessions.length === 0 ? (
        <div className="panel-border flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <ClipboardCheck size={28} className="text-blue-accent" aria-hidden />
          <p className="font-heading text-2xl uppercase text-text">No count sessions yet</p>
          <p className="max-w-md text-sm text-muted">
            Open a session, scan or add parts, enter actual counts. Committing generates
            adjustments for anything with variance.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/inventory/counts/${s.id}`}
                className="panel-border group flex items-center justify-between gap-3 rounded-lg p-4 transition hover:border-blue-accent/60"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text">{s.title}</p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                        STATUS_STYLE[s.status],
                      )}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {s.location ? `${s.location} · ` : ""}
                    Opened {new Date(s.opened_at).toLocaleString()}
                    {s.committed_at
                      ? ` · Committed ${new Date(s.committed_at).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <span className="text-xs text-muted transition group-hover:text-blue-accent">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
