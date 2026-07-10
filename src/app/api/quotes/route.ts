// Public endpoint for the marketing /quote form. Runs on the server and uses
// the service_role key to bypass RLS, so anonymous website visitors can log
// a quote without being authenticated.
import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

function s(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const str = String(v).trim();
  return str || null;
}

function isEmail(v: string | null): boolean {
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = (await request.json()) as Record<string, unknown>;
    } else {
      const form = await request.formData();
      for (const [k, v] of form.entries()) {
        if (body[k] === undefined) {
          body[k] = v;
        } else if (Array.isArray(body[k])) {
          (body[k] as unknown[]).push(v);
        } else {
          body[k] = [body[k], v];
        }
      }
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!name || !phone || !isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Name, phone, and a valid email are required." },
      { status: 400 },
    );
  }

  const [firstName, ...restName] = name.split(/\s+/);
  const lastName = restName.join(" ") || null;

  const services = Array.isArray(body.services)
    ? (body.services as unknown[]).map((v) => String(v)).filter(Boolean)
    : typeof body.services === "string"
      ? [body.services]
      : [];

  const payload = {
    source: "website" as const,
    status: "new" as const,
    customer_id: null,
    vehicle_id: null,
    configuration_id: null,
    job_id: null,
    lead_first_name: firstName || null,
    lead_last_name: lastName,
    lead_email: email,
    lead_phone: phone,
    lead_city: typeof body.city === "string" ? body.city.trim() || null : null,
    vehicle_year: typeof body.year === "string" ? body.year.trim() || null : null,
    vehicle_make: typeof body.make === "string" ? body.make.trim() || null : null,
    vehicle_model: typeof body.model === "string" ? body.model.trim() || null : null,
    vehicle_trim: typeof body.trim === "string" ? body.trim.trim() || null : null,
    services_interest: services,
    timeline: typeof body.timeline === "string" ? body.timeline.trim() || null : null,
    budget: typeof body.budget === "string" ? body.budget.trim() || null : null,
    desired_look:
      typeof body.desiredLook === "string" ? body.desiredLook.trim() || null : null,
    current_issues:
      typeof body.currentIssues === "string" ? body.currentIssues.trim() || null : null,
    message: null,
    staff_notes: null,
    estimated_total_cents: null,
  };

  try {
    const supabase = getSupabaseServiceClient();
    const quotesTable = supabase.from("quotes") as unknown as {
      insert: (value: typeof payload) => {
        select: (columns: string) => {
          single: () => Promise<{ data: { id?: string } | null; error: unknown }>;
        };
      };
    };
    const { data, error } = await quotesTable.insert(payload).select("id").single();
    if (error) {
      console.error("[quotes POST] insert failed", error);
      return NextResponse.json(
        { ok: false, error: "Could not save your request. Please try again." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
  } catch (err) {
    console.error("[quotes POST] service unavailable", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Server not configured yet. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.",
      },
      { status: 503 },
    );
  }
}
