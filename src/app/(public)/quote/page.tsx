import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Quote Builder | Start A Custom Vehicle Project",
  description:
    "Start a custom vehicle project request for lighting, paint matching, powder coating, or a full build package in Central Kentucky.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Quote Builder"
        title="Start The Build Conversation"
        description="This demo quote builder is visual only. In production, it becomes /api/quote with email, optional CRM, Google Sheet, confirmation email, and photo upload support."
        image={{ src: "/images/after-custom-truck.png", alt: "Finished white custom truck quote page hero" }}
      />

      <section className="container-page py-16 sm:py-24">
        <SectionHeader
          eyebrow="Project Request"
          title="Tell Us What You Want Built"
          description="The form collects vehicle details, services, budget, timeline, project notes, upload intent, and customer contact information."
          align="center"
        />
        <div className="mt-10">
          <QuoteBuilder />
        </div>
      </section>
    </>
  );
}
