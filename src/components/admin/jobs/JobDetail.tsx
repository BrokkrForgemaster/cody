"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { CalendarDays, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JobAttachments } from "@/components/admin/attachments/JobAttachments";
import { MessageHistory } from "@/components/admin/messages/MessageHistory";
import { SendMessage } from "@/components/admin/messages/SendMessage";
import { getCustomer } from "@/lib/offline/customers";
import { deleteJob, getJob } from "@/lib/offline/jobs";
import { getVehicle } from "@/lib/offline/vehicles";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  scheduled: "Scheduled",
  in_shop: "In Shop",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function JobDetail({ id }: { id: string }) {
  const router = useRouter();
  const job = useLiveQuery(() => getJob(id), [id]);
  const customer = useLiveQuery(
    () => (job?.customer_id ? getCustomer(job.customer_id) : Promise.resolve(undefined)),
    [job?.customer_id],
  );
  const vehicle = useLiveQuery(
    () => (job?.vehicle_id ? getVehicle(job.vehicle_id) : Promise.resolve(undefined)),
    [job?.vehicle_id],
  );

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (job === undefined) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (!job || job.deleted_at) {
    return (
      <div className="panel-border rounded-lg p-10 text-center text-sm text-muted">
        This job was not found on this device.
      </div>
    );
  }

  async function onDelete() {
    if (!job) return;
    setDeleting(true);
    await deleteJob(job.id);
    router.push("/admin/jobs");
    router.refresh();
  }

  const vehicleName = vehicle
    ? [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ")
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="panel-border rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">
              {STATUS_LABEL[job.status] ?? job.status}
              {job.stage ? ` · ${job.stage}` : ""}
            </p>
            <h2 className="font-heading text-3xl uppercase text-text">{job.title}</h2>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
              {customer ? (
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="hover:text-white"
                >
                  {customer.first_name} {customer.last_name}
                </Link>
              ) : null}
              {vehicleName ? <span>{vehicleName}</span> : null}
              {job.scheduled_for ? (
                <span className="inline-flex items-center gap-1.5 text-blue-accent">
                  <CalendarDays size={14} aria-hidden />
                  {new Date(job.scheduled_for + "T00:00:00").toLocaleDateString()}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/jobs/${job.id}/edit`} className="cta-secondary text-xs">
              <Pencil size={14} aria-hidden />
              Edit
            </Link>
            {confirming ? (
              <>
                <button
                  type="button"
                  className="cta-primary text-xs"
                  onClick={onDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden />
                      Deleting…
                    </>
                  ) : (
                    "Confirm delete"
                  )}
                </button>
                <button
                  type="button"
                  className="cta-secondary text-xs"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="cta-secondary text-xs"
                onClick={() => setConfirming(true)}
              >
                <Trash2 size={14} aria-hidden />
                Delete
              </button>
            )}
          </div>
        </div>

        {job.summary ? (
          <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{job.summary}</p>
        ) : null}
      </div>

      <div className="panel-border rounded-lg p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-xl uppercase text-text">Attachments</h3>
        </div>
        <JobAttachments jobId={job.id} />
      </div>

      <div className="panel-border rounded-lg p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-xl uppercase text-text">Messages</h3>
          <SendMessage
            customerId={customer?.id ?? null}
            jobId={job.id}
            customerFirstName={customer?.first_name}
            email={customer?.email}
            phone={customer?.phone}
          />
        </div>
        <MessageHistory jobId={job.id} />
      </div>
    </div>
  );
}
