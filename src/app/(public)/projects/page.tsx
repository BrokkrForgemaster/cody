import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { PageHero } from "@/components/PageHero";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Featured Builds | Custom Truck, Jeep & SUV Projects",
  description:
    "Explore premium custom vehicle builds from Central Kentucky including custom truck lighting, OEM paint matching, powder coating, and full transformations.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Featured Builds"
        title="Case Studies, Not Just Pretty Pictures"
        description="Each build page shows the vehicle, goal, services, process, result, and gallery so future customers can understand what quality looks like."
        image={{ src: "/images/project-f250.png", alt: "White heavy duty custom truck case study" }}
      />

      <section className="container-page py-16 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow="Project Library"
            title="Premium Builds Across Central Kentucky"
            description="Static data powers the demo today. In production, Sanity would let the business owner add new completed builds without touching code."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} priority={index < 2} />
          ))}
        </div>
      </section>

      <CTASection
        title="Your Vehicle Can Be The Next Case Study"
        description="Start with the quote builder and share the look, timeline, budget, and services you are considering."
        buttonLabel="Build My Project"
        href="/quote"
      />
    </>
  );
}
