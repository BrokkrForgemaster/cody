"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="cta-primary w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden />
          Signing in…
        </>
      ) : (
        "Sign in"
      )}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(signIn, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="focus-field"
          placeholder="you@forgedcustoms.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-muted"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="focus-field"
        />
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
