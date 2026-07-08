import type { Project } from "@/types/content";

// Phase 2: projects become Sanity project documents. The fields below match the
// requested CMS-ready case study structure and can be queried by slug.
export const projects: Project[] = [
  {
    slug: "2024-ford-f250-platinum",
    title: "2024 Ford F-250 Platinum",
    vehicle: "2024 Ford F-250 Platinum",
    year: "2024",
    make: "Ford",
    model: "F-250",
    trim: "Platinum",
    location: "Lexington KY",
    heroImage: "/images/project-f250.png",
    imageAlt: "White heavy duty custom truck with paint matched trim and custom LED lighting",
    services: ["Custom Lighting", "Paint Matching", "Powder Coating"],
    summary:
      "A high-dollar heavy duty truck finished with paint matched exterior pieces, a cleaner lighting signature, and powder coated details that keep the Platinum trim feeling premium.",
    goals: [
      "Create a factory-plus finish that looked premium, not aftermarket.",
      "Improve front-end lighting without cluttering the grille or bumper.",
      "Darken wheel and suspension details while keeping the white paint dominant.",
    ],
    process: [
      "Confirmed paint code and selected exterior pieces for matching.",
      "Planned headlight, fog, and rock light wiring routes before disassembly.",
      "Powder coated wheels and visible brackets in satin black.",
      "Reassembled, aimed lighting, and completed finish inspection.",
    ],
    results: [
      "Cleaner front-end presence with crisp custom lighting.",
      "Paint matched parts that visually extend the factory body lines.",
      "Satin black wheel and bracket finish that grounds the stance.",
    ],
    gallery: [
      { src: "/images/project-f250.png", alt: "Finished Ford F-250 style custom build" },
      { src: "/images/lighting-service.png", alt: "Custom lighting detail" },
      { src: "/images/powder-coating-service.png", alt: "Powder coated wheel detail" },
      { src: "/images/after-custom-truck.png", alt: "Finished white custom truck" },
    ],
    seo: {
      title: "2024 Ford F-250 Platinum Custom Build | Central Kentucky",
      description:
        "Case study for a 2024 Ford F-250 Platinum custom build with custom lighting, OEM paint matching, and powder coated details in Lexington KY.",
    },
  },
  {
    slug: "2023-jeep-wrangler-rubicon",
    title: "2023 Jeep Wrangler Rubicon",
    vehicle: "2023 Jeep Wrangler Rubicon",
    year: "2023",
    make: "Jeep",
    model: "Wrangler",
    trim: "Rubicon",
    location: "Richmond KY",
    heroImage: "/images/project-jeep.png",
    imageAlt: "Custom Jeep style SUV with auxiliary lights and powder coated wheels",
    services: ["Custom Lighting", "Powder Coating"],
    summary:
      "A trail-capable Rubicon build with practical auxiliary lighting, clean controller placement, and a powder coated wheel finish that works on road or off.",
    goals: [
      "Add usable lighting for night trail visibility.",
      "Keep wiring hidden and controls simple.",
      "Upgrade wheel finish without making the vehicle feel overbuilt.",
    ],
    process: [
      "Mapped lighting zones for roof, fog, rock, and wheel-area lighting.",
      "Installed protected wiring routes with serviceable access points.",
      "Powder coated wheels in a satin black finish.",
      "Tested lighting zones at night and adjusted output angles.",
    ],
    results: [
      "Better night visibility around the vehicle.",
      "A cleaner, more aggressive stance.",
      "Controls that feel intuitive for daily driving and weekend use.",
    ],
    gallery: [
      { src: "/images/project-jeep.png", alt: "Finished Jeep style custom lighting build" },
      { src: "/images/gallery-night-jeep.png", alt: "Night shot of custom off-road lighting" },
      { src: "/images/lighting-service.png", alt: "LED lighting detail" },
      { src: "/images/project-tacoma.png", alt: "Off-road lighting comparison build" },
    ],
    seo: {
      title: "2023 Jeep Wrangler Rubicon Lighting Build | Richmond KY",
      description:
        "Custom Jeep Wrangler Rubicon lighting and powder coating case study from Forged Customs in Central Kentucky.",
    },
  },
  {
    slug: "2022-ram-2500-laramie",
    title: "2022 Ram 2500 Laramie",
    vehicle: "2022 Ram 2500 Laramie",
    year: "2022",
    make: "Ram",
    model: "2500",
    trim: "Laramie",
    location: "Georgetown KY",
    heroImage: "/images/project-ram.png",
    imageAlt: "Dark heavy duty custom truck with LED headlights and powder coated wheels",
    services: ["Custom Lighting", "Paint Matching", "Powder Coating"],
    summary:
      "A tow-ready diesel build with a cleaner front end, stronger lighting output, and darker wheel and suspension details for a refined heavy duty look.",
    goals: [
      "Upgrade lighting for rural roads and towing confidence.",
      "Reduce chrome and unmatched exterior contrast.",
      "Keep the truck mature enough for work use.",
    ],
    process: [
      "Reviewed customer use cases for towing, back roads, and daily driving.",
      "Paint matched selected exterior trim and grille surround areas.",
      "Installed lighting with hidden wiring and weather-protected connections.",
      "Finished wheel and bracket surfaces in satin black powder coat.",
    ],
    results: [
      "Better road presence after dark.",
      "Reduced exterior visual clutter.",
      "A cohesive black and graphite finish package.",
    ],
    gallery: [
      { src: "/images/project-ram.png", alt: "Finished Ram 2500 style custom build" },
      { src: "/images/powder-coating-service.png", alt: "Powder coated wheel and suspension detail" },
      { src: "/images/lighting-service.png", alt: "Custom lighting close-up" },
      { src: "/images/gallery-shop-truck.png", alt: "Custom truck in fabrication shop" },
    ],
    seo: {
      title: "2022 Ram 2500 Laramie Custom Build | Georgetown KY",
      description:
        "Ram 2500 Laramie custom lighting, paint matching, and powder coating case study in Central Kentucky.",
    },
  },
  {
    slug: "2021-chevy-silverado-trail-boss",
    title: "2021 Chevy Silverado Trail Boss",
    vehicle: "2021 Chevy Silverado Trail Boss",
    year: "2021",
    make: "Chevy",
    model: "Silverado",
    trim: "Trail Boss",
    location: "Nicholasville KY",
    heroImage: "/images/project-silverado.png",
    imageAlt: "Red custom off-road pickup with paint matched bumpers and bronze wheels",
    services: ["Paint Matching", "Powder Coating"],
    summary:
      "A Trail Boss build focused on exterior finish cohesion, with paint matched bumpers and bronze powder coated wheels that add character without losing daily usability.",
    goals: [
      "Remove the unfinished look of factory black bumper pieces.",
      "Add wheel contrast with a premium off-road finish.",
      "Keep the truck clean enough for work and family use.",
    ],
    process: [
      "Matched exterior parts to the factory red paint code.",
      "Prepped bumper and trim surfaces for long-term finish quality.",
      "Powder coated wheels in bronze with a durable off-road finish.",
      "Performed final panel, reflection, and finish checks.",
    ],
    results: [
      "Painted parts that tie into the body color.",
      "Bronze wheel finish that adds depth without looking loud.",
      "A more expensive, intentionally finished Trail Boss profile.",
    ],
    gallery: [
      { src: "/images/project-silverado.png", alt: "Finished Chevy Silverado Trail Boss style build" },
      { src: "/images/paint-matching-service.png", alt: "Paint matched pickup detail" },
      { src: "/images/powder-coating-service.png", alt: "Powder coated wheel detail" },
      { src: "/images/after-custom-truck.png", alt: "Finished paint matched white truck" },
    ],
    seo: {
      title: "2021 Chevy Silverado Trail Boss Paint Match Build | Nicholasville KY",
      description:
        "Chevy Silverado Trail Boss paint matching and bronze powder coating case study from a Central Kentucky customization shop.",
    },
  },
  {
    slug: "2024-gmc-sierra-at4",
    title: "2024 GMC Sierra AT4",
    vehicle: "2024 GMC Sierra AT4",
    year: "2024",
    make: "GMC",
    model: "Sierra",
    trim: "AT4",
    location: "Winchester KY",
    heroImage: "/images/project-sierra.png",
    imageAlt: "Metallic gray custom pickup with blue accent lighting and black wheels",
    services: ["Custom Lighting", "Paint Matching", "Powder Coating"],
    summary:
      "A refined AT4 build that keeps the premium factory language intact while adding custom lighting, paint matched trim, and a darker powder coated stance.",
    goals: [
      "Modernize lighting without making the truck look over-accessorized.",
      "Bring exterior trim into the body color story.",
      "Choose a wheel finish that feels premium in daylight and at night.",
    ],
    process: [
      "Selected lighting zones that would improve visibility and style.",
      "Matched trim pieces and checked panel tone under multiple lighting angles.",
      "Powder coated wheels and hardware in satin black.",
      "Completed a final inspection across lighting, paint, and hardware.",
    ],
    results: [
      "Subtle blue-accented lighting presence.",
      "Cleaner side and front-end profile.",
      "Factory-quality finish direction with a custom edge.",
    ],
    gallery: [
      { src: "/images/project-sierra.png", alt: "Finished GMC Sierra AT4 style custom build" },
      { src: "/images/lighting-service.png", alt: "Custom LED lighting detail" },
      { src: "/images/paint-matching-service.png", alt: "Paint matched truck in studio" },
      { src: "/images/project-f250.png", alt: "White heavy duty custom truck" },
    ],
    seo: {
      title: "2024 GMC Sierra AT4 Custom Build | Winchester KY",
      description:
        "Custom GMC Sierra AT4 lighting, paint matching, and powder coating case study serving Winchester and Central Kentucky.",
    },
  },
  {
    slug: "2020-toyota-tacoma-trd-pro",
    title: "2020 Toyota Tacoma TRD Pro",
    vehicle: "2020 Toyota Tacoma TRD Pro",
    year: "2020",
    make: "Toyota",
    model: "Tacoma",
    trim: "TRD Pro",
    location: "Lexington KY",
    heroImage: "/images/project-tacoma.png",
    imageAlt: "Custom midsize off-road pickup with amber lighting and overland details",
    services: ["Custom Lighting", "Powder Coating"],
    summary:
      "A midsize overland-inspired build with amber lighting, powder coated wheels, and exterior details that feel trail-ready without becoming cluttered.",
    goals: [
      "Add usable auxiliary lighting for travel and camping.",
      "Improve the wheel finish for a tougher trail profile.",
      "Keep the truck practical, clean, and easy to maintain.",
    ],
    process: [
      "Planned amber lighting zones for forward visibility and campsite use.",
      "Installed protected wiring and simple control access.",
      "Powder coated wheels in a trail-ready dark finish.",
      "Checked alignment of lights, brackets, and exterior accessories.",
    ],
    results: [
      "A cleaner overland stance.",
      "Improved lighting around the vehicle at dusk and night.",
      "A durable finish package ready for daily driving and weekend trips.",
    ],
    gallery: [
      { src: "/images/project-tacoma.png", alt: "Finished Toyota Tacoma TRD Pro style custom build" },
      { src: "/images/project-jeep.png", alt: "Off-road lighting build comparison" },
      { src: "/images/powder-coating-service.png", alt: "Powder coated wheel and suspension detail" },
      { src: "/images/gallery-night-jeep.png", alt: "Night lighting shot" },
    ],
    seo: {
      title: "2020 Toyota Tacoma TRD Pro Lighting Build | Lexington KY",
      description:
        "Toyota Tacoma TRD Pro custom lighting and powder coating case study from Forged Customs.",
    },
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
