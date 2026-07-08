"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { productCategories, vendors } from "@/data/products";
import type { Product } from "@/types/content";
import { cn } from "@/lib/utils";

type ProductCatalogProps = {
  products: Product[];
};

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleProducts = useMemo(
    () =>
      activeCategory === "All"
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory, products],
  );

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-4" aria-label="Product filters">
        {productCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "min-h-11 shrink-0 rounded-md border px-4 text-xs font-bold uppercase tracking-[0.16em] transition",
              activeCategory === category
                ? "border-accent bg-accent text-white"
                : "border-white/10 bg-white/5 text-muted hover:border-blue-accent hover:text-white",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            vendor={vendors.find((vendor) => vendor.id === product.vendorId)}
          />
        ))}
      </div>
    </div>
  );
}
