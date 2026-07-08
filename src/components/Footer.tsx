import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { siteSettings } from "@/data/siteSettings";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pb-24 pt-14 text-sm text-muted md:pb-10">
      <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <p className="font-heading text-3xl uppercase leading-none text-white">
            {siteSettings.businessName}
          </p>
          <p className="mt-3 max-w-sm leading-6">
            {siteSettings.tagline} Premium vehicle customization for Central Kentucky trucks,
            Jeeps, SUVs, and performance builds.
          </p>
          <Link href="/quote" className="cta-primary mt-6">
            Start My Quote
            <ArrowUpRight size={17} aria-hidden />
          </Link>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white">Services</p>
          <div className="flex flex-col gap-3">
            {services.map((service) => (
              <Link key={service.slug} href={service.href} className="hover:text-white">
                {service.shortTitle}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white">Company</p>
          <div className="flex flex-col gap-3">
            {siteSettings.nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
            <Link href="/quote" className="hover:text-white">
              Quote
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white">Contact</p>
          <div className="space-y-3 leading-6">
            <p>{siteSettings.location}</p>
            <p>
              <a href={`tel:${siteSettings.phone}`} className="hover:text-white">
                {siteSettings.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${siteSettings.email}`} className="hover:text-white">
                {siteSettings.email}
              </a>
            </p>
            {siteSettings.hours.map((item) => (
              <p key={item.label}>
                <span className="text-white">{item.label}:</span> {item.value}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="container-page mt-10 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.16em]">
        Demo concept site. Static data is structured for a future Sanity CMS integration.
      </div>
    </footer>
  );
}
