import type {
  LightingProduct,
  LightingCategory,
  LightingBrand,
  LightingRenderLayers,
  PolygonMask,
  VehicleOption,
} from "@/types/lighting-configurator";

export const demoVehicles: VehicleOption[] = [
  { make: "Ford", model: "F-150", yearRange: "2018-2020", label: "Ford F-150 (2018-2020)", slug: "ford-f150-2018-2020" },
  { make: "Ford", model: "F-150", yearRange: "2021-2023", label: "Ford F-150 (2021-2023)", slug: "ford-f150-2021-2023" },
  { make: "Ford", model: "Super Duty", yearRange: "2020-2024", label: "Ford Super Duty", slug: "ford-super-duty" },
  { make: "Toyota", model: "Tacoma", yearRange: "2016-2023", label: "Toyota Tacoma", slug: "toyota-tacoma" },
  { make: "Ram", model: "1500", yearRange: "2019-2024", label: "Ram 1500", slug: "ram-1500" },
  { make: "Chevrolet", model: "Silverado", yearRange: "2019-2024", label: "Chevrolet Silverado", slug: "chevrolet-silverado" },
];

export const lightingCategories: { value: LightingCategory; label: string }[] = [
  { value: "headlights", label: "Headlights" },
  { value: "tail-lights", label: "Tail Lights" },
  { value: "fog-lights", label: "Fog Lights" },
  { value: "marker-lights", label: "Marker Lights" },
];

export const lightingBrands: LightingBrand[] = [
  "AlphaRex",
  "Morimoto",
  "Form Lighting",
  "Oracle Lighting",
  "RECON",
];

function masks(shape: "f150" | "super-duty" | "tacoma" | "ram" | "silverado"): PolygonMask[] {
  const presets: Record<string, PolygonMask[]> = {
    "f150": [
      { id: "lens", name: "lens", points: [[8, 20], [90, 12], [95, 38], [92, 74], [44, 82], [12, 76], [6, 52]] },
      { id: "housing", name: "housing", points: [[14, 24], [88, 18], [90, 66], [50, 76], [18, 72], [12, 54]] },
      { id: "reflector", name: "reflector", points: [[58, 48], [89, 44], [88, 64], [60, 68], [51, 58]] },
      { id: "drl", name: "drl", points: [[10, 28], [74, 18], [82, 28], [34, 38], [12, 38]] },
      { id: "halo", name: "halo", points: [[28, 34], [46, 32], [56, 42], [54, 58], [38, 62], [26, 52]] },
      { id: "accent", name: "accent", points: [[18, 58], [44, 56], [48, 66], [20, 68]] },
    ],
    "super-duty": [
      { id: "lens", name: "lens", points: [[12, 16], [90, 16], [92, 80], [16, 84], [8, 56]] },
      { id: "housing", name: "housing", points: [[18, 20], [84, 22], [86, 74], [20, 78], [14, 52]] },
      { id: "reflector", name: "reflector", points: [[18, 58], [82, 58], [80, 76], [22, 74]] },
      { id: "drl", name: "drl", points: [[18, 24], [78, 24], [80, 34], [20, 36]] },
      { id: "halo", name: "halo", points: [[30, 34], [58, 34], [62, 52], [54, 64], [30, 62], [24, 48]] },
      { id: "accent", name: "accent", points: [[58, 34], [82, 34], [82, 52], [64, 56]] },
    ],
    "tacoma": [
      { id: "lens", name: "lens", points: [[10, 26], [88, 18], [94, 46], [88, 70], [36, 80], [8, 70]] },
      { id: "housing", name: "housing", points: [[14, 30], [84, 24], [88, 62], [42, 72], [16, 68]] },
      { id: "reflector", name: "reflector", points: [[52, 50], [88, 46], [84, 62], [54, 66], [46, 56]] },
      { id: "drl", name: "drl", points: [[12, 30], [70, 22], [78, 30], [28, 40], [12, 40]] },
      { id: "halo", name: "halo", points: [[28, 36], [48, 34], [54, 46], [52, 60], [34, 62], [24, 50]] },
      { id: "accent", name: "accent", points: [[18, 54], [42, 52], [44, 62], [20, 64]] },
    ],
    "ram": [
      { id: "lens", name: "lens", points: [[12, 24], [86, 24], [92, 50], [88, 76], [24, 80], [8, 54]] },
      { id: "housing", name: "housing", points: [[18, 28], [82, 28], [86, 68], [28, 72], [14, 52]] },
      { id: "reflector", name: "reflector", points: [[20, 60], [82, 60], [80, 74], [26, 74]] },
      { id: "drl", name: "drl", points: [[16, 28], [78, 28], [80, 36], [20, 38]] },
      { id: "halo", name: "halo", points: [[32, 36], [54, 36], [60, 50], [56, 62], [34, 64], [24, 48]] },
      { id: "accent", name: "accent", points: [[58, 40], [82, 40], [82, 58], [64, 58]] },
    ],
    "silverado": [
      { id: "lens", name: "lens", points: [[10, 18], [90, 12], [96, 40], [88, 74], [34, 80], [8, 66]] },
      { id: "housing", name: "housing", points: [[14, 22], [86, 18], [88, 66], [40, 72], [14, 62]] },
      { id: "reflector", name: "reflector", points: [[56, 48], [86, 44], [84, 66], [54, 66]] },
      { id: "drl", name: "drl", points: [[12, 24], [76, 18], [82, 28], [26, 36], [12, 34]] },
      { id: "halo", name: "halo", points: [[26, 32], [48, 30], [56, 42], [54, 58], [34, 60], [24, 48]] },
      { id: "accent", name: "accent", points: [[18, 56], [44, 54], [46, 64], [22, 66]] },
    ],
  };

  return presets[shape];
}

function mediaBase(base: string, alt: string) {
  return [
    { id: "studio", label: "Studio Product", kind: "studio" as const, src: `${base}/front.png`, alt },
    { id: "installed", label: "Installed Truck", kind: "installed" as const, src: `${base}/installed.png`, alt },
    { id: "night", label: "Night View", kind: "night" as const, src: `${base}/night.png`, alt },
    { id: "beam", label: "Beam Pattern", kind: "beam" as const, src: `${base}/beam.png`, alt },
    { id: "detail", label: "Detail", kind: "detail" as const, src: `${base}/detail.png`, alt },
    { id: "drl", label: "DRL Signature", kind: "drl" as const, src: `${base}/drl.png`, alt },
    { id: "signal", label: "Signal View", kind: "signal" as const, src: `${base}/signal.png`, alt },
    { id: "angle", label: "Angle View", kind: "detail" as const, src: `${base}/angle.png`, alt },
  ];
}

function vehicleBySlug(slug: VehicleOption["slug"]) {
  return demoVehicles.find((vehicle) => vehicle.slug === slug)!;
}

function product(input: Omit<LightingProduct, "gallery" | "renderLayers" | "masks" | "installedImages" | "nightImages"> & {
  basePath: string;
  maskShape: Parameters<typeof masks>[0];
  renderLayers?: LightingRenderLayers;
}) {
  const alt = `${input.brand} ${input.productName} for ${input.vehicle.label}`;
  const gallery = mediaBase(input.basePath, alt);

  return {
    ...input,
    gallery,
    renderLayers: input.renderLayers,
    masks: masks(input.maskShape),
    installedImages: gallery.filter((item) => item.kind === "installed" || item.kind === "detail").map((item) => item.src),
    nightImages: gallery.filter((item) => item.kind === "night" || item.kind === "beam").map((item) => item.src),
  };
}

export const seedLightingProducts: LightingProduct[] = [
  product({
    id: "alpharex-f150-2018-nova",
    brand: "AlphaRex",
    series: "NOVA Series",
    productName: "LED Projector Headlights",
    productLine: "Premium headlight",
    category: "headlights",
    productType: "Headlights",
    vehicle: vehicleBySlug("ford-f150-2018-2020"),
    priceFrom: 1685,
    summary: "Signature dual projector look with aggressive DRL geometry for a cleaner 2018-2020 F-150 front end.",
    fitment: "Ford F-150 2018-2020",
    notes: "Demo fitment references AlphaRex F-150 2018-2020 collection and NOVA series product page.",
    imagePermissionNotes: "Local demo media only. Replace with customer-provided, licensed, or manufacturer-authorized assets before production launch.",
    basePath: "/products/alpharex/ford-f150/2018-2020/nova",
    maskShape: "f150",
  }),
  product({
    id: "alpharex-f150-2021-luxx",
    brand: "AlphaRex",
    series: "LUXX Series",
    productName: "LED Projector Headlights",
    productLine: "Premium headlight",
    category: "headlights",
    productType: "Headlights",
    vehicle: vehicleBySlug("ford-f150-2021-2023"),
    priceFrom: 1495,
    summary: "Sharper DRL signature and blackout housing package for late-model F-150 street trucks.",
    fitment: "Ford F-150 2021-2023",
    notes: "Demo fitment references AlphaRex 2021-2023 collection.",
    imagePermissionNotes: "Local demo media only. Replace with approved production imagery.",
    basePath: "/products/alpharex/ford-f150/2021-2023/luxx",
    maskShape: "f150",
  }),
  product({
    id: "morimoto-f150-2021-xb-headlights",
    brand: "Morimoto",
    series: "XB LED",
    productName: "LED Headlights",
    productLine: "Flagship headlight",
    category: "headlights",
    productType: "Headlights",
    vehicle: vehicleBySlug("ford-f150-2021-2023"),
    priceFrom: 1850,
    summary: "Premium XB LED setup with crisp optics, modern DRL shape, and a factory-plus installed look.",
    fitment: "Ford F-150 2021-2023",
    notes: "Demo fitment references Morimoto F-150 XB LED headlights page.",
    imagePermissionNotes: "Local demo media only. Replace with approved production imagery.",
    basePath: "/products/morimoto/ford-f150/2021-2023/xb-led-headlights",
    maskShape: "f150",
  }),
  product({
    id: "morimoto-f150-2021-xb-tail-lights",
    brand: "Morimoto",
    series: "XB LED",
    productName: "Tail Lights",
    productLine: "Rear lighting",
    category: "tail-lights",
    productType: "Tail Lights",
    vehicle: vehicleBySlug("ford-f150-2021-2023"),
    priceFrom: 980,
    summary: "Blacked-out rear lighting with cleaner brake illumination and a stronger OEM+ finish.",
    fitment: "Ford F-150 2021-2023",
    notes: "Demo product for Morimoto rear lighting showcase.",
    imagePermissionNotes: "Local demo media only. Replace with approved production imagery.",
    basePath: "/products/morimoto/ford-f150/2021-2023/xb-tail-lights",
    maskShape: "f150",
  }),
  product({
    id: "form-tacoma-led-headlights",
    brand: "Form Lighting",
    series: "Signature LED",
    productName: "Headlights",
    productLine: "Daily-driver upgrade",
    category: "headlights",
    productType: "Headlights",
    vehicle: vehicleBySlug("toyota-tacoma"),
    priceFrom: 1295,
    summary: "Tacoma-focused projector setup with clean output, darker internals, and an intentional DRL line.",
    fitment: "Toyota Tacoma 2016-2023",
    notes: "Demo fitment references Form Lighting Toyota collection.",
    imagePermissionNotes: "Local demo media only. Replace with approved production imagery.",
    basePath: "/products/form-lighting/toyota-tacoma/2016-2023/signature-headlights",
    maskShape: "tacoma",
  }),
  product({
    id: "form-ram-1500-tail-lights",
    brand: "Form Lighting",
    series: "Signature LED",
    productName: "Tail Lights",
    productLine: "Rear lighting",
    category: "tail-lights",
    productType: "Tail Lights",
    vehicle: vehicleBySlug("ram-1500"),
    priceFrom: 845,
    summary: "Modern rear lighting update for Ram 1500 trucks with darker trim and stronger on-road presence.",
    fitment: "Ram 1500 2019-2024",
    notes: "Demo fitment references Form Lighting Ram collection.",
    imagePermissionNotes: "Local demo media only. Replace with approved production imagery.",
    basePath: "/products/form-lighting/ram-1500/2019-2024/signature-tail-lights",
    maskShape: "ram",
  }),
  product({
    id: "oracle-f150-colorshift-headlights",
    brand: "Oracle Lighting",
    series: "ColorSHIFT",
    productName: "RGB Headlight Accent Kit",
    productLine: "Show build lighting",
    category: "headlights",
    productType: "Headlight Accent",
    vehicle: vehicleBySlug("ford-f150-2021-2023"),
    priceFrom: 1195,
    summary: "ColorSHIFT preview for customers who want a more expressive show-truck DRL and projector glow package.",
    fitment: "Ford F-150 2021-2023",
    notes: "Demo fitment references Oracle Ford collection.",
    imagePermissionNotes: "Local demo media only. Replace with approved production imagery.",
    basePath: "/products/oracle/ford-f150/2021-2023/colorshift-headlights",
    maskShape: "f150",
  }),
  product({
    id: "oracle-silverado-colorshift-headlights",
    brand: "Oracle Lighting",
    series: "ColorSHIFT",
    productName: "RGB Headlight Accent Kit",
    productLine: "Show build lighting",
    category: "headlights",
    productType: "Headlight Accent",
    vehicle: vehicleBySlug("chevrolet-silverado"),
    priceFrom: 1245,
    summary: "RGB-capable accent lighting demo for Silverado builds that need a stronger nighttime identity.",
    fitment: "Chevrolet Silverado 2019-2024",
    notes: "Demo fitment references Oracle Chevrolet collection.",
    imagePermissionNotes: "Local demo media only. Replace with approved production imagery.",
    basePath: "/products/oracle/chevrolet-silverado/2019-2024/colorshift-headlights",
    maskShape: "silverado",
  }),
  product({
    id: "recon-super-duty-tail-lights",
    brand: "RECON",
    series: "Smoked LED",
    productName: "Tail Lights",
    productLine: "Heavy-duty rear lighting",
    category: "tail-lights",
    productType: "Tail Lights",
    vehicle: vehicleBySlug("ford-super-duty"),
    priceFrom: 765,
    summary: "Smoked LED rear lighting package for Super Duty trucks that need a darker, more premium rear-end treatment.",
    fitment: "Ford Super Duty 2020-2024",
    notes: "Demo fitment references RECON catalog positioning.",
    imagePermissionNotes: "Local demo media only. Replace with approved production imagery.",
    basePath: "/products/recon/ford-super-duty/2020-2024/tail-lights",
    maskShape: "super-duty",
  }),
  product({
    id: "recon-super-duty-marker-lights",
    brand: "RECON",
    series: "Cab Roof LED",
    productName: "Marker Lights",
    productLine: "Heavy-duty marker lighting",
    category: "marker-lights",
    productType: "Marker Lights",
    vehicle: vehicleBySlug("ford-super-duty"),
    priceFrom: 345,
    summary: "Roof marker lighting upgrade that adds a sharper silhouette and ties the whole build together at night.",
    fitment: "Ford Super Duty 2020-2024",
    notes: "Demo product for RECON marker light catalog expansion.",
    imagePermissionNotes: "Local demo media only. Replace with approved production imagery.",
    basePath: "/products/recon/ford-super-duty/2020-2024/marker-lights",
    maskShape: "super-duty",
  }),
];
