"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getJob } from "@/lib/offline/jobs";
import { JobForm } from "./JobForm";

export function EditJob({ id }: { id: string }) {
  const job = useLiveQuery(() => getJob(id), [id]);

  if (job === undefined) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (!job || job.deleted_at) {
    return <p className="text-sm text-muted">Job not found on this device.</p>;
  }

  return <JobForm mode="edit" initial={job} />;
}
