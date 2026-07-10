"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLightingCatalog } from "@/lib/lightingCatalogStore";

export function ConfigurationBuilder({ id }: { id: string }) {
  const { products } = useLightingCatalog();

  const product = useMemo(
    () => products.find((item) => item.id === id || item.id.startsWith(id)),
    [id, products],
  );

  if (!product) {
    return (
      <div className="panel-border rounded-3xl p-6">
        <p className="text-sm text-muted">No saved build sheet was found for this id.</p>
        <Link href="/admin/configurator" className="cta-secondary mt-4 w-fit">
          Back to configurator
        </Link>
      </div>
    );
  }

  return (
    <div className="panel-border rounded-3xl p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">Build Sheet</p>
      <h2 className="mt-3 font-heading text-3xl uppercase text-text">
        {product.brand} {product.series}
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Vehicle</p>
          <p className="mt-2 text-sm text-white">{product.vehicle.label}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Product</p>
          <p className="mt-2 text-sm text-white">{product.productName}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Category</p>
          <p className="mt-2 text-sm text-white">{product.productType}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Starting Price</p>
          <p className="mt-2 text-sm text-white">${product.priceFrom.toLocaleString("en-US")}</p>
        </div>
      </div>
      <p className="mt-6 text-sm leading-6 text-muted">{product.summary}</p>
      <Link href="/admin/configurator" className="cta-secondary mt-6 w-fit">
        Back to configurator
      </Link>
    </div>
  );
}
