import type { Testimonial } from "@/types/content";

// Phase 2: testimonials become customer-editable Sanity documents with optional photos and video links.
export const testimonials: Testimonial[] = [
  {
    id: "tyler-lexington",
    customerName: "Tyler M.",
    city: "Lexington KY",
    review:
      "They made my truck look like it should have come from the factory this way.",
    rating: 5,
    vehicle: "2024 Ford F-250 Platinum",
  },
  {
    id: "brandon-richmond",
    customerName: "Brandon R.",
    city: "Richmond KY",
    review:
      "The paint match was flawless and the lighting install was cleaner than I expected.",
    rating: 5,
    vehicle: "2023 Jeep Wrangler Rubicon",
  },
  {
    id: "megan-georgetown",
    customerName: "Megan S.",
    city: "Georgetown KY",
    review:
      "The powder coating completely changed the look of my wheels and suspension.",
    rating: 5,
    vehicle: "2022 Ram 2500 Laramie",
  },
];
