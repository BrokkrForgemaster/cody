"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { BellRing, Check, ChevronDown, Loader2, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { listCustomers } from "@/lib/offline/customers";
import {
  createFollowUp,
  deleteFollowUp,
  listFollowUps,
  setFollowUpStatus,
} from "@/lib/offline/followUps";
import type { FollowUp, FollowUpKind } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const KINDS: { value: FollowUpKind; label: string }[] = [
  { value: "post_delivery", label: "Post-delivery" },
  { value: "review_request", label: "Review request" },
  { value: "seasonal", label: "Seasonal" },
  { value: "general", label: "General" },
  { value: "other", label: "Other" },
];

function dueBadge(due: string | null): {
  label: string;
  className: string;
  bucket: "overdue" | "today" | "upcoming" | "unscheduled";
} {
  if (!due) {
    return {
      label: "No due date",
      className: "border-white/10 bg-white/5 text-muted",
      bucket: "unscheduled",
    };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due + "T00:00:00");
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  const readable = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (diff < 0) {
    return {
      label: `${readable} · overdue`,
      className: "border-accent/50 bg-accent/10 text-accent",
      bucket: "overdue",
    };
  }
  if (diff === 0) {
    return {
      label: `${readable} · today`,
      className: "border-cfg-orange/50 bg-cfg-orange/10 text-cfg-orange",
      bucket: "today",
    };
  }
  return {
    label: readable,
    className: "border-blue-accent/40 bg-blue-accent/10 text-blue-accent",
    bucket: "upcoming",
  };
}

export function FollowUpsView() {
  const [showDone, setShowDone] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const rows = useLiveQuery(() => listFollowUps(showDone), [showDone]);
  const customers = useLiveQuery(() => listCustomers(), []);

  const customerLookup = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of customers ?? []) m.set(c.id, `${c.first_name} ${c.last_name}`);
    return m;
  }, [customers]);

  const grouped = useMemo(() => {
    const g: Record<"overdue" | "today" | "upcoming" | "unscheduled" | "done", FollowUp[]> = {
      overdue: [],
      today: [],
      upcoming: [],
      unscheduled: [],
      done: [],
    };
    for (const r of rows ?? []) {
      if (r.status !== "pending") {
        g.done.push(r);
      } else {
        g[dueBadge(r.due_on).bucket].push(r);
      }
    }
    return g;
  }, [rows]);

  const loading = rows === undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-md border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.14em]">
          <button
            type="button"
            onClick={() => setShowDone(false)}
            className={cn(
              "rounded px-3 py-1.5 transition",
              !showDone ? "bg-accent text-white" : "text-muted hover:text-white",
            )}
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => setShowDone(true)}
            className={cn(
              "rounded px-3 py-1.5 transition",
              showDone ? "bg-accent text-white" : "text-muted hover:text-white",
            )}
          >
            All
          </button>
        </div>
        <button
          type="button"
          className="cta-primary text-xs"
          onClick={() => setAddOpen((v) => !v)}
        >
          {addOpen ? (
            <>
              <X size={14} aria-hidden />
              Close
            </>
          ) : (
            <>
              <Plus size={14} aria-hidden />
              Add follow-up
            </>
          )}
        </button>
      </div>

      {addOpen ? <AddFollowUpForm onDone={() => setAddOpen(false)} /> : null}

      {loading ? (
        <p className="panel-border rounded-lg p-10 text-center text-sm text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="panel-border flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <BellRing size={28} className="text-blue-accent" aria-hidden />
          <p className="font-heading text-2xl uppercase text-text">Nothing to follow up on</p>
          <p className="max-w-md text-sm text-muted">
            Add tasks for post-delivery check-ins, review requests, or seasonal outreach.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {(["overdue", "today", "upcoming", "unscheduled", "done"] as const).map((bucket) => {
            const items = grouped[bucket];
            if (items.length === 0) return null;
            if (bucket === "done" && !showDone) return null;
            return (
              <FollowUpBucket
                key={bucket}
                bucket={bucket}
                items={items}
                customerLookup={customerLookup}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

const BUCKET_LABEL: Record<
  "overdue" | "today" | "upcoming" | "unscheduled" | "done",
  string
> = {
  overdue: "Overdue",
  today: "Today",
  upcoming: "Upcoming",
  unscheduled: "No due date",
  done: "Done / skipped",
};

function FollowUpBucket({
  bucket,
  items,
  customerLookup,
}: {
  bucket: "overdue" | "today" | "upcoming" | "unscheduled" | "done";
  items: FollowUp[];
  customerLookup: Map<string, string>;
}) {
  const [open, setOpen] = useState(bucket !== "done");
  return (
    <section aria-label={BUCKET_LABEL[bucket]}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 border-b border-white/10 pb-2 text-left"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          <span>{BUCKET_LABEL[bucket]}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-muted">
            {items.length}
          </span>
        </div>
        <ChevronDown
          size={14}
          aria-hidden
          className={cn("transition", open ? "" : "-rotate-90")}
        />
      </button>
      {open ? (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((f) => (
            <FollowUpRow key={f.id} item={f} customerLookup={customerLookup} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function FollowUpRow({
  item,
  customerLookup,
}: {
  item: FollowUp;
  customerLookup: Map<string, string>;
}) {
  const badge = dueBadge(item.due_on);
  const isDone = item.status !== "pending";
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await setFollowUpStatus(item.id, isDone ? "pending" : "done");
    setBusy(false);
  }

  async function onDelete() {
    setBusy(true);
    await deleteFollowUp(item.id);
    setBusy(false);
  }

  return (
    <li className="panel-border flex items-start gap-3 rounded-lg p-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={cn(
          "mt-1 grid size-6 shrink-0 place-items-center rounded-md border transition",
          isDone
            ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-300"
            : "border-white/20 bg-white/5 text-transparent hover:border-blue-accent hover:text-blue-accent",
        )}
        aria-label={isDone ? "Mark as pending" : "Mark done"}
      >
        {busy ? <Loader2 size={12} className="animate-spin text-white" aria-hidden /> : <Check size={12} aria-hidden />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <p
            className={cn(
              "font-semibold",
              isDone ? "text-muted line-through" : "text-text",
            )}
          >
            {item.title}
          </p>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
              badge.className,
            )}
          >
            {badge.label}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {item.kind.replace("_", " ")}
          </span>
        </div>
        {item.notes ? (
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{item.notes}</p>
        ) : null}
        {item.customer_id ? (
          <p className="mt-1 text-xs text-muted">
            {customerLookup.get(item.customer_id) ?? "Customer"}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="rounded-md border border-white/10 bg-white/5 p-1.5 text-muted transition hover:border-accent hover:text-white"
        aria-label="Delete follow-up"
      >
        <Trash2 size={12} aria-hidden />
      </button>
    </li>
  );
}

function AddFollowUpForm({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const customers = useLiveQuery(() => listCustomers(), []);
  const sortedCustomers = useMemo(
    () =>
      [...(customers ?? [])].sort((a, b) =>
        `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`),
      ),
    [customers],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) {
      setBusy(false);
      return;
    }
    await createFollowUp({
      title,
      notes: String(form.get("notes") ?? "").trim() || null,
      kind: (form.get("kind") as FollowUpKind) || "general",
      status: "pending",
      due_on: String(form.get("due_on") ?? "") || null,
      customer_id: String(form.get("customer_id") ?? "") || null,
      job_id: null,
      completed_at: null,
      assigned_to: null,
      created_by: null,
    });
    setBusy(false);
    onDone();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="panel-border flex flex-col gap-3 rounded-lg p-4"
    >
      <input
        name="title"
        placeholder="What needs following up?"
        required
        className="focus-field"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="kind" defaultValue="general" className="focus-field">
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
        <input name="due_on" type="date" className="focus-field" />
        <select name="customer_id" defaultValue="" className="focus-field">
          <option value="">— No customer —</option>
          {sortedCustomers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.last_name}, {c.first_name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="notes"
        rows={2}
        placeholder="Notes (optional)"
        className="focus-field resize-y"
      />
      <div className="flex gap-2">
        <button type="submit" className="cta-primary text-xs" disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={12} className="animate-spin" aria-hidden />
              Adding…
            </>
          ) : (
            "Add"
          )}
        </button>
        <button type="button" className="cta-secondary text-xs" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
