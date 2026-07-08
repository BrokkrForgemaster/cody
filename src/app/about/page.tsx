import type { Metadata } from "next";
import Image from "next/image";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "About | Premium Vehicle Customization in Central Kentucky",
  description:
    "Learn the shop story behind Bluegrass Custom Coatings & Lighting, a premium Central Kentucky concept for custom lighting, paint matching, and powder coating.",
  alternates: { canonical: "/about" },
};

const sections = [
  {
    title: "Our Standard",
    copy: "Every decision should make the vehicle look more intentional. The site is written around that same standard: clear content, premium imagery, and a path toward a customer-managed CMS.",
  },
  {
    title: "Craftsmanship",
    copy: "Clean wiring, finish prep, paint-code discipline, and part-level details matter because they are the things customers notice after the first impression fades.",
  },
  {
    title: "Built In Central Kentucky",
    copy: "The demo speaks naturally to Lexington KY, Richmond KY, Georgetown KY, Nicholasville KY, Winchester KY, and the surrounding Central Kentucky market.",
  },
  {
    title: "Shop Capabilities",
    copy: "Custom lighting, OEM paint matching, powder coating, detail-focused assembly, gallery documentation, and quote intake are planned as one business system.",
  },
  {
    title: "Final Inspection",
    copy: "Before a build leaves, the finish, wiring, lighting aim, panel appearance, and overall impression should feel worthy of the vehicle.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built Different. Finished Right."
        description="Bluegrass Custom Coatings & Lighting was built for vehicle owners who care about the details. From subtle OEM+ upgrades to full custom transformations, our work is focused on clean execution, premium finishes, and a finished product that looks intentional from every angle."
        image={{ src: "/images/gallery-shop-truck.png", alt: "Custom truck in premium fabrication shop" }}
      />

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionHeader
              eyebrow="Shop Story"
              title="A Premium Standard For Local Custom Work"
              description="This concept avoids the basic local-shop brochure pattern. It gives the business a showroom-quality first impression and a practical content system underneath."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-panel">
              <Image src="/images/project-sierra.png" alt="Gray custom truck in premium studio lighting" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Reveal key={section.title}>
              <article className="h-full rounded-lg border border-white/10 bg-panel p-6">
                <h2 className="font-heading text-4xl uppercase leading-none text-white">{section.title}</h2>
                <p className="mt-4 text-sm leading-7 text-muted">{section.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection
        title="Hand Over The Keys With Confidence"
        description="The quote builder is designed to collect the details a real shop needs before scheduling a serious build conversation."
        buttonLabel="Start My Quote"
        href="/quote"
      />
    </>
  );
}
