"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, Bell, Briefcase, FileText } from "lucide-react";
import { listFollowUps } from "@/lib/offline/followUps";
import { listJobs } from "@/lib/offline/jobs";
import { listParts } from "@/lib/offline/parts";
import { listQuotes } from "@/lib/offline/quotes";
import type { Job } from "@/lib/supabase/types";

const OPEN_STATUSES: Job["status"][] = ["new", "scheduled", "in_shop", "ready"];

const PIPELINE_STAGES: { status: Job["status"]; label: string }[] = [
  { status: "new", label: "New" },
  { status: "scheduled", label: "Scheduled" },
  { status: "in_shop", label: "In Shop" },
  { status: "ready", label: "Ready" },
  { status: "delivered", label: "Delivered" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function weekAgoStr() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
}

export function DashboardStats() {
  const jobs = useLiveQuery(() => listJobs(), []);
  const quotes = useLiveQuery(() => listQuotes(), []);
  const followUps = useLiveQuery(() => listFollowUps(), []); // pending only, sorted by due_on
  const parts = useLiveQuery(() => listParts(), []);

  const loading = !jobs || !quotes || !followUps || !parts;
  const today = todayStr();
  const weekAgo = weekAgoStr();

  const openJobs = jobs?.filter((j) => OPEN_STATUSES.includes(j.status)) ?? [];
  const inShop = jobs?.filter((j) => j.status === "in_shop").length ?? 0;
  const ready = jobs?.filter((j) => j.status === "ready").length ?? 0;

  const quotesThisWeek = quotes?.filter((q) => q.created_at >= weekAgo) ?? [];
  const awaitingContact = quotesThisWeek.filter((q) => q.status === "new").length;

  const followUpsDue = followUps?.filter((f) => f.due_on != null && f.due_on <= today) ?? [];
  const overdue = followUps?.filter((f) => f.due_on != null && f.due_on < today).length ?? 0;

  const lowStock = parts?.filter((p) => p.min_qty > 0 && p.on_hand < p.min_qty) ?? [];

  const stats = [
    {
      label: "Open jobs",
      value: loading ? "—" : String(openJobs.length),
      trend: loading
        ? ""
        : openJobs.length === 0
          ? "All clear"
          : `${inShop} in shop · ${ready} ready`,
      href: "/admin/jobs",
      Icon: Briefcase,
    },
    {
      label: "Quotes this week",
      value: loading ? "—" : String(quotesThisWeek.length),
      trend: loading
        ? ""
        : quotesThisWeek.length === 0
          ? "No new quotes"
          : `${awaitingContact} awaiting contact`,
      href: "/admin/quotes",
      Icon: FileText,
    },
    {
      label: "Low-stock parts",
      value: loading ? "—" : String(lowStock.length),
      trend: loading
        ? ""
        : lowStock.length === 0
          ? "All stocked"
          : `${lowStock.length} item${lowStock.length === 1 ? "" : "s"} below minimum`,
      href: "/admin/inventory",
      Icon: AlertTriangle,
    },
    {
      label: "Follow-ups due",
      value: loading ? "—" : String(followUpsDue.length),
      trend: loading
        ? ""
        : overdue > 0
          ? `${overdue} overdue`
          : followUpsDue.length === 0
            ? "All clear"
            : "Due today",
      href: "/admin/follow-ups",
      Icon: Bell,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, trend, href, Icon }) => (
          <Link
            key={label}
            href={href}
            className="panel-border group rounded-lg p-5 transition hover:border-blue-accent/60 hover:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                {label}
              </p>
              <Icon size={14} className="text-muted" aria-hidden />
            </div>
            <p className="mt-2 font-heading text-4xl uppercase leading-none text-text">{value}</p>
            <p className="mt-2 text-xs text-muted">{trend}</p>
          </Link>
        ))}
      </section>

      {/* Jobs pipeline */}
      {jobs && (
        <section aria-label="Jobs pipeline">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">
            Jobs pipeline
          </h2>
          <div className="panel-border flex divide-x divide-white/10 overflow-hidden rounded-lg">
            {PIPELINE_STAGES.map(({ status, label }) => {
              const count = jobs.filter((j) => j.status === status).length;
              return (
                <Link
                  key={status}
                  href="/admin/jobs"
                  className="flex-1 p-4 text-center transition hover:bg-white/5"
                >
                  <p className="font-heading text-2xl uppercase leading-none text-text">{count}</p>
                  <p className="mt-1 text-xs text-muted">{label}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Pending follow-ups */}
      {followUps && followUps.length > 0 && (
        <section aria-label="Pending follow-ups">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">
              Pending follow-ups
            </h2>
            <Link
              href="/admin/follow-ups"
              className="text-xs text-muted transition hover:text-blue-accent"
            >
              View all
            </Link>
          </div>
          <div className="panel-border divide-y divide-white/10 overflow-hidden rounded-lg">
            {followUps.slice(0, 5).map((f) => {
              const isOverdue = f.due_on != null && f.due_on < today;
              const isToday = f.due_on === today;
              return (
                <div key={f.id} className="flex items-center justify-between px-4 py-3">
                  <p className="truncate text-sm text-text">{f.title}</p>
                  {f.due_on && (
                    <span
                      className={`ml-4 shrink-0 rounded border px-2 py-0.5 text-xs ${
                        isOverdue
                          ? "border-accent/50 bg-accent/10 text-accent"
                          : isToday
                            ? "border-blue-accent/50 bg-blue-accent/10 text-blue-accent"
                            : "border-white/10 bg-white/5 text-muted"
                      }`}
                    >
                      {isOverdue
                        ? "Overdue"
                        : isToday
                          ? "Today"
                          : new Date(f.due_on + "T00:00:00").toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
