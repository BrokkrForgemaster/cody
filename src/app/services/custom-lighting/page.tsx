import type { Metadata } from "next";
import Image from "next/image";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { LightingSimulator } from "@/components/LightingSimulator";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getServiceBySlug } from "@/data/services";

const service = getServiceBySlug("custom-lighting")!;

export const metadata: Metadata = {
  title: service.seo.title,
  description: service.seo.description,
  alternates: { canonical: service.href },
};

export default function CustomLightingPage() {
  return (
    <>
      <PageHero
        eyebrow="Custom Lighting"
        title="Custom Lighting That Changes Everything"
        description={service.description}
        image={service.heroImage}
      />

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <Reveal>
            <SectionHeader
              eyebrow="Overview"
              title="Designed For The Way The Vehicle Will Be Used"
              description="Lighting should look sharp at the meet, stay usable on back roads, and be wired cleanly enough that the install feels like it belongs."
            />
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {service.offerings.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-panel p-4 text-sm font-bold uppercase tracking-[0.14em] text-white">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/55 py-16 sm:py-24">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow="Interactive Demo"
              title="Lighting Simulator"
              description="A visual demo of how different lighting zones can change the personality of a build before a real controller is added in production."
            />
          </Reveal>
          <div className="mt-10">
            <LightingSimulator />
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeader
              eyebrow="Process"
              title="Clean Installs Start With Planning"
              description="The demo keeps process steps in data so customers can later edit service workflows without touching layout code."
            />
          </Reveal>
          <div className="space-y-4">
            {service.process.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-lg border border-white/10 bg-panel p-5">
                <span className="font-heading text-4xl leading-none text-accent">{index + 1}</span>
                <p className="text-sm leading-6 text-muted">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-panel/40 py-16 sm:py-24">
        <div className="container-page">
          <SectionHeader eyebrow="Gallery" title="Lighting Detail Strip" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {service.gallery.map((image) => (
              <div key={image.src} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-panel">
                <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <SectionHeader eyebrow="FAQ" title="Lighting Questions" />
        <div className="mt-8">
          <FAQAccordion items={service.faqs} />
        </div>
      </section>

      <CTASection
        title="Plan A Lighting Package That Fits The Build"
        description="Send the vehicle, the desired look, and how you use it at night."
        buttonLabel="Build My Project"
        href="/quote"
      />
    </>
  );
}
