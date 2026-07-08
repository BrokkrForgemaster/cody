import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/services", "/projects", "/gallery", "/about", "/faq", "/quote"];
  const serviceRoutes = services.map((service) => service.href);
  const projectRoutes = projects.map((project) => `/projects/${project.slug}`);

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date("2026-07-07"),
    changeFrequency: route.includes("/projects/") ? "monthly" : "weekly",
    priority: route === "" ? 1 : route.includes("/quote") ? 0.9 : 0.7,
  }));
}
