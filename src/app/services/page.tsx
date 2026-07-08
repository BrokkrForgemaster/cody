import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { ServicePanel } from "@/components/ServicePanel";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Services | Custom Lighting, Paint Matching & Powder Coating",
  description:
    "Explore custom lighting, OEM paint matching, and powder coating services for trucks, Jeeps, SUVs, and performance vehicles in Central Kentucky.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Custom Work That Looks Factory-Intentional"
        description="Premium lighting, paint matching, and powder coating for Central Kentucky vehicle owners who want the finished build to feel planned from the start."
        image={{
          src: "/images/gallery-shop-truck.png",
          alt: "Custom truck in a professional automotive fabrication shop",
        }}
      />

      <section className="container-page py-16 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow="Capability"
            title="The Core Finish Package"
            description="Each service can stand alone, but the best results happen when lighting, color, and finish are planned together."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {services.map((service) => (
            <ServicePanel key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <CTASection
        title="Bring The Whole Build Into Focus"
        description="Use the quote builder to send vehicle information, service goals, budget range, and timeline."
        buttonLabel="Build My Project"
        href="/quote"
      />
    </>
  );
}
