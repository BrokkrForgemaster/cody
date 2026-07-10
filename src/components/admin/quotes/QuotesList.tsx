"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Globe, Mail, Phone as PhoneIcon, Plus, User } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { listQuotes } from "@/lib/offline/quotes";
import type { QuoteSource, QuoteStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<QuoteStatus, string> = {
  new: "border-blue-accent/50 bg-blue-accent/10 text-blue-accent",
  contacted: "border-cfg-orange/50 bg-cfg-orange/10 text-cfg-orange",
  quoted: "border-white/20 bg-white/5 text-white",
  converted: "border-emerald-400/50 bg-emerald-400/10 text-emerald-300",
  lost: "border-white/10 bg-white/5 text-muted",
};

const SOURCE_ICON: Record<QuoteSource, typeof Globe> = {
  website: Globe,
  staff: User,
  phone: PhoneIcon,
  email: Mail,
  other: User,
};

export function QuotesList() {
  const quotes = useLiveQuery(() => listQuotes(), []);
  const [filter, setFilter] = useState<"all" | "open">("open");

  const visible = useMemo(() => {
    if (!quotes) return [];
    if (filter === "all") return quotes;
    return quotes.filter((q) => q.status === "new" || q.status === "contacted");
  }, [quotes, filter]);

  const loading = quotes === undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-md border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.14em]">
          {(["open", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded px-3 py-1.5 transition",
                filter === f ? "bg-accent text-white" : "text-muted hover:text-white",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <Link href="/admin/quotes/new" className="cta-primary text-xs">
          <Plus size={14} aria-hidden />
          New quote
        </Link>
      </div>

      {loading ? (
        <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
          Loading…
        </div>
      ) : visible.length === 0 ? (
        <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
          No {filter === "open" ? "open " : ""}quotes yet. When the public /quote form is
          submitted or you add one manually, it lands here.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((q) => {
            const Icon = SOURCE_ICON[q.source];
            const name = [q.lead_first_name, q.lead_last_name].filter(Boolean).join(" ").trim();
            const vehicle = [q.vehicle_year, q.vehicle_make, q.vehicle_model, q.vehicle_trim]
              .filter(Boolean)
              .join(" ")
              .trim();
            return (
              <li key={q.id}>
                <Link
                  href={`/admin/quotes/${q.id}`}
                  className="panel-border group flex flex-col gap-2 rounded-lg p-4 transition hover:border-blue-accent/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Icon size={12} aria-hidden />
                        <span className="uppercase tracking-[0.16em]">{q.source}</span>
                        <span>·</span>
                        <span>
                          {new Date(q.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-text">
                        {name || "Unknown lead"}
                        {vehicle ? (
                          <span className="text-muted"> · {vehicle}</span>
                        ) : null}
                      </p>
                      {q.services_interest.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.services_interest.map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                        STATUS_STYLE[q.status],
                      )}
                    >
                      {q.status}
                    </span>
                  </div>
                  {q.message ? (
                    <p className="line-clamp-2 text-sm text-muted">{q.message}</p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
