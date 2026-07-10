"use client";

import { useEffect } from "react";
import { refreshAttachments } from "@/lib/offline/attachments";
import { refreshCountEntries, refreshCountSessions } from "@/lib/offline/counts";
import { refreshCustomers } from "@/lib/offline/customers";
import { refreshFollowUps } from "@/lib/offline/followUps";
import { refreshBatches, refreshMovements } from "@/lib/offline/inventory";
import { refreshJobs } from "@/lib/offline/jobs";
import { refreshMessages } from "@/lib/offline/messages";
import { refreshParts } from "@/lib/offline/parts";
import { initOfflineSync } from "@/lib/offline/queue";
import { refreshQuotes } from "@/lib/offline/quotes";
import { refreshVehicles } from "@/lib/offline/vehicles";

/**
 * Pull every mirrored table from Supabase into the local Dexie store. Each
 * refresh is independent and failures are logged, not surfaced, so the app
 * keeps working offline. Runs on mount and again whenever the browser
 * reconnects.
 */
function refreshAll() {
  const refreshers: Array<[string, () => Promise<unknown>]> = [
    ["customers", refreshCustomers],
    ["vehicles", refreshVehicles],
    ["jobs", refreshJobs],
    ["quotes", refreshQuotes],
    ["follow-ups", refreshFollowUps],
    ["parts", refreshParts],
    ["batches", refreshBatches],
    ["movements", refreshMovements],
    ["count sessions", refreshCountSessions],
    ["count entries", refreshCountEntries],
    ["messages", refreshMessages],
    ["attachments", refreshAttachments],
  ];
  for (const [label, run] of refreshers) {
    run().catch((err) => console.warn(`[sync] ${label} refresh failed`, err));
  }
}

/**
 * Mounted once inside the admin shell. Kicks off the mutation-queue drain
 * loop, then hydrates the local Dexie store from Supabase for tables the
 * user has been recently working with. Silent — errors are logged, not
 * surfaced, because the app should keep working offline.
 */
export function SyncBoot() {
  useEffect(() => {
    initOfflineSync();
    refreshAll();
    // When connectivity returns, pull fresh reads (the write queue already
    // re-drains on this event via initOfflineSync).
    const onOnline = () => refreshAll();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return null;
}
