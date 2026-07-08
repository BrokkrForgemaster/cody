import type { FaqItem } from "@/types/content";

// Phase 2: faqItems become reorderable Sanity documents assignable to service pages.
export const faqItems: FaqItem[] = [
  {
    id: "paint-duration",
    question: "How long does paint matching take?",
    answer:
      "Most paint matching work takes several business days once parts are approved and scheduled. Larger builds or parts that need extra prep, repair, curing, or polishing can take longer.",
    serviceSlug: "paint-matching",
  },
  {
    id: "factory-code",
    question: "Can you match my factory paint code?",
    answer:
      "Yes. The process starts with the factory paint code, then the finish is checked against the vehicle so panels, trim, flares, and accessories look consistent in real lighting.",
    serviceSlug: "paint-matching",
  },
  {
    id: "customer-lighting",
    question: "Do you install customer-supplied lighting?",
    answer:
      "Customer-supplied lighting can be reviewed before scheduling. The part quality, fitment, wiring needs, and warranty expectations all matter before it goes on the vehicle.",
    serviceSlug: "custom-lighting",
  },
  {
    id: "powder-parts",
    question: "What parts can be powder coated?",
    answer:
      "Common powder coating work includes wheels, calipers, brackets, suspension components, frames, off-road accessories, and many metal parts that can tolerate the coating process.",
    serviceSlug: "powder-coating",
  },
  {
    id: "appointment",
    question: "Do I need an appointment?",
    answer:
      "Yes. An appointment keeps the estimate focused and gives the team time to review the vehicle, parts, finish goals, and timeline before work begins.",
  },
  {
    id: "combined-services",
    question: "Can I get multiple services done at once?",
    answer:
      "Yes. Combining lighting, paint matching, and powder coating is often the best way to make the finished vehicle feel cohesive instead of pieced together.",
  },
  {
    id: "trucks-only",
    question: "Do you work on trucks only?",
    answer:
      "No. Trucks and Jeeps are common, but the same approach applies to SUVs, performance vehicles, and daily drivers that need clean upgrades and premium finishes.",
  },
  {
    id: "warranty",
    question: "Do you offer warranties?",
    answer:
      "Warranty coverage depends on the service, parts, finish, and usage. Production quotes should clearly document workmanship coverage and any manufacturer coverage on supplied parts.",
  },
];
