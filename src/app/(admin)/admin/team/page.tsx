import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { listTeamMembers } from "./actions";
import { TeamPanel } from "./TeamPanel";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  let members;
  let configError: string | null = null;

  try {
    members = await listTeamMembers();
  } catch (err) {
    configError = err instanceof Error ? err.message : "Failed to load team members.";
    members = [];
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        eyebrow="Admin"
        title="Team"
        description="Invite employees and manage roles."
      />

      {configError ? (
        <div className="flex gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-white">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="font-semibold">Service key not configured</p>
            <p className="mt-1 text-muted">{configError}</p>
            <p className="mt-2 text-xs text-muted">
              Add <code className="rounded bg-black/40 px-1 py-0.5 text-text">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
              <code className="rounded bg-black/40 px-1 py-0.5 text-text">.env.local</code> to enable team management.
            </p>
          </div>
        </div>
      ) : (
        <TeamPanel initialMembers={members} />
      )}
    </div>
  );
}
