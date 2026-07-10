"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const steps = ["Vehicle", "Services", "Details", "Photos", "Contact"];
const serviceOptions = [
  "Custom Lighting",
  "Paint Matching",
  "Powder Coating",
  "Full Build Package",
  "Not Sure Yet",
];
const budgetOptions = [
  "Under $1,000",
  "$1,000 - $2,500",
  "$2,500 - $5,000",
  "$5,000+",
  "Not sure yet",
];

type Form = {
  year: string;
  make: string;
  model: string;
  trim: string;
  desiredLook: string;
  currentIssues: string;
  timeline: string;
  budget: string;
  name: string;
  phone: string;
  email: string;
  city: string;
};

const emptyForm: Form = {
  year: "",
  make: "",
  model: "",
  trim: "",
  desiredLook: "",
  currentIssues: "",
  timeline: "",
  budget: "",
  name: "",
  phone: "",
  email: "",
  city: "",
};

export function QuoteBuilder() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(["Custom Lighting"]);
  const [form, setForm] = useState<Form>(emptyForm);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleService(service: string) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Name, phone, and email are required.");
      setStep(4);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          services: selectedServices,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again or call the shop.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again or call the shop.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-panel p-8 text-center shadow-2xl shadow-black/35">
        <CheckCircle2 size={54} className="mx-auto text-blue-accent" aria-hidden />
        <h2 className="heading-lg mt-5">Your build request has been received.</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-muted">
          Our team will review your project and contact you with next steps.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-5xl rounded-lg border border-white/10 bg-panel shadow-2xl shadow-black/35"
    >
      <div className="border-b border-white/10 p-4 sm:p-6">
        <div className="grid grid-cols-5 gap-2">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                "min-h-12 rounded-md border px-2 text-[0.66rem] font-bold uppercase tracking-[0.12em] transition sm:text-xs",
                index === step
                  ? "border-accent bg-accent text-white"
                  : "border-white/10 bg-white/5 text-muted hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[440px] p-5 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28 }}
          >
            {step === 0 ? (
              <fieldset>
                <legend className="heading-md">Vehicle</legend>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <input
                    className="focus-field"
                    placeholder="Year"
                    aria-label="Year"
                    value={form.year}
                    onChange={(e) => update("year", e.target.value)}
                  />
                  <input
                    className="focus-field"
                    placeholder="Make"
                    aria-label="Make"
                    value={form.make}
                    onChange={(e) => update("make", e.target.value)}
                  />
                  <input
                    className="focus-field"
                    placeholder="Model"
                    aria-label="Model"
                    value={form.model}
                    onChange={(e) => update("model", e.target.value)}
                  />
                  <input
                    className="focus-field"
                    placeholder="Trim"
                    aria-label="Trim"
                    value={form.trim}
                    onChange={(e) => update("trim", e.target.value)}
                  />
                </div>
              </fieldset>
            ) : null}

            {step === 1 ? (
              <fieldset>
                <legend className="heading-md">Services</legend>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {serviceOptions.map((service) => (
                    <label
                      key={service}
                      className={cn(
                        "flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 text-sm font-bold uppercase tracking-[0.12em]",
                        selectedServices.includes(service)
                          ? "border-accent bg-accent/20 text-white"
                          : "border-white/10 bg-white/5 text-muted",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                        className="size-4 accent-accent"
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 2 ? (
              <fieldset>
                <legend className="heading-md">Project Details</legend>
                <div className="mt-6 grid gap-4">
                  <textarea
                    className="focus-field min-h-28"
                    placeholder="Desired look"
                    aria-label="Desired look"
                    value={form.desiredLook}
                    onChange={(e) => update("desiredLook", e.target.value)}
                  />
                  <textarea
                    className="focus-field min-h-24"
                    placeholder="Current issues"
                    aria-label="Current issues"
                    value={form.currentIssues}
                    onChange={(e) => update("currentIssues", e.target.value)}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      className="focus-field"
                      placeholder="Timeline"
                      aria-label="Timeline"
                      value={form.timeline}
                      onChange={(e) => update("timeline", e.target.value)}
                    />
                    <select
                      className="focus-field"
                      aria-label="Budget range"
                      value={form.budget}
                      onChange={(e) => update("budget", e.target.value)}
                    >
                      <option value="" disabled>
                        Budget range
                      </option>
                      {budgetOptions.map((budget) => (
                        <option key={budget}>{budget}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>
            ) : null}

            {step === 3 ? (
              <fieldset>
                <legend className="heading-md">Upload Placeholder</legend>
                <div className="mt-6 grid min-h-72 place-items-center rounded-lg border border-dashed border-white/20 bg-black/30 p-8 text-center">
                  <div>
                    <UploadCloud size={48} className="mx-auto text-blue-accent" aria-hidden />
                    <p className="mt-5 text-lg font-bold text-white">
                      Photo upload available in production version.
                    </p>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
                      Phase 2 can accept project photos, before shots, part references, and mobile
                      uploads through a protected API route and CMS/media pipeline.
                    </p>
                  </div>
                </div>
              </fieldset>
            ) : null}

            {step === 4 ? (
              <fieldset>
                <legend className="heading-md">Contact</legend>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <input
                    className="focus-field"
                    placeholder="Name"
                    aria-label="Name"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                  <input
                    className="focus-field"
                    placeholder="Phone"
                    aria-label="Phone"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                  <input
                    className="focus-field"
                    placeholder="Email"
                    aria-label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  <input
                    className="focus-field"
                    placeholder="City"
                    aria-label="City"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>
                {error ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-white"
                  >
                    {error}
                  </p>
                ) : null}
              </fieldset>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <button
          type="button"
          className="cta-secondary disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          disabled={step === 0 || submitting}
        >
          <ChevronLeft size={18} aria-hidden />
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            className="cta-primary"
            onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}
          >
            Next Step
            <ChevronRight size={18} aria-hidden />
          </button>
        ) : (
          <button type="submit" className="cta-primary" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              "Submit Project Request"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
