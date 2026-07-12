import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const isPwaDev =
  process.env.NODE_ENV === "development" && !process.env.ENABLE_PWA_DEV;

const withSerwist = withSerwistInit({
  // In dev, compile a no-op SW so any previously installed production SW is
  // immediately displaced without blocking requests. Use ENABLE_PWA_DEV=1 to
  // test the real SW locally; production always uses the full sw.ts.
  swSrc: isPwaDev ? "src/app/sw-noop.ts" : "src/app/sw.ts",
  swDest: "public/sw.js",
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
