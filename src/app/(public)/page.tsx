import { CTASection } from "@/components/CTASection";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { ServicePanel } from "@/components/ServicePanel";
import { StatCard } from "@/components/StatCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { homePage } from "@/data/homePage";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { testimonials } from "@/data/testimonials";

export default function Home() {
  const featuredProjects = homePage.featuredBuildSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter(Boolean);

  return (
    <>
      <Hero {...homePage.hero} />

      <section className="container-page py-16 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow={homePage.servicesIntro.eyebrow}
            title={homePage.servicesIntro.title}
            description={homePage.servicesIntro.description}
          />
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {services.map((service) => (
            <ServicePanel key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/55 py-16 sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <Reveal>
            <SectionHeader
              eyebrow={homePage.transformation.eyebrow}
              title={homePage.transformation.title}
              description={homePage.transformation.description}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <BeforeAfterSlider
              before={homePage.transformation.before}
              after={homePage.transformation.after}
            />
          </Reveal>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow="Featured Builds"
            title="Case Studies With Real Build Logic"
            description="Each demo project is written like a production case study, so the future CMS can publish completed builds that help customers understand scope, process, and result."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, index) =>
            project ? <ProjectCard key={project.slug} project={project} priority={index === 0} /> : null,
          )}
        </div>
      </section>

      <section className="border-y border-white/10 bg-panel/40 py-16 sm:py-24">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow="Why Choose Us"
              title="Built Around Finish Quality"
              description="The customer sees a premium shop. The site architecture sees reusable data, repeatable sections, and conversion-focused paths."
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homePage.stats.map((stat) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <Reveal>
          <SectionHeader
            eyebrow="Customer Proof"
            title="The Details Customers Notice"
            description="Real production testimonials can be managed in Sanity later, including names, vehicles, locations, photos, star ratings, and video links."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </section>

      <CTASection {...homePage.finalCta} />
    </>
  );
}
