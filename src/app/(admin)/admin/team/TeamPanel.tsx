"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ShieldOff,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMember, UserRole } from "./actions";
import { initiatePasswordReset, inviteEmployee, setUserRole } from "./actions";

// ── role config ──────────────────────────────────────────────────────────────

const ROLES: { value: UserRole; label: string }[] = [
  { value: "admin",    label: "Admin"    },
  { value: "manager",  label: "Manager"  },
  { value: "employee", label: "Employee" },
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin:    "border-red-500/30    bg-red-500/10    text-red-400",
  manager:  "border-blue-500/30   bg-blue-500/10   text-blue-400",
  employee: "border-white/20      bg-white/5       text-muted",
};

// ── per-row reset state ──────────────────────────────────────────────────────

type RowState =
  | { type: "idle" }
  | { type: "confirm" }
  | { type: "sending" }
  | { type: "sent" }
  | { type: "error"; message: string };

// ── invite form state ────────────────────────────────────────────────────────

type InviteState =
  | { type: "idle" }
  | { type: "open" }
  | { type: "sending" }
  | { type: "sent"; email: string }
  | { type: "error"; message: string };

// ── component ────────────────────────────────────────────────────────────────

export function TeamPanel({ initialMembers }: { initialMembers: TeamMember[] }) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [inviteState, setInviteState] = useState<InviteState>({ type: "idle" });
  const [rowStates, setRowStates]     = useState<Record<string, RowState>>({});
  const [roleWorking, setRoleWorking] = useState<Record<string, boolean>>({});
  const [roleErrors,  setRoleErrors]  = useState<Record<string, string>>({});

  // Optimistic local roles — synced from props whenever the server refreshes
  const [localRoles, setLocalRoles] = useState<Record<string, UserRole | null>>(
    () => Object.fromEntries(initialMembers.map((m) => [m.id, m.role])),
  );
  useEffect(() => {
    setLocalRoles(Object.fromEntries(initialMembers.map((m) => [m.id, m.role])));
  }, [initialMembers]);

  const getRow   = (id: string): RowState => rowStates[id] ?? { type: "idle" };
  const patchRow = (id: string, next: RowState) =>
    setRowStates((prev) => ({ ...prev, [id]: next }));

  // ── invite ─────────────────────────────────────────────────────────────────

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailRef.current?.value.trim() ?? "";
    if (!email) return;

    setInviteState({ type: "sending" });
    try {
      await inviteEmployee(email);
      setInviteState({ type: "sent", email });
      router.refresh();
    } catch (err) {
      setInviteState({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to send invitation.",
      });
    }
  };

  const openInvite = () => {
    setInviteState({ type: "open" });
    setTimeout(() => emailRef.current?.focus(), 0);
  };

  // ── reset ──────────────────────────────────────────────────────────────────

  const handleReset = async (member: TeamMember) => {
    patchRow(member.id, { type: "sending" });
    try {
      await initiatePasswordReset(member.email);
      patchRow(member.id, { type: "sent" });
    } catch (err) {
      patchRow(member.id, {
        type: "error",
        message: err instanceof Error ? err.message : "Failed to send reset email.",
      });
    }
  };

  // ── role change ────────────────────────────────────────────────────────────

  const handleRoleChange = async (member: TeamMember, role: UserRole) => {
    const previous = localRoles[member.id] ?? null;

    // Optimistic update
    setLocalRoles((prev) => ({ ...prev, [member.id]: role }));
    setRoleErrors((prev) => ({ ...prev, [member.id]: "" }));
    setRoleWorking((prev) => ({ ...prev, [member.id]: true }));

    try {
      await setUserRole(member.id, role);
      router.refresh();
    } catch (err) {
      // Rollback and surface the error
      setLocalRoles((prev) => ({ ...prev, [member.id]: previous }));
      setRoleErrors((prev) => ({
        ...prev,
        [member.id]: err instanceof Error ? err.message : "Failed to update role.",
      }));
    } finally {
      setRoleWorking((prev) => ({ ...prev, [member.id]: false }));
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl uppercase tracking-wide text-text">Team</h1>
          <p className="mt-1 text-sm text-muted">
            Invite employees and manage account access. Only administrators can add or reset
            accounts.
          </p>
        </div>

        {inviteState.type === "idle" && (
          <button type="button" className="cta-primary shrink-0 text-xs" onClick={openInvite}>
            <UserPlus size={15} aria-hidden />
            Invite Employee
          </button>
        )}
      </div>

      {/* Invite form */}
      {(inviteState.type === "open" ||
        inviteState.type === "sending" ||
        inviteState.type === "error") && (
        <div className="panel-border mb-5 rounded-lg p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-accent">
            Invite new employee
          </p>
          <form onSubmit={handleInvite} className="flex flex-wrap items-start gap-3">
            <input
              ref={emailRef}
              type="email"
              className="focus-field min-w-0 flex-1"
              placeholder="employee@email.com"
              required
              disabled={inviteState.type === "sending"}
              autoComplete="off"
            />
            <div className="flex shrink-0 gap-2">
              <button
                type="submit"
                className="cta-primary text-xs"
                disabled={inviteState.type === "sending"}
              >
                {inviteState.type === "sending" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden />
                ) : (
                  <UserPlus size={15} aria-hidden />
                )}
                Send Invite
              </button>
              <button
                type="button"
                className="cta-secondary text-xs"
                disabled={inviteState.type === "sending"}
                onClick={() => setInviteState({ type: "idle" })}
              >
                Cancel
              </button>
            </div>
          </form>

          {inviteState.type === "error" && (
            <p className="mt-3 text-xs text-accent">{inviteState.message}</p>
          )}
        </div>
      )}

      {/* Success banner */}
      {inviteState.type === "sent" && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle2 size={16} aria-hidden />
            Invitation sent to{" "}
            <span className="font-semibold">{inviteState.email}</span>
          </span>
          <button
            type="button"
            className="cta-primary shrink-0 text-xs"
            onClick={openInvite}
          >
            <UserPlus size={14} aria-hidden />
            Invite Another
          </button>
        </div>
      )}

      {/* Member list */}
      <div className="panel-border overflow-hidden rounded-lg">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <Users size={15} className="text-muted" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {initialMembers.length}{" "}
            {initialMembers.length === 1 ? "account" : "accounts"}
          </span>
        </div>

        {initialMembers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            No team members yet. Invite your first employee above.
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {initialMembers.map((member) => {
              const rs = getRow(member.id);
              const isRoleWorking = roleWorking[member.id] ?? false;
              return (
                <li key={member.id} className="flex flex-wrap items-center gap-4 px-4 py-4">
                  {/* Email + meta */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text">{member.email}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      Last sign-in:{" "}
                      {member.lastSignIn
                        ? new Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(member.lastSignIn))
                        : "Never"}
                    </p>
                  </div>

                  {/* Role selector */}
                  <div className="shrink-0">
                    {isRoleWorking ? (
                      <Loader2 size={16} className="animate-spin text-muted" aria-label="Updating role…" />
                    ) : (
                      <select
                        value={localRoles[member.id] ?? ""}
                        onChange={(e) => handleRoleChange(member, e.target.value as UserRole)}
                        className={cn(
                          "cursor-pointer appearance-none rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-blue-accent/30",
                          localRoles[member.id]
                            ? ROLE_COLORS[localRoles[member.id]!]
                            : "border-white/15 bg-white/5 text-muted",
                        )}
                        aria-label={`Role for ${member.email}`}
                      >
                        <option value="" disabled>No role</option>
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value} className="bg-panel text-text">
                            {r.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {roleErrors[member.id] ? (
                      <p className="mt-1 text-xs text-accent">{roleErrors[member.id]}</p>
                    ) : null}
                  </div>

                  {/* MFA badge */}
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.12em]",
                      member.mfaEnrolled
                        ? "border border-green-500/30 bg-green-500/10 text-green-400"
                        : "border border-amber-400/30 bg-amber-400/10 text-amber-400",
                    )}
                  >
                    {member.mfaEnrolled ? (
                      <ShieldCheck size={12} aria-hidden />
                    ) : (
                      <ShieldOff size={12} aria-hidden />
                    )}
                    {member.mfaEnrolled ? "MFA on" : "No MFA"}
                  </span>

                  {/* Reset password action */}
                  <div className="shrink-0">
                    {rs.type === "idle" && (
                      <button
                        type="button"
                        className="cta-secondary text-xs"
                        onClick={() => patchRow(member.id, { type: "confirm" })}
                      >
                        Reset Password
                      </button>
                    )}

                    {rs.type === "confirm" && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">Send reset email?</span>
                        <button
                          type="button"
                          className="cta-primary text-xs"
                          onClick={() => handleReset(member)}
                        >
                          Send
                        </button>
                        <button
                          type="button"
                          className="cta-secondary text-xs"
                          onClick={() => patchRow(member.id, { type: "idle" })}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {rs.type === "sending" && (
                      <Loader2 size={18} className="animate-spin text-muted" aria-label="Sending…" />
                    )}

                    {rs.type === "sent" && (
                      <span className="flex items-center gap-1.5 text-xs text-green-400">
                        <CheckCircle2 size={14} aria-hidden />
                        Reset email sent
                      </span>
                    )}

                    {rs.type === "error" && (
                      <div className="flex items-center gap-2">
                        <span className="max-w-[180px] truncate text-xs text-accent">
                          {rs.message}
                        </span>
                        <button
                          type="button"
                          className="cta-secondary text-xs"
                          title="Try again"
                          onClick={() => patchRow(member.id, { type: "idle" })}
                        >
                          <RotateCcw size={12} aria-hidden />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
