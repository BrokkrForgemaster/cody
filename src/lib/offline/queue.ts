// Mutation queue — writes are appended locally and drained to Supabase when
// online. Simple last-write-wins semantics for phase 1; conflict-aware sync
// can be added later without changing call sites.
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getDB, type PendingMutation } from "./db";

type MutationInput = Omit<PendingMutation, "createdAt" | "attempts">;

export async function enqueue(mutation: MutationInput): Promise<void> {
  const db = getDB();
  await db.pending.put({
    ...mutation,
    createdAt: Date.now(),
    attempts: 0,
  });
  // Fire-and-forget drain — errors are stored on the row for later retry.
  void drain();
}

let draining = false;

export async function drain(): Promise<void> {
  if (draining) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  draining = true;
  try {
    const db = getDB();
    const supabase = getSupabaseBrowserClient();
    const pending = await db.pending.orderBy("createdAt").toArray();

    for (const m of pending) {
      // Sync layer is generic across tables — Supabase's typed builder can't
      // narrow a runtime union like `m.table`, so we widen at this boundary.
      // Payload shape is enforced upstream in the per-table helpers.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const from = (t: PendingMutation["table"]) => (supabase.from(t) as any);
      try {
        if (m.op === "insert") {
          const { error } = await from(m.table).insert(m.payload);
          if (error) throw error;
        } else if (m.op === "update") {
          const { id, ...rest } = m.payload as { id: string } & Record<string, unknown>;
          const { error } = await from(m.table).update(rest).eq("id", id);
          if (error) throw error;
        } else if (m.op === "delete") {
          const { id } = m.payload as { id: string };
          const { error } = await from(m.table)
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", id);
          if (error) throw error;
        }
        await db.pending.delete(m.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await db.pending.update(m.id, {
          attempts: m.attempts + 1,
          lastError: message,
        });
        // Stop the drain on the first failure — next reconnect will retry.
        break;
      }
    }
  } finally {
    draining = false;
  }
}

export function initOfflineSync() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => void drain());
  void drain();
}
