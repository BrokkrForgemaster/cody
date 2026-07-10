import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { getProjectBySlug, projects } from "@/data/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  return {
    title: project.seo.title,
    description: project.seo.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.seo.title,
      description: project.seo.description,
      images: [{ url: project.heroImage, alt: project.imageAlt }],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={`${project.location} Case Study`}
        title={project.title}
        description={project.summary}
        image={{ src: project.heroImage, alt: project.imageAlt }}
      />

      <section className="container-page py-16 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-4">
          {[
            ["Year", project.year],
            ["Make", project.make],
            ["Model", project.model],
            ["Trim", project.trim],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-panel p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{label}</p>
              <p className="mt-3 font-heading text-4xl uppercase leading-none text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal>
            <div>
              <p className="eyebrow">Services Performed</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.services.map((service) => (
                  <span key={service} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xl leading-8 text-zinc-200">{project.summary}</p>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/55 py-16 sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <BuildList title="Customer Goal" items={project.goals} />
          <BuildList title="Build Process" items={project.process} />
          <BuildList title="Finished Result" items={project.results} />
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <SectionHeader
          eyebrow="Gallery"
          title="Build Details"
          description="Future production projects can include before images, after images, detail shots, and featured hero photography from the CMS."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {project.gallery.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-panel lg:even:aspect-[16/10]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      <CTASection
        title="Build A Vehicle With This Level Of Intent"
        description={`Start a quote request for custom lighting, paint matching, powder coating, or a full build package near ${project.location}.`}
        buttonLabel="Start My Quote"
        href="/quote"
      />
    </>
  );
}

function BuildList({ title, items }: { title: string; items: string[] }) {
  return (
    <Reveal>
      <div className="rounded-lg border border-white/10 bg-panel p-6">
        <h2 className="font-heading text-4xl uppercase leading-none text-white">{title}</h2>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item} className="border-l-2 border-accent pl-4 text-sm leading-6 text-muted">
              {item}
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
