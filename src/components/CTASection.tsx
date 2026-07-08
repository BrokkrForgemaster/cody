import Link from "next/link";
import { ArrowRight } from "lucide-react";

type CTASectionProps = {
  title: string;
  description?: string;
  buttonLabel: string;
  href: string;
};

export function CTASection({ title, description, buttonLabel, href }: CTASectionProps) {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-panel px-6 py-12 shadow-2xl shadow-black/40 sm:px-10 lg:px-14">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-blue-accent to-accent" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Next Build</p>
            <h2 className="heading-lg mt-3">{title}</h2>
            {description ? <p className="mt-5 max-w-2xl text-lg leading-7 text-muted">{description}</p> : null}
          </div>
          <Link href={href} className="cta-primary w-full sm:w-fit">
            {buttonLabel}
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
