"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, RotateCcw, ShoppingCart } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import { demoVehicles, lightingBrands, lightingCategories } from "@/data/lightingCatalog";
import { estimateBuildPrice, useLightingCatalog } from "@/lib/lightingCatalogStore";
import { cn } from "@/lib/utils";
import type {
  BuildConfig,
  LightingBrand,
  LightingCategory,
  LightingProduct,
  PreviewMode,
  ProductMedia,
} from "@/types/lighting-configurator";
import { defaultBuildConfig } from "@/types/lighting-configurator";
import { ProductStudioStage } from "./ProductStudioStage";

const previewModes: { value: PreviewMode; label: string }[] = [
  { value: "studio", label: "Studio" },
  { value: "installed", label: "Installed" },
  { value: "night", label: "Night" },
  { value: "beam", label: "Beam" },
  { value: "detail", label: "Detail" },
];

const lensOptions: BuildConfig["lensTint"][] = ["clear", "smoke", "dark-smoke", "amber"];
const housingOptions: BuildConfig["housing"][] = ["chrome", "gloss-black", "matte-black", "color-match"];
const drlOptions: BuildConfig["drlColor"][] = ["white", "amber", "blue", "red", "rgb"];
const projectorOptions: BuildConfig["projectorGlow"][] = ["white", "amber", "blue", "green", "red"];
const reflectorOptions: BuildConfig["reflector"][] = ["clear", "smoke", "amber"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function findMedia(product: LightingProduct, mode: PreviewMode) {
  return (
    product.gallery.find((item) => item.kind === mode) ??
    product.gallery.find((item) => item.kind === "installed") ??
    product.gallery[0]
  );
}

function galleryForProduct(product: LightingProduct) {
  const unique = new Map<string, ProductMedia>();
  product.gallery.forEach((item) => {
    if (!unique.has(item.id)) unique.set(item.id, item);
  });
  return Array.from(unique.values());
}

function summaryItems(product: LightingProduct, build: BuildConfig) {
  return [
    { label: "Vehicle", value: product.vehicle.label },
    { label: "Brand", value: product.brand },
    { label: "Product", value: `${product.series} ${product.productName}` },
    { label: "Lens Tint", value: build.lensTint },
    { label: "Housing", value: build.housing === "color-match" ? `color match ${build.colorMatchHex}` : build.housing },
    { label: "Glow", value: build.drlColor === "rgb" ? `RGB ${build.rgbHex}` : build.drlColor },
  ];
}

function buildSpecPills(build: BuildConfig) {
  return [
    `Lens ${build.lensTint.replace("-", " ")}`,
    `Housing ${build.housing === "color-match" ? "color match" : build.housing.replace("-", " ")}`,
    `DRL ${build.drlColor === "rgb" ? "rgb" : build.drlColor}`,
    `Projector ${build.projectorGlow}`,
  ];
}

function previewLabel(mode: PreviewMode) {
  return mode === "studio" ? "Front View" : mode === "installed" ? "Installed" : `${titleCase(mode)} View`;
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function swatchTone(value: string) {
  const tones: Record<string, string> = {
    clear: "#f3f4f6",
    smoke: "#374151",
    "dark-smoke": "#111827",
    amber: "#d97706",
    chrome: "#e5e7eb",
    "gloss-black": "#0f172a",
    "matte-black": "#2b313a",
    "color-match": "#4b5563",
    white: "#f8fafc",
    blue: "#2563eb",
    red: "#dc2626",
    green: "#22c55e",
    rgb: "conic-gradient(from 180deg, #60a5fa, #a855f7, #f43f5e, #f59e0b, #22c55e, #60a5fa)",
  };

  return tones[value] ?? "#6b7280";
}

function circleOptionClass(active: boolean) {
  return cn(
    "group flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition",
    active
      ? "border-cfg-orange bg-cfg-orange/10 shadow-[0_0_24px_rgba(193,18,31,0.18)]"
      : "border-white/10 bg-white/[0.02] hover:border-cfg-orange/35",
  );
}

function statBlock(label: string, value: string) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  );
}

export function LightingConfiguratorExperience() {
  return <LightingConfiguratorExperienceInner />;
}

type LightingConfiguratorExperienceProps = {
  embedded?: boolean;
};

export function LightingConfiguratorExperienceInner({ embedded = false }: LightingConfiguratorExperienceProps = {}) {
  const { products } = useLightingCatalog();
  const [selectedVehicleSlug, setSelectedVehicleSlug] = useState(demoVehicles[0].slug);
  const [selectedCategory, setSelectedCategory] = useState<LightingCategory>("headlights");
  const [selectedBrand, setSelectedBrand] = useState<LightingBrand | "all">("all");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("installed");
  const [build, setBuild] = useState<BuildConfig>(defaultBuildConfig);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const vehicleMatch = product.vehicle.slug === selectedVehicleSlug;
      const categoryMatch = product.category === selectedCategory;
      const brandMatch = selectedBrand === "all" ? true : product.brand === selectedBrand;
      return vehicleMatch && categoryMatch && brandMatch;
    });
  }, [products, selectedVehicleSlug, selectedCategory, selectedBrand]);

  const selectedProduct =
    filteredProducts.find((product) => product.id === selectedProductId) ?? filteredProducts[0] ?? products[0];

  const activeMedia = selectedProduct ? findMedia(selectedProduct, previewMode) : null;
  const priceEstimate = selectedProduct ? estimateBuildPrice(selectedProduct, build) : 0;

  return (
    <>
      {embedded ? null : (
        <section className="relative overflow-hidden border-b border-white/10 pt-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(193,18,31,0.2),transparent_24%),linear-gradient(180deg,rgba(23,23,23,0.35),rgba(11,11,11,0.96))]" />
          <div className="container-page relative py-14 sm:py-18 lg:py-24">
            <Reveal>
              <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                <div>
                  <p className="eyebrow">Build Your Lights</p>
                  <h1 className="mt-4 max-w-4xl font-heading text-5xl uppercase leading-[0.96] text-white sm:text-6xl lg:text-8xl">
                    Premium Truck Lighting
                    <span className="block text-blue-accent">Configured From Real Products</span>
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                    Forge Customs is replacing the generic mockup with a scalable image-based configurator
                    built for real aftermarket headlights, tail lights, fog lights, and marker lights.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a href="#configurator" className="cta-primary">
                      Start Your Build
                      <ArrowRight size={16} aria-hidden />
                    </a>
                    <a href="#admin-demo" className="cta-secondary">
                      Admin + Mask Tools
                    </a>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {statBlock("Vehicle Flow", "Select vehicle, category, brand, product, then customize before sending a quote.")}
                  {statBlock("Local Media", "Every demo product resolves to local assets under /public/products with permission notes in data.")}
                  {statBlock("Interactive Preview", "Lens tint, housing color, DRL color, projector glow, reflector tint, and opacity update live.")}
                  {statBlock("Scalable Structure", "Catalog, masks, and admin editing all share the same product model for future growth.")}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section id="configurator" className={embedded ? "container-page py-16 sm:py-24" : "container-page py-16 sm:py-20"}>
        <Reveal>
          <SectionHeader
            eyebrow="Configurator"
            title="Select The Product. Shape The Look. Price The Build."
            description="A product-page configurator shell modeled after premium lighting catalogs, rebuilt with the current Forged Customs black, red, and blue palette."
          />
        </Reveal>

        <div className="mt-10 space-y-6">
          <div className="panel-border rounded-[28px] p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-accent">Vehicle</span>
                <select className="focus-field" value={selectedVehicleSlug} onChange={(event) => setSelectedVehicleSlug(event.target.value)}>
                  {demoVehicles.map((vehicle) => (
                    <option key={vehicle.slug} value={vehicle.slug}>
                      {vehicle.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-accent">Category</span>
                <select className="focus-field" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as LightingCategory)}>
                  {lightingCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-accent">Brand</span>
                <select className="focus-field" value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value as LightingBrand | "all")}>
                  <option value="all">All Brands</option>
                  {lightingBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-accent/35 hover:text-white lg:self-end"
                onClick={() => {
                  setSelectedVehicleSlug(demoVehicles[0].slug);
                  setSelectedCategory("headlights");
                  setSelectedBrand("all");
                  setBuild(defaultBuildConfig);
                  setPreviewMode("installed");
                }}
              >
                <RotateCcw size={14} aria-hidden />
                Reset Build
              </button>
            </div>
          </div>

          {selectedProduct && activeMedia ? (
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#111111] shadow-2xl shadow-black/35">
              <div className="grid xl:grid-cols-[240px_minmax(0,1fr)_300px]">
                <aside className="border-b border-white/10 p-5 xl:border-b-0 xl:border-r">
                  <button type="button" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cfg-orange transition hover:text-white">
                    <ArrowLeft size={14} aria-hidden />
                    Back To Products
                  </button>
                  <h2 className="mt-5 font-heading text-4xl uppercase leading-[0.9] text-white">{selectedProduct.brand}</h2>
                  <p className="mt-1 font-heading text-2xl uppercase leading-[0.9] text-white">{selectedProduct.series}</p>
                  <p className="mt-4 text-lg text-zinc-200">{selectedProduct.fitment}</p>
                  <div className="mt-5 inline-flex rounded-xl border border-white/10 bg-black/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    {selectedProduct.productType}
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-accent">Selected Build</p>
                      <div className="mt-4 space-y-3">
                        {summaryItems(selectedProduct, build).map((item) => (
                          <div key={item.label} className="flex items-start justify-between gap-3 text-sm">
                            <span className="text-muted">{item.label}</span>
                            <span className="max-w-[56%] text-right text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-accent">Matching Products</p>
                      <div className="mt-4 space-y-3">
                        {filteredProducts.slice(0, 4).map((product) => {
                          const active = product.id === selectedProduct.id;
                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => setSelectedProductId(product.id)}
                              className={cn(
                                "w-full rounded-2xl border px-3 py-3 text-left transition",
                                active ? "border-accent bg-accent/10" : "border-white/10 bg-white/[0.02] hover:border-accent/35",
                              )}
                            >
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-accent">{product.brand}</p>
                              <p className="mt-1 text-sm font-semibold text-white">{product.series} {product.productName}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="border-b border-white/10 xl:border-b-0 xl:border-r">
                  <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {previewModes.map((mode) => (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => setPreviewMode(mode.value)}
                          className={cn(
                            "rounded-xl border px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition",
                            previewMode === mode.value
                              ? "border-cfg-orange bg-cfg-orange text-white"
                              : "border-white/10 bg-white/[0.02] text-muted hover:border-cfg-orange/35 hover:text-white",
                          )}
                          >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <span>Save Build</span>
                      <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-cfg-orange/35">
                        <Heart size={15} aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="relative min-h-[500px] border-b border-white/10 sm:min-h-[620px]">
                    <ProductStudioStage product={selectedProduct} media={activeMedia} build={build} className="absolute inset-0" />
                    <div className="absolute bottom-5 right-5">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("installed")}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-cfg-orange/35"
                      >
                        <ShoppingCart size={14} aria-hidden />
                        View Installed
                      </button>
                    </div>
                    <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                      {previewLabel(previewMode)}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="flex flex-wrap gap-2">
                        {buildSpecPills(build).map((item) => (
                          <span key={item} className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-3 xl:grid-cols-6">
                    {galleryForProduct(selectedProduct).map((item) => {
                      const selected = activeMedia.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const nextMode = previewModes.find((mode) => mode.value === item.kind);
                            if (nextMode) setPreviewMode(nextMode.value);
                          }}
                          className={cn(
                            "group overflow-hidden rounded-2xl border bg-white/[0.02] text-left transition",
                            selected ? "border-cfg-orange shadow-[0_0_18px_rgba(193,18,31,0.16)]" : "border-white/10 hover:border-cfg-orange/35",
                          )}
                        >
                          <div className="relative aspect-[1.35/1] overflow-hidden bg-black">
                            <Image src={item.src} alt={item.alt} fill sizes="(min-width: 1280px) 10vw, (min-width: 768px) 24vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                          </div>
                          <div className="px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">{item.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <aside className="p-5">
                  <p className="text-lg font-semibold uppercase tracking-[0.12em] text-cfg-orange">Customize Your Lights</p>
                  <div className="mt-6 space-y-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">Lens Tint</p>
                      <div className="mt-4 grid grid-cols-4 gap-3">
                        {lensOptions.map((value) => (
                          <button key={value} type="button" onClick={() => setBuild((current) => ({ ...current, lensTint: value }))} className={circleOptionClass(build.lensTint === value)}>
                            <span className="h-11 w-11 rounded-full border border-white/20 shadow-inner" style={{ background: swatchTone(value) }} />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">{titleCase(value)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">Housing Color</p>
                      <div className="mt-4 grid grid-cols-4 gap-3">
                        {housingOptions.map((value) => (
                          <button key={value} type="button" onClick={() => setBuild((current) => ({ ...current, housing: value }))} className={circleOptionClass(build.housing === value)}>
                            <span className="h-11 w-11 rounded-full border border-white/20 shadow-inner" style={{ background: value === "color-match" ? build.colorMatchHex : swatchTone(value) }} />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">{titleCase(value)}</span>
                          </button>
                        ))}
                      </div>
                      {build.housing === "color-match" ? (
                        <input type="color" value={build.colorMatchHex} onChange={(event) => setBuild((current) => ({ ...current, colorMatchHex: event.target.value }))} className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-transparent" />
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">Accent / DRL Color</p>
                      <div className="mt-4 grid grid-cols-5 gap-3">
                        {drlOptions.map((value) => (
                          <button key={value} type="button" onClick={() => setBuild((current) => ({ ...current, drlColor: value }))} className={circleOptionClass(build.drlColor === value)}>
                            <span className="h-11 w-11 rounded-full border border-white/20 shadow-inner" style={{ background: value === "rgb" ? swatchTone(value) : swatchTone(value) }} />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">{value === "rgb" ? "Custom" : titleCase(value)}</span>
                          </button>
                        ))}
                      </div>
                      {build.drlColor === "rgb" ? (
                        <input type="color" value={build.rgbHex} onChange={(event) => setBuild((current) => ({ ...current, rgbHex: event.target.value }))} className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-transparent" />
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">Halo / Projector Glow</p>
                      <div className="mt-4 grid grid-cols-5 gap-3">
                        {projectorOptions.map((value) => (
                          <button key={value} type="button" onClick={() => setBuild((current) => ({ ...current, projectorGlow: value }))} className={circleOptionClass(build.projectorGlow === value)}>
                            <span className="h-11 w-11 rounded-full border border-white/20 shadow-inner" style={{ background: swatchTone(value) }} />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">{titleCase(value)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {[
                      { key: "brightness", label: "Brightness", value: build.brightness },
                      { key: "opacity", label: "Lens Tint Opacity", value: build.opacity },
                      { key: "glowStrength", label: "Glow Strength", value: build.glowStrength },
                    ].map((slider) => (
                      <label key={slider.key} className="block">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white">
                          <span>{slider.label}</span>
                          <span className="text-muted">{slider.value}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={slider.value}
                          onChange={(event) =>
                            setBuild((current) => ({
                              ...current,
                              [slider.key]: Number(event.target.value),
                            }))
                          }
                          className="h-2 w-full appearance-none rounded-full bg-white/10 accent-cfg-orange"
                        />
                      </label>
                    ))}

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">Reflector Tint</p>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {reflectorOptions.map((value) => (
                          <button key={value} type="button" onClick={() => setBuild((current) => ({ ...current, reflector: value }))} className={cn("rounded-xl border px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition", build.reflector === value ? "border-cfg-orange bg-cfg-orange/10 text-white" : "border-white/10 bg-white/[0.02] text-muted hover:border-cfg-orange/35 hover:text-white")}>
                            {titleCase(value)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted transition hover:text-white"
                      onClick={() => setBuild(defaultBuildConfig)}
                    >
                      <RotateCcw size={14} aria-hidden />
                      Reset To Default
                    </button>
                  </div>
                </aside>
              </div>

              <div className="grid gap-px border-t border-white/10 bg-white/10 lg:grid-cols-[1.1fr_0.92fr_260px_300px]">
                <div className="bg-[#111111] p-5">
                  <p className="text-lg font-semibold uppercase tracking-[0.12em] text-cfg-orange">Your Build Summary</p>
                  <div className="mt-4 flex gap-4">
                    <div className="relative hidden h-28 w-44 overflow-hidden rounded-2xl border border-white/10 bg-black md:block">
                      <Image src={findMedia(selectedProduct, "studio").src} alt={selectedProduct.productName} fill sizes="176px" className="object-cover" />
                    </div>
                    <div className="space-y-2 text-sm">
                      {summaryItems(selectedProduct, build).map((item) => (
                        <div key={item.label} className="flex gap-3">
                          <span className="min-w-24 text-muted">{item.label}</span>
                          <span className="text-white">{item.value}</span>
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <span className="min-w-24 text-muted">Projector</span>
                        <span className="text-white">{titleCase(build.projectorGlow)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111111] p-5">
                  <p className="text-lg font-semibold uppercase tracking-[0.12em] text-cfg-orange">Vehicle Fitment</p>
                  <p className="mt-4 text-2xl font-semibold text-white">{selectedProduct.fitment}</p>
                  <p className="mt-2 text-sm text-muted">{selectedProduct.notes}</p>
                  <button type="button" className="mt-5 rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-accent/35">
                    Change Vehicle
                  </button>
                </div>

                <div className="bg-[#111111] p-5 text-center lg:text-left">
                  <p className="font-heading text-5xl uppercase text-cfg-orange">{formatCurrency(priceEstimate)}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Build Price Estimate</p>
                  <p className="mt-3 text-sm text-muted">Final price varies with supplied parts, finish complexity, and installation scope.</p>
                </div>

                <div className="flex flex-col gap-4 bg-[#111111] p-5">
                  <a href="/quote" className="cta-primary w-full justify-between rounded-2xl">
                    Request A Quote
                    <ArrowRight size={16} aria-hidden />
                  </a>
                  <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-accent/35">
                    <Heart size={16} aria-hidden />
                    Save Build
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel-border rounded-[28px] p-8 text-sm text-muted">
              No demo product matches the current filters. Change the brand or category to continue.
            </div>
          )}
        </div>
      </section>

    </>
  );
}
