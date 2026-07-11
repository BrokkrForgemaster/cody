import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // The service worker and `next dev` don't mix, so it's off in development by
  // default. Set ENABLE_PWA_DEV=1 to smoke-test the SW locally; real offline
  // verification should still use `next build && next start`.
  disable: process.env.NODE_ENV === "development" && !process.env.ENABLE_PWA_DEV,
});

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // B:\ drive doesn't handle webpack's compressed pack files reliably;
      // memory cache avoids the "incorrect header check" warnings on startup.
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default withSerwist(nextConfig);
