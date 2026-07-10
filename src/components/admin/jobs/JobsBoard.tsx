"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { CalendarDays, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { listCustomers } from "@/lib/offline/customers";
import { listJobs, setJobStatus } from "@/lib/offline/jobs";
import { listVehiclesForCustomer } from "@/lib/offline/vehicles";
import { getDB } from "@/lib/offline/db";
import type { Job, JobStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Lane = {
  status: JobStatus;
  label: string;
  hint: string;
};

const LANES: Lane[] = [
  { status: "new", label: "New", hint: "Intake — needs triage" },
  { status: "scheduled", label: "Scheduled", hint: "Approved, booked in" },
  { status: "in_shop", label: "In Shop", hint: "Being worked on" },
  { status: "ready", label: "Ready", hint: "Awaiting pickup" },
  { status: "delivered", label: "Delivered", hint: "Closed out" },
];

const NEXT_STATUS: Record<JobStatus, JobStatus | null> = {
  new: "scheduled",
  scheduled: "in_shop",
  in_shop: "ready",
  ready: "delivered",
  delivered: null,
  cancelled: null,
};

const LANE_ACCENT: Record<JobStatus, string> = {
  new: "border-l-blue-accent",
  scheduled: "border-l-cfg-orange",
  in_shop: "border-l-accent",
  ready: "border-l-emerald-400",
  delivered: "border-l-white/40",
  cancelled: "border-l-white/20",
};

export function JobsBoard() {
  const jobs = useLiveQuery(() => listJobs(), []);
  const customers = useLiveQuery(() => listCustomers(), []);
  const allVehicles = useLiveQuery(
    () => getDB().vehicles.filter((v) => !v.deleted_at).toArray(),
    [],
  );

  const customerLookup = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of customers ?? []) m.set(c.id, `${c.first_name} ${c.last_name}`);
    return m;
  }, [customers]);

  const vehicleLookup = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of allVehicles ?? []) {
      const parts = [v.year?.toString(), v.make, v.model, v.trim].filter(Boolean);
      m.set(v.id, parts.length ? parts.join(" ") : "Vehicle");
    }
    return m;
  }, [allVehicles]);

  const byLane = useMemo(() => {
    const groups: Record<JobStatus, Job[]> = {
      new: [],
      scheduled: [],
      in_shop: [],
      ready: [],
      delivered: [],
      cancelled: [],
    };
    for (const j of jobs ?? []) {
      if (j.status in groups) groups[j.status].push(j);
    }
    return groups;
  }, [jobs]);

  const loading = jobs === undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {loading ? "Loading…" : `${jobs?.length ?? 0} jobs`}
        </p>
        <Link href="/admin/jobs/new" className="cta-primary text-xs">
          <Plus size={14} aria-hidden />
          New job
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {LANES.map((lane) => (
          <section
            key={lane.status}
            className={cn(
              "rounded-lg border border-white/10 border-l-2 bg-panel/70",
              LANE_ACCENT[lane.status],
            )}
            aria-label={lane.label}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 px-4 py-3">
              <div className="flex items-baseline gap-3">
                <h3 className="font-heading text-lg uppercase tracking-wide text-text">
                  {lane.label}
                </h3>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold text-muted">
                  {byLane[lane.status].length}
                </span>
              </div>
              <p className="text-xs text-muted">{lane.hint}</p>
            </div>
            {byLane[lane.status].length === 0 ? (
              <div className="m-3 rounded-md border border-dashed border-white/10 px-3 py-4 text-center text-xs text-muted">
                Empty
              </div>
            ) : (
              <ul className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
                {byLane[lane.status].map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    customerName={
                      job.customer_id
                        ? customerLookup.get(job.customer_id) ?? "Unknown customer"
                        : null
                    }
                    vehicleName={
                      job.vehicle_id ? vehicleLookup.get(job.vehicle_id) ?? "Vehicle" : null
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

type JobCardProps = {
  job: Job;
  customerName: string | null;
  vehicleName: string | null;
};

function JobCard({ job, customerName, vehicleName }: JobCardProps) {
  const next = NEXT_STATUS[job.status];

  async function advance(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (next) await setJobStatus(job.id, next);
  }

  return (
    <li>
      <Link
        href={`/admin/jobs/${job.id}`}
        className="group flex flex-col gap-2 rounded-md border border-white/10 bg-black/30 p-3 transition hover:border-blue-accent hover:bg-white/5"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
            {job.title}
          </p>
          <ChevronRight
            size={14}
            aria-hidden
            className="mt-0.5 shrink-0 text-muted transition group-hover:text-blue-accent"
          />
        </div>
        {(customerName || vehicleName) && (
          <div className="flex flex-col gap-0.5 text-xs text-muted">
            {customerName ? <span className="truncate">{customerName}</span> : null}
            {vehicleName ? <span className="truncate">{vehicleName}</span> : null}
          </div>
        )}
        {job.scheduled_for ? (
          <div className="flex items-center gap-1.5 text-xs text-blue-accent">
            <CalendarDays size={12} aria-hidden />
            {new Date(job.scheduled_for + "T00:00:00").toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
        ) : null}
        {job.status === "in_shop" && job.stage ? (
          <span className="w-fit rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
            {job.stage.replace("_", " ")}
          </span>
        ) : null}
        {next ? (
          <button
            type="button"
            onClick={advance}
            className="mt-1 self-end rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted transition hover:border-blue-accent hover:text-white"
          >
            Move to {labelFor(next)} →
          </button>
        ) : null}
      </Link>
    </li>
  );
}

function labelFor(s: JobStatus): string {
  return LANES.find((l) => l.status === s)?.label ?? s;
}
