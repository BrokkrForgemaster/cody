"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getPart } from "@/lib/offline/parts";
import { PartForm } from "./PartForm";

export function EditPart({ id }: { id: string }) {
  const part = useLiveQuery(() => getPart(id), [id]);
  if (part === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (!part || part.deleted_at) return <p className="text-sm text-muted">Part not found.</p>;
  return <PartForm mode="edit" initial={part} />;
}
