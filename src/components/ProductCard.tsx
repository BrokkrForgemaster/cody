"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { motion } from "framer-motion";
import type { Product, Vendor } from "@/types/content";

type ProductCardProps = {
  product: Product;
  vendor?: Vendor;
};

export function ProductCard({ product, vendor }: ProductCardProps) {
  return (
    <motion.article
      layout
      className="group overflow-hidden rounded-lg border border-white/10 bg-panel shadow-2xl shadow-black/30"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-panel-light">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 rounded-md border border-white/15 bg-black/60 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
            {product.category}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading text-3xl uppercase leading-none text-white">
                {product.title}
              </h3>
              {vendor ? (
                <p className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                  <Truck size={14} aria-hidden />
                  {vendor.name}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 text-right text-sm font-bold text-blue-accent">{product.price}</p>
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{product.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {product.badges.slice(0, 3).map((badge) => (
              <span
                key={badge}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted"
              >
                {badge}
              </span>
            ))}
          </div>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-white">
            Configure
            <ArrowRight size={17} className="transition group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
