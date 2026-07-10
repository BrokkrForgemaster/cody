import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { LightingConfiguratorExperienceInner } from "@/components/configurator/LightingConfiguratorExperience";
import { getServiceBySlug } from "@/data/services";

const service = getServiceBySlug("custom-lighting")!;

const heroMedia = [
  {
    src: "/products/morimoto/ford-f150/2021-2023/xb-led-headlights/front.png",
    alt: "Morimoto XB LED headlight product image for Ford F-150",
    label: "Headlights",
    title: "Morimoto XB LED",
  },
  {
    src: "/products/form-lighting/ram-1500/2019-2024/signature-tail-lights/front.png",
    alt: "Form Lighting signature tail light product image for Ram 1500",
    label: "Tail Lights",
    title: "Form Lighting Signature LED",
  },
  {
    src: "/products/morimoto/ford-f150/2021-2023/xb-led-headlights/installed.png",
    alt: "Installed Morimoto XB LED headlights on a Ford F-150",
    label: "Installed View",
    title: "Front-end fitment preview",
  },
  {
    src: "/products/morimoto/ford-f150/2021-2023/xb-tail-lights/installed.png",
    alt: "Installed Morimoto XB LED tail lights on a Ford F-150",
    label: "Rear-end View",
    title: "Tail-light fitment preview",
  },
] as const;

const featuredProducts = [
  {
    eyebrow: "Featured Headlight",
    title: "Headlight packages shown as real products, not filler truck photos",
    description:
      "The page now leads with approved local headlight imagery so customers see the actual product form, housing finish, and installed look before they ever touch the configurator.",
    stats: ["Studio product view", "Installed fitment view", "Local approved media only"],
    media: [
      {
        src: "/products/alpharex/ford-f150/2021-2023/luxx/front.png",
        alt: "AlphaRex LUXX headlight product image for Ford F-150",
      },
      {
        src: "/products/morimoto/ford-f150/2021-2023/xb-led-headlights/detail.png",
        alt: "Detail view of Morimoto XB LED headlight for Ford F-150",
      },
    ],
  },
  {
    eyebrow: "Featured Tail Light",
    title: "Tail-light media has equal weight in the premium layout",
    description:
      "Rear lighting is presented with the same polish as the front-end products, using local approved tail-light imagery that reads like a premium catalog instead of a generic service page.",
    stats: ["Product-first framing", "Rear-light specific imagery", "Cleaner premium spacing"],
    media: [
      {
        src: "/products/form-lighting/ram-1500/2019-2024/signature-tail-lights/front.png",
        alt: "Form Lighting signature tail light product image for Ram 1500",
      },
      {
        src: "/products/recon/ford-super-duty/2020-2024/tail-lights/installed.png",
        alt: "Installed RECON tail lights on a Ford Super Duty",
      },
    ],
  },
] as const;

const planningPillars = [
  {
    title: "Product Selection",
    copy: "Compare headlights and tail lights by brand, vehicle, and product line before styling decisions start.",
  },
  {
    title: "Finish Direction",
    copy: "Dial in tint, housing color, DRL behavior, and overall tone so the lighting matches the rest of the build.",
  },
  {
    title: "Install Planning",
    copy: "Use installed and night media to align expectations on fitment, output, and final on-vehicle presence.",
  },
] as const;

export const metadata: Metadata = {
  title: service.seo.title,
  description: service.seo.description,
  alternates: { canonical: "/services/custom-lighting" },
};

export default function CustomLightingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,144,255,0.14),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(193,18,31,0.16),transparent_24%),linear-gradient(180deg,rgba(10,10,10,0.65),rgba(11,11,11,0.98))]" />
        <div className="container-page relative py-14 sm:py-18 lg:py-24">
          <div className="grid gap-10 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
            <Reveal>
              <div className="max-w-2xl">
                <p className="eyebrow">Custom Lighting</p>
                <h1 className="mt-4 font-heading text-5xl uppercase leading-[0.94] text-white sm:text-6xl lg:text-7xl">
                  Product-First Lighting
                  <span className="block text-blue-accent">Built Around Real Headlights And Tail Lights</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-zinc-200 sm:text-lg">
                  {service.description} This layout now uses approved local product imagery from the catalog instead of generic truck photography, so the page sells the parts and the installed result at the same time.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="#configurator" className="cta-primary">
                    Explore Products
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                  <Link href="/quote" className="cta-secondary">
                    Start A Quote
                  </Link>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {planningPillars.map((pillar) => (
                    <div key={pillar.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">{pillar.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{pillar.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                {heroMedia.map((item, index) => (
                  <article
                    key={item.src}
                    className={index > 1 ? "panel-border overflow-hidden rounded-[28px] sm:translate-y-8" : "panel-border overflow-hidden rounded-[28px]"}
                  >
                    <div className="relative aspect-[4/5] bg-black">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        priority={index < 2}
                        sizes="(min-width: 1280px) 24vw, (min-width: 640px) 42vw, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/18 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-accent">{item.label}</p>
                        <p className="mt-2 font-heading text-2xl uppercase text-white">{item.title}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <Reveal>
            <SectionHeader
              eyebrow="Media Direction"
              title="Cleaner premium structure, anchored by approved local product imagery"
              description="The service page is now framed like a curated lighting catalog: tighter spacing, stronger visual hierarchy, and dedicated headlight and tail-light media blocks built from the local product library."
            />
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {service.offerings.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-24">
        <div className="space-y-8">
          {featuredProducts.map((product, index) => (
            <Reveal key={product.eyebrow}>
              <div className="panel-border overflow-hidden rounded-[32px]">
                <div className={index % 2 === 0 ? "grid gap-0 lg:grid-cols-[0.9fr_1.1fr]" : "grid gap-0 lg:grid-cols-[1.1fr_0.9fr]"}>
                  <div className={index % 2 === 0 ? "order-2 p-6 sm:p-8 lg:order-1 lg:p-10" : "p-6 sm:p-8 lg:p-10"}>
                    <p className="eyebrow">{product.eyebrow}</p>
                    <h2 className="mt-4 font-heading text-4xl uppercase leading-none text-white sm:text-5xl">
                      {product.title}
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">{product.description}</p>
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                      {product.stats.map((stat) => (
                        <div key={stat} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">
                          {stat}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={index % 2 === 0 ? "order-1 grid gap-1 bg-black sm:grid-cols-2 lg:order-2" : "grid gap-1 bg-black sm:grid-cols-2"}>
                    {product.media.map((media) => (
                      <div key={media.src} className="relative min-h-[280px]">
                        <Image
                          src={media.src}
                          alt={media.alt}
                          fill
                          sizes="(min-width: 1024px) 28vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <LightingConfiguratorExperienceInner embedded />

      <CTASection
        title="Plan A Lighting Package That Fits The Build"
        description="Send the vehicle, the headlight or tail-light direction, and how you want the final build to read day and night."
        buttonLabel="Build My Project"
        href="/quote"
      />
    </>
  );
}
