import type { Product, Vendor } from "@/types/content";

// Phase 2 commerce: Sanity can manage premium product content while Shopify
// or Stripe Checkout handles payment, tax, inventory, and shipping rules.
export const vendors: Vendor[] = [
  {
    id: "alpharex",
    name: "AlphaRex USA",
    leadTime: "Fitment and availability verified per product",
    shippingOrigin: "Supplier or distributor dependent",
    supportNotes:
      "Use official AlphaRex installation guides during planning. Product images and logos require supplier permission before public reuse.",
    website: "https://alpharexusa.com/",
    installationGuideUrl: "https://installation.alpharexusa.com/",
    authorizedUseNote:
      "Demo references the official AlphaRex guide portal by link only; no supplier media is copied into the site.",
  },
  {
    id: "morimoto",
    name: "Morimoto",
    leadTime: "Fitment and availability verified per product",
    shippingOrigin: "Supplier or distributor dependent",
    supportNotes:
      "Use official Morimoto install guides and product data during planning. Product images, logos, PDFs, and guide media require supplier permission before public reuse.",
    website: "https://www.morimotohid.com/",
    installationGuideUrl: "https://www.morimotohid.com/install",
    authorizedUseNote:
      "Demo references the official Morimoto install guide index by link only; no supplier media or guide PDFs are copied into the site.",
  },
  {
    id: "apex-lighting",
    name: "Apex Lighting Supply",
    leadTime: "3-7 business days",
    shippingOrigin: "Midwest distribution",
    supportNotes: "Lighting products require fitment review before install scheduling.",
  },
  {
    id: "forgecoat",
    name: "ForgeCoat Components",
    leadTime: "5-10 business days",
    shippingOrigin: "Southeast distribution",
    supportNotes: "Coating-ready parts may require inspection before finish work.",
  },
  {
    id: "trailform",
    name: "TrailForm Off-Road",
    leadTime: "7-14 business days",
    shippingOrigin: "Regional warehouse",
    supportNotes: "Oversized accessories should ship directly to the shop for install.",
  },
  {
    id: "precisionplates",
    name: "Precision Plate Works",
    leadTime: "2-4 weeks",
    shippingOrigin: "Made-to-order fabrication",
    supportNotes: "Custom coil plates and brackets require vehicle measurements.",
  },
];

export const productCategories = [
  "All",
  "Lighting",
  "Paintable Parts",
  "Powder Coat Ready",
  "Install Kits",
  "Custom Fabrication",
];

export const products: Product[] = [
  {
    slug: "alpharex-headlight-install-planning-package",
    title: "AlphaRex Headlight Install Planning Package",
    category: "Lighting",
    vendorId: "alpharex",
    image: {
      src: "/images/lighting-service.png",
      alt: "Custom LED headlight concept used as local demo imagery for AlphaRex planning package",
    },
    price: "Quote required",
    installEstimate: "Install estimate after fitment review",
    summary:
      "Supplier-referenced headlight planning package using AlphaRex official install guides for fitment and installation prep.",
    description:
      "A quote-first product path for customers interested in AlphaRex-style direct-fit lighting. Production should verify the exact part number, vehicle fitment, supplier authorization, install guide, warranty expectations, and whether the product ships to the customer or directly to the shop.",
    compatibleVehicles: ["Ford Trucks", "Ram Trucks", "GM Trucks", "Jeep", "Toyota Trucks"],
    badges: ["Official guide link", "Fitment review required", "Shop install recommended"],
    shipModes: ["shop-install"],
    installGuideUrl: "https://installation.alpharexusa.com/category/headlights-installation-guide/",
    options: [
      { label: "Source", values: ["Shop sourced", "Customer supplied", "Dealer verified"] },
      { label: "Install path", values: ["Ship to shop", "Drop-off with vehicle", "Quote-only review"] },
      { label: "Customization", values: ["As supplied", "Paint accents", "Logo/design concept review"] },
    ],
    seo: {
      title: "AlphaRex Headlight Install Planning | Central Kentucky",
      description:
        "Quote-first AlphaRex headlight installation planning with fitment review, official guide reference, and ship-to-shop install routing.",
    },
  },
  {
    slug: "morimoto-headlight-install-planning-package",
    title: "Morimoto Headlight Install Planning Package",
    category: "Lighting",
    vendorId: "morimoto",
    image: {
      src: "/images/lighting-service.png",
      alt: "Custom LED headlight concept used as local demo imagery for Morimoto planning package",
    },
    price: "Quote required",
    installEstimate: "Install estimate after fitment and guide review",
    summary:
      "Quote-first planning path for Morimoto lighting products using the official install guide index for vehicle, product, and part-number review.",
    description:
      "A supplier-referenced planning package for customers interested in Morimoto headlights, tail lights, fog lights, off-road lighting, bulbs, or retrofit parts. Production should verify the exact part number, vehicle fitment, official install guide, warranty expectations, supplier authorization, and whether the order ships to the customer or directly to the shop.",
    compatibleVehicles: ["Ford Trucks", "Ram Trucks", "GM Trucks", "Jeep", "Toyota Trucks", "Performance Vehicles"],
    badges: ["Official guide index", "Part-number review", "Shop install recommended"],
    shipModes: ["customer", "shop-install"],
    installGuideUrl: "https://www.morimotohid.com/install",
    options: [
      { label: "Source", values: ["Shop sourced", "Customer supplied", "Dealer verified"] },
      { label: "Product type", values: ["Headlights", "Tail lights", "Fog lights", "Off-road lighting", "Retrofit parts"] },
      { label: "Install path", values: ["Ship to shop", "Ship to customer", "Quote-only review"] },
    ],
    seo: {
      title: "Morimoto Install Planning | Custom Lighting in Central Kentucky",
      description:
        "Quote-first Morimoto lighting installation planning with official install guide reference, fitment review, and shop install routing.",
    },
  },
  {
    slug: "4th-gen-ram-oem-projector-headlight-build",
    title: "4th Gen Ram OEM Projector Headlight Build",
    category: "Lighting",
    vendorId: "apex-lighting",
    image: {
      src: "/images/lighting-service.png",
      alt: "Custom projector headlight build with paint and lighting options",
    },
    price: "From $300",
    installEstimate: "Final build price after options and fitment review",
    summary:
      "Configurable 2013-2018 Ram and Ram Classic projector-style headlight build with source, paint, signal, halo, and demon-eye options.",
    description:
      "A custom headlight product path modeled around how customers actually order lighting builds: choose whether the headlights are supplied or shop-sourced, select paint and lighting upgrades, add paint codes or build notes, then send the configuration into quote or checkout review.",
    compatibleVehicles: ["2013-2018 Ram 1500", "2013-2018 Ram 2500", "2013-2018 Ram 3500", "2019+ Ram Classic"],
    badges: ["Customer-supplied option", "Paint-code notes", "Lighting upgrades"],
    shipModes: ["shop-install"],
    options: [
      { label: "Headlights", values: ["Customer supplied", "Shop sourced", "Fitment review needed"] },
      { label: "Paint Match", values: ["No paint match", "Paint match housing", "Paint match accents", "Gloss black"] },
      { label: "Turn Signal", values: ["Standard amber", "Sequential amber", "Switchback white/amber"] },
      { label: "Halos", values: ["No halos", "White halos", "Amber halos", "RGB halos"] },
      { label: "Demon Eyes", values: ["No demon eyes", "Red demon eyes", "Blue demon eyes", "RGB demon eyes"] },
      { label: "Lower Run/Turn Signal Lens", values: ["Clear lens", "Light smoke lens", "Show smoke lens"] },
    ],
    seo: {
      title: "4th Gen Ram OEM Projector Headlight Build | Custom Lighting",
      description:
        "Configurable 4th Gen Ram projector headlight build with paint match, turn signal, halo, demon eye, lens, and paint-code notes.",
    },
  },
  {
    slug: "matrix-led-headlight-package",
    title: "Matrix LED Headlight Package",
    category: "Lighting",
    vendorId: "apex-lighting",
    image: {
      src: "/images/lighting-service.png",
      alt: "Custom LED headlight package on a black truck",
    },
    price: "From $1,895",
    installEstimate: "Install estimate: $450-$850",
    summary: "Premium headlight upgrade with crisp DRL signature, cleaner output, and hidden wiring planning.",
    description:
      "A high-impact lighting package for customers who want the front of the vehicle to feel modern without looking cluttered. Production checkout should verify fitment and install requirements before payment.",
    compatibleVehicles: ["Ford F-Series", "Ram 2500", "GM 1500/2500", "Jeep Wrangler", "Toyota Tacoma"],
    badges: ["Fitment review required", "Install available", "Ships to shop"],
    shipModes: ["customer", "shop-install"],
    options: [
      { label: "Lens", values: ["Clear", "Smoked"] },
      { label: "Accent", values: ["White DRL", "Amber DRL", "RGB Accent"] },
    ],
    seo: {
      title: "Matrix LED Headlight Package | Custom Truck Lighting",
      description:
        "Premium custom LED headlight package with fitment review, ship-to-customer, and ship-to-shop install options.",
    },
  },
  {
    slug: "rgb-rock-light-kit",
    title: "RGB Rock Light Kit",
    category: "Lighting",
    vendorId: "apex-lighting",
    image: {
      src: "/images/after-custom-truck.png",
      alt: "Truck with custom rock lights and finished exterior",
    },
    price: "From $595",
    installEstimate: "Install estimate: $350-$700",
    summary: "App-controlled rock light kit for wheel wells, trail visibility, and night-shot presence.",
    description:
      "A flexible underbody lighting kit for trucks and Jeeps. Production ordering should capture vehicle type, desired zones, controller preference, and whether the kit ships to the customer or shop.",
    compatibleVehicles: ["Trucks", "Jeeps", "SUVs"],
    badges: ["Popular add-on", "Install available", "Photo-friendly"],
    shipModes: ["customer", "shop-install"],
    options: [
      { label: "Pods", values: ["4-pod", "6-pod", "8-pod"] },
      { label: "Controller", values: ["Bluetooth", "Hardwired switch", "RGB controller"] },
    ],
    seo: {
      title: "RGB Rock Light Kit | Custom Lighting Install",
      description:
        "RGB rock light kit for trucks, Jeeps, and SUVs with customer shipping or shop install options.",
    },
  },
  {
    slug: "paint-match-mirror-cap-set",
    title: "Paint-Match Mirror Cap Set",
    category: "Paintable Parts",
    vendorId: "trailform",
    image: {
      src: "/images/paint-matching-service.png",
      alt: "Paint matched white truck exterior parts",
    },
    price: "From $325",
    installEstimate: "Paint and install estimate: $275-$525",
    summary: "Replacement mirror caps prepared for OEM-style paint matching and clean exterior finishing.",
    description:
      "A simple but visible upgrade for customers trying to remove unpainted exterior contrast. Production checkout should collect paint code and confirm year/make/model fitment.",
    compatibleVehicles: ["Ford F-Series", "GM Trucks", "Ram Trucks", "Toyota Tacoma"],
    badges: ["Paint code needed", "Ships to shop recommended", "OEM+ finish"],
    shipModes: ["shop-install"],
    options: [
      { label: "Finish", values: ["Paint to match", "Gloss black", "Satin black"] },
      { label: "Install", values: ["Shop install", "Pickup after paint"] },
    ],
    seo: {
      title: "Paint Match Mirror Caps | OEM-Style Vehicle Finish",
      description:
        "Paint-match mirror cap set with shop paint and install options for trucks and SUVs.",
    },
  },
  {
    slug: "bronze-wheel-powder-package",
    title: "Bronze Wheel Powder Package",
    category: "Powder Coat Ready",
    vendorId: "forgecoat",
    image: {
      src: "/images/powder-coating-service.png",
      alt: "Bronze powder coated off-road wheel and suspension detail",
    },
    price: "From $980",
    installEstimate: "Mounting and balance estimate: $180-$320",
    summary: "Wheel finish package built around bronze, gunmetal, satin black, or custom powder selections.",
    description:
      "A wheel-focused package for customers who want a stronger stance without changing the whole vehicle. Production order flow should schedule wheel drop-off, coating, mounting, and balancing.",
    compatibleVehicles: ["Truck wheels", "Jeep wheels", "SUV wheels", "Performance wheels"],
    badges: ["Durable finish", "Shop scheduling required", "Finish samples available"],
    shipModes: ["shop-install"],
    options: [
      { label: "Finish", values: ["Bronze", "Satin black", "Gunmetal", "Candy red", "Illusion blue"] },
      { label: "Quantity", values: ["Set of 4", "Set of 5"] },
    ],
    seo: {
      title: "Bronze Wheel Powder Coating Package | Central Kentucky",
      description:
        "Powder coating package for truck, Jeep, SUV, and performance wheels with shop scheduling.",
    },
  },
  {
    slug: "off-road-fog-light-install-kit",
    title: "Off-Road Fog Light Install Kit",
    category: "Install Kits",
    vendorId: "trailform",
    image: {
      src: "/images/project-sierra.png",
      alt: "Custom truck with premium fog lighting and blue accent light",
    },
    price: "From $745",
    installEstimate: "Install estimate: $375-$650",
    summary: "Fog light kit with brackets, harness planning, and vehicle-specific fitment notes.",
    description:
      "Built for customers who want functional front lighting without a messy accessory look. Production should validate bumper style, switch preference, and wiring route.",
    compatibleVehicles: ["GM 1500/2500", "Ford F-Series", "Ram Trucks", "Toyota Tacoma"],
    badges: ["Fitment sensitive", "Ships to shop recommended", "Functional lighting"],
    shipModes: ["customer", "shop-install"],
    options: [
      { label: "Beam", values: ["Driving", "Wide cornering", "Combo"] },
      { label: "Lens color", values: ["Clear", "Amber"] },
    ],
    seo: {
      title: "Off-Road Fog Light Install Kit | Truck Lighting",
      description:
        "Off-road fog light install kit with fitment review, customer shipping, and shop install options.",
    },
  },
  {
    slug: "custom-coil-plate-design",
    title: "Custom Coil Plate Design",
    category: "Custom Fabrication",
    vendorId: "precisionplates",
    image: {
      src: "/images/gallery-shop-truck.png",
      alt: "Custom truck in fabrication shop for custom install parts",
    },
    price: "Quote required",
    installEstimate: "Design and install quoted together",
    summary: "Made-to-order coil plate, bracket, or accent plate concept for custom vehicle installs.",
    description:
      "A fabrication-oriented product request that should start as a quote instead of instant checkout. The quote form can capture finish direction, lighting color, and part intent.",
    compatibleVehicles: ["Custom truck builds", "Jeep builds", "Performance installs", "Fabrication projects"],
    badges: ["Quote required", "Made to order", "Fitment guided"],
    shipModes: ["shop-install"],
    options: [
      { label: "Material", values: ["Aluminum", "Steel", "Stainless"] },
      { label: "Finish", values: ["Raw for paint", "Powder coat", "Brushed", "Custom color"] },
    ],
    seo: {
      title: "Custom Coil Plate Design | Vehicle Fabrication Concept",
      description:
        "Custom coil plate, bracket, and accent plate design requests for premium vehicle installs.",
    },
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getVendorById(id: string) {
  return vendors.find((vendor) => vendor.id === id);
}
