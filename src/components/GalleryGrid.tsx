"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { GalleryImage } from "@/types/content";
import { cn } from "@/lib/utils";

type GalleryGridProps = {
  images: GalleryImage[];
  filters: string[];
};

const heightClasses = [
  "h-72",
  "h-96",
  "h-80",
  "h-[26rem]",
  "h-72",
  "h-[30rem]",
];

export function GalleryGrid({ images, filters }: GalleryGridProps) {
  const [active, setActive] = useState("All");
  const visibleImages = useMemo(
    () => images.filter((image) => active === "All" || image.tags.includes(active)),
    [active, images],
  );

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-4" aria-label="Gallery filters">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={cn(
              "min-h-11 shrink-0 rounded-md border px-4 text-xs font-bold uppercase tracking-[0.16em] transition",
              active === filter
                ? "border-accent bg-accent text-white"
                : "border-white/10 bg-white/5 text-muted hover:border-blue-accent hover:text-white",
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <motion.div layout className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {visibleImages.map((image, index) => (
          <motion.figure
            layout
            key={image.id}
            className={cn(
              "group relative mb-5 break-inside-avoid overflow-hidden rounded-lg border border-white/10 bg-panel",
              heightClasses[index % heightClasses.length],
            )}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-black/14 to-transparent opacity-90 transition group-hover:opacity-100" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5">
              <span className="rounded-md border border-white/15 bg-black/60 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-blue-accent backdrop-blur">
                {image.category}
              </span>
              <p className="mt-3 text-lg font-bold text-white">{image.caption}</p>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </div>
  );
}
