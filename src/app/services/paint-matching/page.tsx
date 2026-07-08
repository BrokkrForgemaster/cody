import type { Metadata } from "next";
import Image from "next/image";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getServiceBySlug } from "@/data/services";
import { homePage } from "@/data/homePage";

const service = getServiceBySlug("paint-matching")!;

export const metadata: Metadata = {
  title: service.seo.title,
  description: service.seo.description,
  alternates: { canonical: service.href },
};

export default function PaintMatchingPage() {
  return (
    <>
      <PageHero
        eyebrow="Paint Matching"
        title="OEM Paint Matching. Factory-Level Finish."
        description={service.description}
        image={service.heroImage}
      />

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <Reveal>
            <SectionHeader
              eyebrow="Overview"
              title="Paint That Belongs Beside Factory Panels"
              description="The goal is not just color. It is texture, reflection, edge quality, and a finish that looks intentional under real Central Kentucky daylight."
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
        <div className="container-page grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <Reveal>
            <SectionHeader
              eyebrow="Before And After"
              title="Factory Plastic To Finished Exterior"
              description="A visual comparison showing how paint matched trim and exterior parts can change the perceived value of the whole truck."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <BeforeAfterSlider before={homePage.transformation.before} after={homePage.transformation.after} />
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeader
              eyebrow="Process"
              title="A Finish Workflow Customers Can Trust"
              description="These steps are stored in service data now and can become editable CMS content later."
            />
          </Reveal>
          <div className="space-y-4">
            {service.process.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-lg border border-white/10 bg-panel p-5">
                <span className="font-heading text-4xl leading-none text-accent">{index + 1}</span>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-panel/40 py-16 sm:py-24">
        <div className="container-page">
          <SectionHeader eyebrow="Gallery" title="Paint Match Detail Strip" />
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
        <SectionHeader eyebrow="FAQ" title="Paint Matching Questions" />
        <div className="mt-8">
          <FAQAccordion items={service.faqs} />
        </div>
      </section>

      <CTASection
        title="Get The Exterior Finish Right"
        description="Share the vehicle, factory color, and parts you want matched."
        buttonLabel="Start My Quote"
        href="/quote"
      />
    </>
  );
}
