"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Service } from "@/types/content";

type ServicePanelProps = {
  service: Service;
};

export function ServicePanel({ service }: ServicePanelProps) {
  return (
    <motion.article
      className="group relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-panel shadow-2xl shadow-black/40"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <Image
        src={service.panelImage.src}
        alt={service.panelImage.alt}
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/58 to-black/5" />
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent via-blue-accent to-accent" />
      </div>
      <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-end p-6 sm:p-8">
        <p className="eyebrow text-blue-accent">{service.shortTitle}</p>
        <h3 className="mt-3 font-heading text-4xl uppercase leading-none text-white">
          {service.shortTitle}
        </h3>
        <p className="mt-4 line-clamp-5 text-sm leading-6 text-zinc-200">{service.summary}</p>
        <Link href={service.href} className="cta-secondary mt-6 w-fit">
          Explore Service
          <ArrowUpRight size={17} aria-hidden />
        </Link>
      </div>
    </motion.article>
  );
}
