// Resend email client (server-only). Uses RESEND_API_KEY + RESEND_FROM_EMAIL
// from the environment. Throws when not configured — callers should surface a
// helpful error to staff.
import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local (server-side) to enable email sending.",
    );
  }
  cached = new Resend(key);
  return cached;
}

export function resendFrom(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error(
      "RESEND_FROM_EMAIL is not set. Add e.g. 'Forged Customs <hello@forgedcustoms.com>' to .env.local.",
    );
  }
  return from;
}
