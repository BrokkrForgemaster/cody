"use client";

import { CheckCircle2, KeyRound, Loader2, RefreshCw, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type TotpFactor = {
  id: string;
  friendly_name?: string;
  factor_type: "totp";
  status: "verified" | "unverified";
  created_at: string;
  updated_at: string;
  last_challenged_at?: string;
};

type Enrollment = {
  challengeId: string;
  expiresAt: number;
  factorId: string;
  qrCode: string;
  secret: string;
};

type AalState = {
  currentLevel: string | null;
  nextLevel: string | null;
};

type RefreshOptions = {
  clearError?: boolean;
  showLoading?: boolean;
};

function formatDate(value?: string) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function MfaSetup() {
  const [aal, setAal] = useState<AalState | null>(null);
  const [code, setCode] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const verifiedFactors = useMemo(
    () => factors.filter((factor) => factor.status === "verified"),
    [factors],
  );

  const refresh = useCallback(async (options: RefreshOptions = {}) => {
    const { clearError = false, showLoading = false } = options;

    if (showLoading) {
      setLoading(true);
    }
    if (clearError) {
      setError(null);
    }

    const supabase = getSupabaseBrowserClient();
    const [factorResult, aalResult] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

    if (factorResult.error) {
      setError(factorResult.error.message);
    } else {
      const totpFactors = factorResult.data.all.filter(
        (factor): factor is TotpFactor => factor.factor_type === "totp",
      );
      setFactors(totpFactors);
    }

    if (aalResult.error) {
      setAal(null);
    } else {
      setAal({
        currentLevel: aalResult.data.currentLevel,
        nextLevel: aalResult.data.nextLevel,
      });
    }

    if (showLoading) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh({ clearError: true, showLoading: true });
  }, [refresh]);

  const startEnrollment = async () => {
    setWorking(true);
    setError(null);
    setStatus(null);
    setCode("");

    const supabase = getSupabaseBrowserClient();

    const factorsResult = await supabase.auth.mfa.listFactors();
    if (factorsResult.error) {
      setError(factorsResult.error.message);
      setWorking(false);
      return;
    }

    const staleTotpFactors = factorsResult.data.all.filter(
      (factor) => factor.factor_type === "totp" && factor.status === "unverified",
    );

    for (const factor of staleTotpFactors) {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: factor.id,
      });

      if (unenrollError) {
        setError(unenrollError.message);
        setWorking(false);
        return;
      }
    }

    const enrollResult = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Google Authenticator",
      issuer: "Forged Customs",
    });

    if (enrollResult.error) {
      setError(enrollResult.error.message);
      setWorking(false);
      await refresh();
      return;
    }

    const challengeResult = await supabase.auth.mfa.challenge({
      factorId: enrollResult.data.id,
    });

    if (challengeResult.error) {
      setError(challengeResult.error.message);
      setWorking(false);
      await refresh();
      return;
    }

    setEnrollment({
      challengeId: challengeResult.data.id,
      expiresAt: challengeResult.data.expires_at,
      factorId: enrollResult.data.id,
      qrCode: enrollResult.data.totp.qr_code,
      secret: enrollResult.data.totp.secret,
    });
    setFactors((current) => [
      ...current.filter((factor) => factor.id !== enrollResult.data.id),
      {
        id: enrollResult.data.id,
        created_at: new Date().toISOString(),
        factor_type: "totp",
        friendly_name: enrollResult.data.friendly_name,
        status: "unverified",
        updated_at: new Date().toISOString(),
      },
    ]);
    setStatus("Authenticator setup started.");
    setWorking(false);
    await refresh();
  };

  const refreshChallenge = async () => {
    if (!enrollment) return;
    setWorking(true);
    setError(null);
    setStatus(null);

    const { data, error: challengeError } = await getSupabaseBrowserClient().auth.mfa.challenge({
      factorId: enrollment.factorId,
    });

    if (challengeError) {
      setError(challengeError.message);
    } else {
      setEnrollment({
        ...enrollment,
        challengeId: data.id,
        expiresAt: data.expires_at,
      });
      setStatus("Verification challenge refreshed.");
    }

    setWorking(false);
  };

  const verifyEnrollment = async () => {
    if (!enrollment) return;
    const cleanCode = normalizeCode(code);

    if (cleanCode.length !== 6) {
      setError("Enter the 6-digit code from Google Authenticator.");
      return;
    }

    setWorking(true);
    setError(null);
    setStatus(null);

    const { error: verifyError } = await getSupabaseBrowserClient().auth.mfa.verify({
      challengeId: enrollment.challengeId,
      code: cleanCode,
      factorId: enrollment.factorId,
    });

    if (verifyError) {
      setError(verifyError.message);
      setWorking(false);
      return;
    }

    setEnrollment(null);
    setCode("");
    setStatus("Google Authenticator is verified for this account.");
    setWorking(false);
    await refresh();
  };

  const removeFactor = async (factorId: string) => {
    const confirmed = window.confirm("Remove this authenticator factor?");
    if (!confirmed) return;

    setWorking(true);
    setError(null);
    setStatus(null);

    const { error: unenrollError } = await getSupabaseBrowserClient().auth.mfa.unenroll({
      factorId,
    });

    if (unenrollError) {
      setError(unenrollError.message);
    } else {
      setStatus("Authenticator factor removed.");
      if (enrollment?.factorId === factorId) {
        setEnrollment(null);
        setCode("");
      }
    }

    setWorking(false);
    await refresh();
  };

  if (loading) {
    return (
      <div className="panel-border rounded-lg p-8 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" aria-hidden />
          Loading security settings...
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <section className="panel-border rounded-lg p-6" aria-labelledby="mfa-setup-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">
              Google Authenticator
            </p>
            <h2 id="mfa-setup-title" className="mt-2 font-heading text-2xl uppercase text-text">
              Multi-factor setup
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Add a one-time code requirement for admin sign-in.
            </p>
          </div>
          <button
            type="button"
            className="cta-primary text-xs"
            onClick={startEnrollment}
            disabled={working || Boolean(enrollment)}
          >
            {working && !enrollment ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <KeyRound size={16} aria-hidden />}
            {enrollment ? "Setup in progress" : "Set up authenticator"}
          </button>
        </div>

        {error ? (
          <div className="mt-5 flex gap-3 rounded-md border border-accent/40 bg-accent/10 p-3 text-sm text-white" role="alert">
            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            <p>{error}</p>
          </div>
        ) : null}

        {status ? (
          <div className="mt-5 flex gap-3 rounded-md border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100" role="status">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden />
            <p>{status}</p>
          </div>
        ) : null}

        {enrollment ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-lg border border-white/10 bg-white p-3">
              <img
                src={enrollment.qrCode}
                alt="Google Authenticator QR code"
                className="aspect-square w-full"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="mfa-secret"
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
                >
                  Manual key
                </label>
                <input
                  id="mfa-secret"
                  className="focus-field mt-2 font-mono"
                  readOnly
                  type="text"
                  value={enrollment.secret}
                />
              </div>

              <div>
                <label
                  htmlFor="mfa-code"
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
                >
                  Authenticator code
                </label>
                <input
                  id="mfa-code"
                  className="focus-field mt-2"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]*"
                  placeholder="123456"
                  value={code}
                  onChange={(event) => setCode(normalizeCode(event.target.value))}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="cta-primary text-xs"
                  onClick={verifyEnrollment}
                  disabled={working}
                >
                  {working ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ShieldCheck size={16} aria-hidden />}
                  Verify code
                </button>
                <button
                  type="button"
                  className="cta-secondary text-xs"
                  onClick={refreshChallenge}
                  disabled={working}
                >
                  <RefreshCw size={16} aria-hidden />
                  Refresh
                </button>
              </div>

              <p className="text-xs text-muted">
                Challenge expires {formatDate(new Date(enrollment.expiresAt * 1000).toISOString())}.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Authenticator factors
          </h3>

          {factors.length ? (
            <ul className="mt-3 divide-y divide-white/10 rounded-lg border border-white/10">
              {factors.map((factor) => (
                <li key={factor.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-text">
                      {factor.friendly_name ?? "Google Authenticator"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                      {factor.status} - Added {formatDate(factor.created_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-accent/20"
                    onClick={() => removeFactor(factor.id)}
                    disabled={working}
                  >
                    <Trash2 size={15} aria-hidden />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-white/15 p-4 text-sm text-muted">
              No authenticator app is set up for this account.
            </p>
          )}
        </div>
      </section>

      <aside className="panel-border rounded-lg p-6" aria-label="MFA status">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-md border border-white/10 bg-white/5">
            <ShieldCheck size={20} className="text-blue-accent" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Account status
            </p>
            <p className="font-semibold text-text">
              {verifiedFactors.length ? "Authenticator active" : "Authenticator not set"}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 text-sm">
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-[0.18em] text-muted">Verified factors</dt>
            <dd className="mt-1 text-2xl font-semibold text-text">{verifiedFactors.length}</dd>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-[0.18em] text-muted">Current AAL</dt>
            <dd className="mt-1 text-sm font-semibold uppercase text-text">
              {aal?.currentLevel ?? "Unknown"}
            </dd>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-[0.18em] text-muted">Next AAL</dt>
            <dd className="mt-1 text-sm font-semibold uppercase text-text">
              {aal?.nextLevel ?? "Unknown"}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
