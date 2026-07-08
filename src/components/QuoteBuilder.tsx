"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, UploadCloud } from "lucide-react";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

const steps = ["Vehicle", "Services", "Details", "Photos", "Contact"];
const serviceOptions = [
  "Custom Lighting",
  "Paint Matching",
  "Powder Coating",
  "Full Build Package",
  "Not Sure Yet",
];
const budgetOptions = ["Under $1,000", "$1,000 - $2,500", "$2,500 - $5,000", "$5,000+", "Not sure yet"];

export function QuoteBuilder() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(["Custom Lighting"]);

  function toggleService(service: string) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl rounded-lg border border-white/10 bg-panel shadow-2xl shadow-black/35">
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
                  <input className="focus-field" name="year" placeholder="Year" aria-label="Year" />
                  <input className="focus-field" name="make" placeholder="Make" aria-label="Make" />
                  <input className="focus-field" name="model" placeholder="Model" aria-label="Model" />
                  <input className="focus-field" name="trim" placeholder="Trim" aria-label="Trim" />
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
                  <textarea className="focus-field min-h-28" name="desiredLook" placeholder="Desired look" aria-label="Desired look" />
                  <textarea className="focus-field min-h-24" name="currentIssues" placeholder="Current issues" aria-label="Current issues" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="focus-field" name="timeline" placeholder="Timeline" aria-label="Timeline" />
                    <select className="focus-field" name="budget" defaultValue="" aria-label="Budget range">
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
                      Phase 2 can accept project photos, before shots, part references, and mobile uploads through a protected API route and CMS/media pipeline.
                    </p>
                  </div>
                </div>
              </fieldset>
            ) : null}

            {step === 4 ? (
              <fieldset>
                <legend className="heading-md">Contact</legend>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <input className="focus-field" name="name" placeholder="Name" aria-label="Name" required />
                  <input className="focus-field" name="phone" placeholder="Phone" aria-label="Phone" required />
                  <input className="focus-field" name="email" placeholder="Email" aria-label="Email" type="email" required />
                  <input className="focus-field" name="city" placeholder="City" aria-label="City" />
                </div>
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
          disabled={step === 0}
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
          <button type="submit" className="cta-primary">
            Submit Project Request
          </button>
        )}
      </div>
    </form>
  );
}
