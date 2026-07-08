"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Project } from "@/types/content";

type ProjectCardProps = {
  project: Project;
  priority?: boolean;
};

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <motion.article
      className="group overflow-hidden rounded-lg border border-white/10 bg-panel shadow-2xl shadow-black/35"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-panel-light">
          <Image
            src={project.heroImage}
            alt={project.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 rounded-md border border-white/15 bg-black/55 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
            {project.location}
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {project.services.slice(0, 3).map((service) => (
              <span
                key={service}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted"
              >
                {service}
              </span>
            ))}
          </div>
          <h3 className="font-heading text-3xl uppercase leading-none text-white">
            {project.vehicle}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{project.summary}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-white">
            View Build
            <ArrowRight size={17} className="transition group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
