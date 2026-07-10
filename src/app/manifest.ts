import type { MetadataRoute } from "next";
import { siteSettings } from "@/data/siteSettings";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteSettings.businessName} - Shop Ops`,
    short_name: siteSettings.shortName,
    description:
      "Internal operations platform for Forged Customs: customers, quotes, jobs, inventory, and follow-ups. Works offline for shop-floor use.",
    id: "/",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0B0B0B",
    theme_color: "#0B0B0B",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "New Quote",
        short_name: "Quote",
        url: "/admin/quotes/new",
      },
      {
        name: "Jobs Board",
        short_name: "Jobs",
        url: "/admin/jobs",
      },
      {
        name: "Inventory",
        short_name: "Inventory",
        url: "/admin/inventory",
      },
    ],
  };
}
