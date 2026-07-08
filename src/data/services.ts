import { faqItems } from "@/data/faq";
import type { Service } from "@/types/content";

// Phase 2: these objects map to a Sanity services collection. Component layouts stay locked
// while customers edit titles, descriptions, images, offerings, process steps, galleries, and FAQs.
export const services: Service[] = [
  {
    slug: "custom-lighting",
    title: "Custom Lighting",
    shortTitle: "Lighting",
    href: "/services/custom-lighting",
    summary:
      "Headlights, fog lights, rock lights, wheel lights, RGB accents, and clean installs designed to transform the look of your vehicle day or night.",
    description:
      "From subtle OEM+ upgrades to full RGB accent packages, lighting is one of the fastest ways to transform your vehicle. Every install is planned for clean wiring, practical controls, and a finished look that belongs on the build.",
    heroImage: {
      src: "/images/lighting-service.png",
      alt: "Close-up of custom LED headlights with crisp white and RGB accent lighting",
    },
    panelImage: {
      src: "/images/lighting-service.png",
      alt: "Custom LED headlight detail on a black pickup",
    },
    offerings: [
      "Custom headlights",
      "Fog light upgrades",
      "Rock lights",
      "Wheel lights",
      "Underglow",
      "Interior accent lighting",
      "RGB controllers",
      "Clean wiring and hidden installs",
    ],
    process: [
      "Review lighting goals, night visibility needs, and desired style.",
      "Confirm fitment, wiring paths, controller placement, and switching.",
      "Install lighting with protected wiring, clean routing, and tested circuits.",
      "Aim, test, and walk through controls before delivery.",
    ],
    gallery: [
      { src: "/images/lighting-service.png", alt: "Custom LED headlight close-up" },
      { src: "/images/project-jeep.png", alt: "Jeep style SUV with custom auxiliary lighting" },
      { src: "/images/after-custom-truck.png", alt: "White truck with custom lighting package" },
    ],
    faqs: faqItems.filter((item) => item.serviceSlug === "custom-lighting"),
    seo: {
      title:
        "Custom Truck Lighting in Central Kentucky | Bluegrass Custom Coatings & Lighting",
      description:
        "Premium custom lighting installs in Central Kentucky including headlights, fog lights, rock lights, wheel lights, RGB accents, and hidden wiring.",
    },
  },
  {
    slug: "paint-matching",
    title: "OEM Paint Matching. Factory-Level Finish.",
    shortTitle: "Paint Matching",
    href: "/services/paint-matching",
    summary:
      "Factory-style color matching for bumpers, trim, mirrors, grilles, flares, badges, and exterior components.",
    description:
      "Paint matching is what makes a build feel finished. The process starts with the paint code, then focuses on prep, coverage, clear, polish, and inspection so the parts look intentional beside factory panels.",
    heroImage: {
      src: "/images/paint-matching-service.png",
      alt: "White luxury pickup with paint matched bumpers, mirror caps, grille, and fender flares",
    },
    panelImage: {
      src: "/images/paint-matching-service.png",
      alt: "Paint matched white pickup in a premium detailing studio",
    },
    offerings: [
      "Bumpers",
      "Fender flares",
      "Mirror caps",
      "Grilles",
      "Door handles",
      "Badges",
      "Trim pieces",
      "Custom exterior parts",
    ],
    process: [
      "Paint code identification",
      "Surface preparation",
      "Primer and base coat",
      "Clear coat",
      "Wet sanding and polish",
      "Final inspection",
    ],
    gallery: [
      { src: "/images/paint-matching-service.png", alt: "Paint matched white pickup" },
      { src: "/images/before-stock-truck-facing-right.png", alt: "Factory stock white truck before paint matching" },
      { src: "/images/after-custom-truck.png", alt: "Finished white truck after paint matching" },
    ],
    faqs: faqItems.filter((item) => item.serviceSlug === "paint-matching"),
    seo: {
      title:
        "OEM Paint Matching in Central Kentucky | Truck Trim, Bumpers & Flares",
      description:
        "Factory-style paint matching for bumpers, flares, grilles, mirrors, trim, badges, and exterior parts near Lexington, Richmond, and Georgetown KY.",
    },
  },
  {
    slug: "powder-coating",
    title: "Durable Finishes. Custom Looks.",
    shortTitle: "Powder Coating",
    href: "/services/powder-coating",
    summary:
      "Durable, premium finishes for wheels, suspension parts, calipers, frames, brackets, and custom components.",
    description:
      "Powder coating adds depth, durability, and a custom finish to parts that see real use. Choose a subtle OEM+ black, a bronze off-road look, or a statement color that ties the whole build together.",
    heroImage: {
      src: "/images/powder-coating-service.png",
      alt: "Bronze powder coated wheel and black suspension components on a lifted truck",
    },
    panelImage: {
      src: "/images/powder-coating-service.png",
      alt: "Powder coated bronze off-road wheel and black suspension details",
    },
    offerings: [
      "Wheels",
      "Brake calipers",
      "Suspension components",
      "Frames",
      "Brackets",
      "Engine bay components",
      "Off-road accessories",
    ],
    process: [
      "Review part condition, finish goals, and disassembly requirements.",
      "Prep metal surfaces for clean coating adhesion.",
      "Apply selected powder finish with attention to coverage and edges.",
      "Cure, cool, inspect, and prepare parts for install or pickup.",
    ],
    gallery: [
      { src: "/images/powder-coating-service.png", alt: "Bronze powder coated wheel detail" },
      { src: "/images/project-silverado.png", alt: "Truck with bronze powder coated wheels" },
      { src: "/images/project-ram.png", alt: "Heavy duty truck with black powder coated wheels" },
    ],
    faqs: faqItems.filter((item) => item.serviceSlug === "powder-coating"),
    seo: {
      title:
        "Powder Coating in Central Kentucky | Wheels, Calipers & Truck Parts",
      description:
        "Premium powder coating for wheels, calipers, suspension parts, frames, brackets, and custom vehicle components in Central Kentucky.",
    },
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
