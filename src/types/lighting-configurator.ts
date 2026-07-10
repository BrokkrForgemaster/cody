export type LightingCategory = "headlights" | "tail-lights" | "fog-lights" | "marker-lights";

export type PreviewMode = "studio" | "installed" | "night" | "beam" | "detail";

export type GalleryKind = PreviewMode | "drl" | "signal";

export type LightingBrand = "AlphaRex" | "Morimoto" | "Form Lighting" | "Oracle Lighting" | "RECON";

export type MaskName = "lens" | "housing" | "reflector" | "drl" | "halo" | "accent";

export type LightingLayerKey = "lens" | "housing" | "reflector" | "drl" | "projector";

export type LayerBlendMode = "normal" | "multiply" | "screen" | "overlay" | "soft-light" | "color-dodge";

export type LightingLayerAsset = {
  src: string;
  opacity?: number;
  blendMode?: LayerBlendMode;
};

export type LightingRenderScene = {
  base: string;
  layers?: Partial<Record<LightingLayerKey, LightingLayerAsset>>;
};

export type LightingRenderLayers = Partial<Record<PreviewMode, LightingRenderScene>> & {
  studio: LightingRenderScene;
};

export type VehicleOption = {
  make: string;
  model: string;
  yearRange: string;
  label: string;
  slug: string;
};

export type ProductMedia = {
  id: string;
  label: string;
  kind: GalleryKind;
  src: string;
  alt: string;
};

export type PolygonMask = {
  id: string;
  name: MaskName;
  points: [number, number][];
};

export type LightingProduct = {
  id: string;
  brand: LightingBrand;
  series: string;
  productName: string;
  productLine: string;
  category: LightingCategory;
  productType: string;
  vehicle: VehicleOption;
  priceFrom: number;
  summary: string;
  fitment: string;
  gallery: ProductMedia[];
  renderLayers?: LightingRenderLayers;
  masks: PolygonMask[];
  installedImages: string[];
  nightImages: string[];
  notes: string;
  imagePermissionNotes: string;
};

export type BuildConfig = {
  lensTint: "clear" | "smoke" | "dark-smoke" | "amber";
  housing: "chrome" | "gloss-black" | "matte-black" | "color-match";
  drlColor: "white" | "amber" | "blue" | "red" | "rgb";
  projectorGlow: "white" | "amber" | "blue" | "green" | "red";
  reflector: "clear" | "smoke" | "amber";
  brightness: number;
  glowStrength: number;
  opacity: number;
  colorMatchHex: string;
  rgbHex: string;
};

export type QuoteRequestState = {
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  notes: string;
};

export const defaultBuildConfig: BuildConfig = {
  lensTint: "clear",
  housing: "gloss-black",
  drlColor: "white",
  projectorGlow: "white",
  reflector: "clear",
  brightness: 82,
  glowStrength: 78,
  opacity: 72,
  colorMatchHex: "#5f6670",
  rgbHex: "#4f8cff",
};
