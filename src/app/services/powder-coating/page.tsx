import type { Metadata } from "next";
import Image from "next/image";
import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { PageHero } from "@/components/PageHero";
import { PowderFinishCard } from "@/components/PowderFinishCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getServiceBySlug } from "@/data/services";

const service = getServiceBySlug("powder-coating")!;

const finishes = [
  { name: "Gloss Black", description: "Deep reflective black for wheels, brackets, and exterior accents.", background: "linear-gradient(135deg,#050505,#2b2b2b 45%,#0a0a0a)" },
  { name: "Satin Black", description: "Low-sheen black with a premium OEM+ attitude.", background: "linear-gradient(135deg,#060606,#1f1f1f 55%,#111)" },
  { name: "Bronze", description: "Warm off-road tone that works well with white, gray, black, and red paint.", background: "linear-gradient(135deg,#3b2414,#a56a2a 52%,#1b120c)" },
  { name: "Gunmetal", description: "Dark metallic gray for a technical, performance-oriented finish.", background: "linear-gradient(135deg,#111,#4e555c 48%,#1c1f22)" },
  { name: "Candy Red", description: "A deeper red accent for calipers, hardware, and statement details.", background: "linear-gradient(135deg,#240208,#c1121f 48%,#4d0610)" },
  { name: "Illusion Blue", description: "Blue metallic energy for show details and accent parts.", background: "linear-gradient(135deg,#06111f,#1e90ff 48%,#07111c)" },
  { name: "Textured Black", description: "A rugged finish for accessories, brackets, and trail-focused parts.", background: "repeating-linear-gradient(135deg,#050505 0 10px,#171717 10px 20px,#0d0d0d 20px 30px)" },
  { name: "Wrinkle Finish", description: "A tactile motorsport-inspired finish for engine bay and metal components.", background: "radial-gradient(circle at 25% 25%,#303030 0 8%,transparent 9%),radial-gradient(circle at 75% 55%,#1c1c1c 0 9%,transparent 10%),#070707" },
];

export const metadata: Metadata = {
  title: service.seo.title,
  description: service.seo.description,
  alternates: { canonical: service.href },
};

export default function PowderCoatingPage() {
  return (
    <>
      <PageHero
        eyebrow="Powder Coating"
        title="Durable Finishes. Custom Looks."
        description={service.description}
        image={service.heroImage}
      />

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <Reveal>
            <SectionHeader
              eyebrow="Overview"
              title="Finish Parts That Work As Hard As They Look"
              description="Powder coating gives wheels, suspension, calipers, brackets, and accessories a more durable, intentional finish."
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
              eyebrow="Finish Library"
              title="Choose The Finish Direction"
              description="Production CMS content can expose only approved finishes so the customer can update examples without changing the design system."
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {finishes.map((finish) => (
              <PowderFinishCard key={finish.name} {...finish} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeader
              eyebrow="Process"
              title="Durability Starts In The Prep"
              description="The demo process steps can later be edited by the shop owner while keeping the page layout protected."
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
          <SectionHeader eyebrow="Gallery" title="Powder Coating Detail Strip" />
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
        <SectionHeader eyebrow="FAQ" title="Powder Coating Questions" />
        <div className="mt-8">
          <FAQAccordion items={service.faqs} />
        </div>
      </section>

      <CTASection
        title="Dial In The Finish Before Parts Come Off"
        description="Send photos, part details, and finish goals through the quote builder."
        buttonLabel="Start My Quote"
        href="/quote"
      />
    </>
  );
}
