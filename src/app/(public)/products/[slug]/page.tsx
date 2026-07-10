import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { ProductOrderPanel } from "@/components/ProductOrderPanel";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getProductBySlug, products } from "@/data/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      images: [{ url: product.image.src, alt: product.image.alt }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={product.category}
        title={product.title}
        description={product.summary}
        image={product.image}
      />

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <Reveal>
              <SectionHeader
                eyebrow="Product Overview"
                title="Configured Around Fitment And Install"
                description={product.description}
              />
            </Reveal>

            <div className="mt-8 relative aspect-[16/10] overflow-hidden rounded-lg border border-white/10 bg-panel">
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <article className="rounded-lg border border-white/10 bg-panel p-6">
                <h2 className="font-heading text-4xl uppercase leading-none text-white">Fitment Notes</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.compatibleVehicles.map((vehicle) => (
                    <span key={vehicle} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                      {vehicle}
                    </span>
                  ))}
                </div>
              </article>

              <article className="rounded-lg border border-white/10 bg-panel p-6">
                <h2 className="font-heading text-4xl uppercase leading-none text-white">Product Options</h2>
                <div className="mt-5 space-y-4">
                  {product.options.map((option) => (
                    <div key={option.label}>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-accent">{option.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{option.values.join(" / ")}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>

          <ProductOrderPanel product={product} />
        </div>
      </section>

      <CTASection
        title="Turn The Product Into A Complete Build"
        description="Product-only orders are useful. Product plus install planning is where the build starts to feel finished."
        buttonLabel="Start Build Quote"
        href="/quote"
      />
    </>
  );
}
