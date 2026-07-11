"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, KeyRound, Loader2, TriangleAlert } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { siteSettings } from "@/data/siteSettings";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle");
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    getSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => setSessionReady(Boolean(data.session)));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setStatus("pending");
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setStatus("idle");
      return;
    }

    setStatus("done");
    await supabase.auth.signOut();
    setTimeout(() => router.replace("/login"), 2200);
  };

  if (sessionReady === null) {
    return (
      <div className="w-full max-w-md">
        <div className="panel-border rounded-lg p-8 text-center">
          <Loader2 size={24} className="mx-auto animate-spin text-muted" />
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="w-full max-w-md">
        <div className="panel-border rounded-lg p-8 text-center">
          <TriangleAlert size={28} className="mx-auto mb-3 text-accent" />
          <p className="font-semibold text-text">Link invalid or expired</p>
          <p className="mt-1 text-sm text-muted">
            This reset link has already been used or has expired. Contact your administrator for a
            new one.
          </p>
          <a href="/login" className="cta-secondary mt-5 inline-flex text-xs">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex items-center gap-3">
        <Image
          src={siteSettings.logoMark.src}
          alt={siteSettings.logoMark.alt}
          width={48}
          height={48}
          className="size-12 object-contain drop-shadow-[0_0_18px_rgba(193,18,31,0.35)]"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-2xl uppercase tracking-wide text-text">
            {siteSettings.shortName}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-accent">
            Shop Ops · Set new password
          </span>
        </div>
      </div>

      <div className="panel-border rounded-lg p-6">
        {status === "done" ? (
          <div className="py-4 text-center">
            <CheckCircle2 size={36} className="mx-auto mb-3 text-green-400" />
            <p className="font-semibold text-text">Password updated</p>
            <p className="mt-1 text-sm text-muted">Redirecting to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="new-password"
                className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                className="focus-field mt-2"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="focus-field mt-2"
                placeholder="Repeat new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {error ? (
              <div
                className="flex gap-3 rounded-md border border-accent/40 bg-accent/10 p-3 text-sm text-white"
                role="alert"
              >
                <TriangleAlert size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                <p>{error}</p>
              </div>
            ) : null}

            <button type="submit" className="cta-primary text-xs" disabled={status === "pending"}>
              {status === "pending" ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <KeyRound size={16} aria-hidden />
              )}
              Set new password
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-xs uppercase tracking-[0.18em] text-muted">
        Need help?{" "}
        <span className="text-blue-accent">Contact your administrator</span>
      </p>
    </div>
  );
}
