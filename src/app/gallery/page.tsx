import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { GalleryGrid } from "@/components/GalleryGrid";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { galleryFilters, galleryImages } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery | Lighting, Paint Matching & Powder Coating",
  description:
    "Browse a premium automotive customization gallery with lighting, paint matching, powder coating, truck, Jeep, night shot, and detail image filters.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="The Digital Showroom"
        description="Filter premium lighting, paint matching, powder coating, truck, Jeep, night shot, and detail concepts built from local placeholder assets."
        image={{ src: "/images/hero-truck.png", alt: "Dark studio custom truck gallery hero" }}
      />

      <section className="container-page py-16 sm:py-24">
        <SectionHeader
          eyebrow="Image Library"
          title="Filter By Finish, Vehicle, Or Mood"
          description="In production, these images would be managed through Sanity or Cloudinary with alt text, captions, categories, and featured flags."
        />
        <div className="mt-10">
          <GalleryGrid images={galleryImages} filters={galleryFilters} />
        </div>
      </section>

      <CTASection
        title="Turn A Gallery Idea Into Your Build"
        description="Send the images, finishes, and lighting style you want to use as inspiration."
        buttonLabel="Build My Project"
        href="/quote"
      />
    </>
  );
}
