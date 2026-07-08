import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/services",
    "/projects",
    "/products",
    "/gallery",
    "/about",
    "/faq",
    "/quote",
  ];
  const serviceRoutes = services.map((service) => service.href);
  const projectRoutes = projects.map((project) => `/projects/${project.slug}`);
  const productRoutes = products.map((product) => `/products/${product.slug}`);

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes, ...productRoutes].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date("2026-07-07"),
    changeFrequency: route.includes("/projects/") || route.includes("/products/")
      ? "monthly"
      : "weekly",
    priority: route === "" ? 1 : route.includes("/quote") ? 0.9 : 0.7,
  }));
}
