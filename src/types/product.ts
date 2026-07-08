export type LightProductType = "headlight" | "taillight" | "foglight" | "marker";

export type GalleryView = {
  id: string;
  label: string;
  imageUrl: string;
};

export type MaskRegion = {
  id: string;
  name: "lens" | "housing" | "reflector" | "drl" | "halo" | "accent";
  type: "polygon";
  points: [number, number][]; // percentage coords [0-100, 0-100] relative to image
};

export type LightProduct = {
  id: string;
  name: string;
  brand: string;
  vehicleFitment: string;
  type: LightProductType;
  baseImage: string;
  galleryViews: GalleryView[];
  masks: MaskRegion[];
  disclaimer: string;
  imagePermissionNotes: string;
};

export type LensTint = "clear" | "smoke" | "dark-smoke" | "amber";
export type HousingColor = "chrome" | "gloss-black" | "matte-black" | "color-match";
export type DrlColor = "white" | "amber" | "red" | "blue" | "custom";
export type HaloGlow = "white" | "amber" | "blue" | "red" | "green";
export type ReflectorTint = "none" | "smoke" | "amber" | "red";

export type BuildConfig = {
  lensTint: LensTint;
  housingColor: HousingColor;
  drlColor: DrlColor;
  drlCustomColor: string;
  haloGlow: HaloGlow;
  brightness: number;
  lensTintOpacity: number;
  reflectorTint: ReflectorTint;
};

export const defaultBuildConfig: BuildConfig = {
  lensTint: "clear",
  housingColor: "gloss-black",
  drlColor: "white",
  drlCustomColor: "#ffffff",
  haloGlow: "white",
  brightness: 80,
  lensTintOpacity: 65,
  reflectorTint: "none",
};
