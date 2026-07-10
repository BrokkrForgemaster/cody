"use client";

import { useEffect, useState } from "react";
import { seedLightingProducts } from "@/data/lightingCatalog";
import type { BuildConfig, LightingProduct, QuoteRequestState } from "@/types/lighting-configurator";

export const LIGHTING_CATALOG_STORAGE_KEY = "forge-customs-lighting-catalog-v1";

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedLightingProducts)) as LightingProduct[];
}

function readStorage() {
  if (typeof window === "undefined") {
    return cloneSeed();
  }

  const raw = window.localStorage.getItem(LIGHTING_CATALOG_STORAGE_KEY);
  if (!raw) {
    return cloneSeed();
  }

  try {
    const parsed = JSON.parse(raw) as LightingProduct[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

export function useLightingCatalog() {
  const [products, setProducts] = useState<LightingProduct[]>(() => cloneSeed());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProducts(readStorage());
    setReady(true);
  }, []);

  const saveProducts = (next: LightingProduct[]) => {
    setProducts(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LIGHTING_CATALOG_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const resetCatalog = () => {
    const seed = cloneSeed();
    saveProducts(seed);
  };

  return { products, saveProducts, resetCatalog, ready };
}

export function estimateBuildPrice(product: LightingProduct, build: BuildConfig) {
  let total = product.priceFrom;

  if (build.lensTint === "smoke") total += 125;
  if (build.lensTint === "dark-smoke") total += 210;
  if (build.lensTint === "amber") total += 140;
  if (build.housing === "matte-black") total += 95;
  if (build.housing === "color-match") total += 225;
  if (build.drlColor === "rgb") total += 280;
  if (build.projectorGlow !== "white") total += 90;
  if (build.reflector !== "clear") total += 65;

  return total;
}

export function buildQuoteSummary(product: LightingProduct, build: BuildConfig, quote: QuoteRequestState) {
  return [
    `Vehicle: ${quote.vehicle || product.vehicle.label}`,
    `Brand: ${product.brand}`,
    `Product: ${product.series} ${product.productName}`,
    `Category: ${product.productType}`,
    `Lens Tint: ${build.lensTint}`,
    `Housing: ${build.housing === "color-match" ? `color match (${build.colorMatchHex})` : build.housing}`,
    `DRL: ${build.drlColor === "rgb" ? `RGB (${build.rgbHex})` : build.drlColor}`,
    `Projector Glow: ${build.projectorGlow}`,
    `Reflector: ${build.reflector}`,
    `Brightness: ${build.brightness}%`,
    `Glow Strength: ${build.glowStrength}%`,
    `Opacity: ${build.opacity}%`,
    `Customer: ${quote.name || "Pending"}`,
    `Phone: ${quote.phone || "Pending"}`,
    `Email: ${quote.email || "Pending"}`,
    `Notes: ${quote.notes || "None"}`,
  ].join("\n");
}
