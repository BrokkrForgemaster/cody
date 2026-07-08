import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { ProductCatalog } from "@/components/ProductCatalog";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Products | Lighting, Paintable Parts & Install-Ready Upgrades",
  description:
    "Browse a prototype product catalog for custom lighting, paintable parts, powder coat packages, install kits, and custom fabrication requests.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Parts, Products, And Install Routing"
        description="A pre-CMS commerce prototype for products sourced from multiple vendors, with shipping choices for customer delivery or shop install."
        image={{ src: "/images/lighting-service.png", alt: "Custom automotive lighting product hero" }}
      />

      <section className="container-page py-16 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow="Catalog Prototype"
            title="Shop The Build Path"
            description="Customers can browse products, review vendor lead times, open official install-guide references, choose customer shipping or shop install, and turn complex items into quote requests."
          />
        </Reveal>
        <div className="mt-10">
          <ProductCatalog products={products} />
        </div>
      </section>

      <CTASection
        title="Need A Product Built Into A Complete Build?"
        description="Send the vehicle, the part list, and the finish goals through the quote form so the build can be planned around fitment and install."
        buttonLabel="Start My Quote"
        href="/quote"
      />
    </>
  );
}
