"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AdminShell } from "./AdminShell";

/**
 * Derive display initials from an email local-part. Mirrors the logic that
 * previously lived in the server layout.
 */
function initialsFor(email: string): string {
  const [local] = email.split("@");
  if (!local) return "??";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

type GateState =
  | { status: "loading" }
  | { status: "authed"; email: string }
  | { status: "anon" };

/**
 * Client-side auth gate. Reads the persisted Supabase session from local
 * storage (cookie store) with no network, so the admin shell renders offline.
 * Online, an unauthenticated user is redirected to /login; the server
 * middleware still enforces auth on any request that actually reaches it.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    const apply = (session: Session | null) => {
      if (!active) return;
      if (session?.user) {
        setState({
          status: "authed",
          email: session.user.email ?? "user@forgedcustoms",
        });
      } else {
        setState({ status: "anon" });
        // Only bounce to /login when we can actually reach it. Offline, a
        // shop device keeps its persisted session, so this branch is rare.
        if (typeof navigator !== "undefined" && navigator.onLine) {
          router.replace("/login");
        }
      }
    };

    // getSession() reads the persisted session locally (no network call),
    // which is what lets the shell boot with no connectivity.
    supabase.auth.getSession().then(({ data }) => apply(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => apply(session));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (state.status === "authed") {
    return (
      <AdminShell userInitials={initialsFor(state.email)} userEmail={state.email}>
        {children}
      </AdminShell>
    );
  }

  if (state.status === "anon") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center text-text">
        <div className="max-w-sm space-y-2">
          <p className="text-lg font-semibold">Signed out</p>
          <p className="text-sm text-muted">
            {typeof navigator !== "undefined" && !navigator.onLine
              ? "You're offline and no saved session was found. Reconnect and sign in to continue."
              : "Redirecting to sign in..."}
          </p>
        </div>
      </div>
    );
  }

  // Brief local-read window before the session resolves.
  return <div className="min-h-screen bg-background" aria-hidden />;
}
