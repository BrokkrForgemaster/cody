"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gauge } from "lucide-react";
import { motion } from "framer-motion";
import { siteSettings } from "@/data/siteSettings";

type HeroProps = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  image: {
    src: string;
    alt: string;
  };
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
};

export function Hero({
  eyebrow,
  headline,
  subheadline,
  image,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden border-b border-white/10 bg-black">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.07 }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/68 to-black/18" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/25" />
      <motion.div
        aria-hidden
        className="absolute left-[8%] top-[22%] h-36 w-36 rounded-full bg-accent/18 blur-3xl"
        animate={{ opacity: [0.3, 0.68, 0.3], scale: [1, 1.14, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[22%] right-[18%] h-48 w-48 rounded-full bg-blue-accent/14 blur-3xl"
        animate={{ opacity: [0.24, 0.58, 0.24], scale: [1, 1.1, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container-page relative z-10 flex min-h-[100svh] items-center pb-16 pt-28">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={siteSettings.heroLogo.src}
            alt={siteSettings.heroLogo.alt}
            width={siteSettings.heroLogo.width}
            height={siteSettings.heroLogo.height}
            priority
            className="mb-6 h-auto w-[min(84vw,560px)] drop-shadow-[0_18px_38px_rgba(0,0,0,0.75)]"
          />
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
            <Gauge size={16} className="text-blue-accent" aria-hidden />
            {eyebrow}
          </div>
          <h1 className="heading-xl max-w-4xl">{headline}</h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-zinc-200 sm:text-2xl">
            {subheadline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={primaryCta.href} className="cta-primary">
              {primaryCta.label}
              <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href={secondaryCta.href} className="cta-secondary">
              {secondaryCta.label}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
