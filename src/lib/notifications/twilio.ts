// Twilio SMS client (server-only). Uses TWILIO_ACCOUNT_SID +
// TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER.
import twilio, { type Twilio } from "twilio";

let cached: Twilio | null = null;

export function getTwilio(): Twilio {
  if (cached) return cached;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error(
      "TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set. Add both to .env.local (server-side) to enable SMS sending.",
    );
  }
  cached = twilio(sid, token);
  return cached;
}

export function twilioFrom(): string {
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!from) {
    throw new Error(
      "TWILIO_FROM_NUMBER not set. Add your Twilio number in E.164 format, e.g. +18595550198.",
    );
  }
  return from;
}
