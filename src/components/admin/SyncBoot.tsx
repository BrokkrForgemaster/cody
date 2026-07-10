"use client";

import { useEffect } from "react";
import { refreshCountEntries, refreshCountSessions } from "@/lib/offline/counts";
import { refreshCustomers } from "@/lib/offline/customers";
import { refreshFollowUps } from "@/lib/offline/followUps";
import { refreshBatches, refreshMovements } from "@/lib/offline/inventory";
import { refreshJobs } from "@/lib/offline/jobs";
import { refreshParts } from "@/lib/offline/parts";
import { initOfflineSync } from "@/lib/offline/queue";
import { refreshQuotes } from "@/lib/offline/quotes";
import { refreshVehicles } from "@/lib/offline/vehicles";

/**
 * Mounted once inside the admin shell. Kicks off the mutation-queue drain
 * loop, then hydrates the local Dexie store from Supabase for tables the
 * user has been recently working with. Silent — errors are logged, not
 * surfaced, because the app should keep working offline.
 */
export function SyncBoot() {
  useEffect(() => {
    initOfflineSync();
    refreshCustomers().catch((err) => {
      console.warn("[sync] customers refresh failed", err);
    });
    refreshVehicles().catch((err) => {
      console.warn("[sync] vehicles refresh failed", err);
    });
    refreshJobs().catch((err) => {
      console.warn("[sync] jobs refresh failed", err);
    });
    refreshQuotes().catch((err) => {
      console.warn("[sync] quotes refresh failed", err);
    });
    refreshFollowUps().catch((err) => {
      console.warn("[sync] follow-ups refresh failed", err);
    });
    refreshParts().catch((err) => {
      console.warn("[sync] parts refresh failed", err);
    });
    refreshBatches().catch((err) => {
      console.warn("[sync] batches refresh failed", err);
    });
    refreshMovements().catch((err) => {
      console.warn("[sync] movements refresh failed", err);
    });
    refreshCountSessions().catch((err) => {
      console.warn("[sync] count sessions refresh failed", err);
    });
    refreshCountEntries().catch((err) => {
      console.warn("[sync] count entries refresh failed", err);
    });
  }, []);

  return null;
}
