"use client";

import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { AdminShell } from "./AdminShell";
import { MfaSetup } from "./security/MfaSetup";

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
  | { status: "mfa"; email: string; factorId: string; factorName: string }
  | { status: "must-enroll"; email: string }
  | { status: "anon" };

function MfaChallenge({
  email,
  factorId,
  factorName,
  onSignOut,
  onVerified,
}: {
  email: string;
  factorId: string;
  factorName: string;
  onSignOut: () => Promise<void>;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const verify = async () => {
    const cleanCode = code.replace(/\D/g, "").slice(0, 6);

    if (cleanCode.length !== 6) {
      setError("Enter the 6-digit Google Authenticator code.");
      return;
    }

    setPending(true);
    setError(null);

    const { error: verifyError } =
      await getSupabaseBrowserClient().auth.mfa.challengeAndVerify({
        code: cleanCode,
        factorId,
      });

    if (verifyError) {
      setError(verifyError.message);
      setPending(false);
      return;
    }

    onVerified();
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 py-10 text-text">
      <div className="w-full max-w-md">
        <div className="panel-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md border border-white/10 bg-white/5">
              <ShieldCheck size={20} className="text-blue-accent" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">
                Multi-factor required
              </p>
              <h1 className="font-heading text-2xl uppercase text-text">Verify sign-in</h1>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Signed in as</p>
            <p className="mt-1 truncate text-sm text-text">{email}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">Authenticator</p>
            <p className="mt-1 text-sm text-text">{factorName}</p>
          </div>

          <div className="mt-5">
            <label
              htmlFor="admin-mfa-code"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
            >
              Google Authenticator code
            </label>
            <input
              id="admin-mfa-code"
              className="focus-field mt-2"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  verify();
                }
              }}
            />
          </div>

          {error ? (
            <div className="mt-4 flex gap-3 rounded-md border border-accent/40 bg-accent/10 p-3 text-sm text-white" role="alert">
              <TriangleAlert size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
              <p>{error}</p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="cta-primary flex-1 text-xs"
              onClick={verify}
              disabled={pending}
            >
              {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ShieldCheck size={16} aria-hidden />}
              Verify code
            </button>
            <button
              type="button"
              className="cta-secondary flex-1 text-xs"
              onClick={onSignOut}
              disabled={pending}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

    const apply = async (session: Session | null) => {
      if (!active) return;
      if (session?.user) {
        const email = session.user.email ?? "user@forgedcustoms";

        if (typeof navigator !== "undefined" && navigator.onLine) {
          const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

          if (!active) return;
          if (aal?.currentLevel !== "aal2") {
            if (aal?.nextLevel === "aal2") {
              const { data: factorData, error } = await supabase.auth.mfa.listFactors();
              const factor = error ? null : factorData.totp[0];

              if (factor) {
                setState({
                  status: "mfa",
                  email,
                  factorId: factor.id,
                  factorName: factor.friendly_name ?? "Google Authenticator",
                });
                return;
              }
            } else {
              setState({ status: "must-enroll", email });
              return;
            }
          }
        }

        setState({
          status: "authed",
          email,
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
    supabase.auth.getSession().then(({ data }) => {
      apply(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => apply(session));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace("/login");
  };

  if (state.status === "authed") {
    return (
      <AdminShell userInitials={initialsFor(state.email)} userEmail={state.email}>
        {children}
      </AdminShell>
    );
  }

  if (state.status === "mfa") {
    return (
      <MfaChallenge
        email={state.email}
        factorId={state.factorId}
        factorName={state.factorName}
        onSignOut={handleSignOut}
        onVerified={() => setState({ status: "authed", email: state.email })}
      />
    );
  }

  if (state.status === "must-enroll") {
    return (
      <div className="min-h-screen bg-background px-6 py-10 text-text">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md border border-white/10 bg-white/5">
              <ShieldCheck size={20} className="text-blue-accent" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">
                Access restricted
              </p>
              <h1 className="font-heading text-2xl uppercase text-text">MFA Required</h1>
            </div>
          </div>
          <p className="mb-8 text-sm text-muted">
            Google Authenticator must be configured before you can access the admin panel.
          </p>
          <MfaSetup />
          <div className="mt-6">
            <button type="button" className="cta-secondary text-xs" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </div>
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
