import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { faqItems } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ | Paint Matching, Lighting & Powder Coating Questions",
  description:
    "Answers to common questions about paint matching, custom lighting, powder coating, appointments, combined services, vehicle types, and warranties.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Clear Answers Before The Build Starts"
        description="A premium customer experience starts before the first appointment. These answers keep expectations clean and reduce friction before quote submission."
        image={{ src: "/images/lighting-service.png", alt: "Custom LED lighting close-up" }}
      />

      <section className="container-page py-16 sm:py-24">
        <SectionHeader
          eyebrow="Common Questions"
          title="Plan With Confidence"
          description="In production, FAQ items can be reordered, edited, and assigned to service pages through Sanity."
        />
        <div className="mt-10">
          <FAQAccordion items={faqItems} />
        </div>
      </section>

      <CTASection
        title="Still Need A Build-Specific Answer?"
        description="Send your vehicle details and project goals through the quote builder."
        buttonLabel="Start My Quote"
        href="/quote"
      />
    </>
  );
}
