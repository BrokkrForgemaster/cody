// Phase 2: replace this import with a Sanity homePage query that resolves image assets.
export const homePage = {
  hero: {
    eyebrow: "Central Kentucky Vehicle Customization",
    headline: "Built Different.",
    subheadline: "Custom Lighting. OEM Paint Matching. Premium Powder Coating.",
    image: {
      src: "/images/hero-truck.png",
      alt: "Black lifted custom truck in a dark studio with red and blue lighting accents",
    },
    primaryCta: {
      label: "Build My Project",
      href: "/quote",
    },
    secondaryCta: {
      label: "View Featured Builds",
      href: "/projects",
    },
  },
  servicesIntro: {
    eyebrow: "Premium Customization",
    title: "One Shop For The Details That Change Everything",
    description:
      "Lighting, paint matching, and powder coating planned together so the final build looks intentional from every angle.",
  },
  transformation: {
    eyebrow: "Before And After",
    title: "See the Transformation",
    description:
      "From factory stock to fully finished, every detail is built around your vision.",
    before: {
      src: "/images/before-stock-truck-facing-right.png",
      alt: "Stock white pickup with factory wheels, black plastic bumpers, and standard headlights",
      caption: "Factory Stock",
    },
    after: {
      src: "/images/after-custom-truck.png",
      alt: "Customized white pickup with paint matched bumpers, custom lights, and powder coated wheels",
      caption: "Finished Build",
    },
  },
  featuredBuildSlugs: [
    "2024-ford-f250-platinum",
    "2023-jeep-wrangler-rubicon",
    "2022-ram-2500-laramie",
  ],
  stats: [
    { value: "500+", label: "Vehicles Transformed" },
    { value: "100%", label: "Paint-Code Focused" },
    { value: "Premium", label: "Lighting Installs" },
    { value: "Central KY", label: "Built" },
  ],
  finalCta: {
    title: "Ready to Build Something Incredible?",
    description:
      "Send the vehicle, the goal, and the must-have details. The demo quote builder shows how the production request flow will work.",
    buttonLabel: "Start My Quote",
    href: "/quote",
  },
};
