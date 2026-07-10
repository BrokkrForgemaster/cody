"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type {
  BuildConfig,
  LightingLayerAsset,
  LightingLayerKey,
  LightingProduct,
  LightingRenderScene,
  PolygonMask,
  ProductMedia,
} from "@/types/lighting-configurator";

type ProductStudioStageProps = {
  product: LightingProduct;
  media: ProductMedia;
  build: BuildConfig;
  className?: string;
};

const housingLightness: Record<BuildConfig["housing"], number> = {
  chrome: 1.08,
  "gloss-black": 0.96,
  "matte-black": 0.88,
  "color-match": 0.98,
};

const lensOverlay: Record<BuildConfig["lensTint"], string> = {
  clear: "rgba(255,255,255,0.02)",
  smoke: "rgba(32,36,44,0.16)",
  "dark-smoke": "rgba(10,12,16,0.28)",
  amber: "rgba(214,130,25,0.16)",
};

const reflectorFill: Record<BuildConfig["reflector"], string> = {
  clear: "rgba(255,255,255,0.08)",
  smoke: "rgba(82,94,118,0.18)",
  amber: "rgba(245,158,11,0.18)",
};

const glowFill: Record<Exclude<BuildConfig["drlColor"], "rgb"> | BuildConfig["projectorGlow"], string> = {
  white: "#f8fafc",
  amber: "#f59e0b",
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#22c55e",
};

function pointsToString(points: [number, number][]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function zones(product: LightingProduct, names: Array<PolygonMask["name"]>) {
  return product.masks.filter((mask) => names.includes(mask.name));
}

function sceneFor(product: LightingProduct, mode: ProductMedia["kind"]) {
  if (mode === "studio" || mode === "installed" || mode === "night" || mode === "beam" || mode === "detail") {
    return product.renderLayers?.[mode] ?? product.renderLayers?.studio;
  }

  return product.renderLayers?.studio;
}

function imageFilter(build: BuildConfig) {
  const brightness = 0.88 + build.brightness / 260;
  const saturation = build.lensTint === "amber" ? 1.06 : 0.98;
  const contrast = build.housing === "chrome" ? 1.06 : 1.02;
  return `brightness(${brightness}) saturate(${saturation}) contrast(${contrast})`;
}

function layerBlend(asset?: LightingLayerAsset) {
  return asset?.blendMode ?? "screen";
}

function layerOpacity(asset?: LightingLayerAsset) {
  return asset?.opacity ?? 1;
}

function layerColor(key: LightingLayerKey, build: BuildConfig) {
  if (key === "lens") {
    if (build.lensTint === "clear") return "rgba(255,255,255,0.08)";
    if (build.lensTint === "smoke") return "rgba(71,85,105,0.28)";
    if (build.lensTint === "dark-smoke") return "rgba(15,23,42,0.5)";
    return "rgba(234,179,8,0.22)";
  }

  if (key === "housing") {
    if (build.housing === "chrome") return "#dbe4ee";
    if (build.housing === "gloss-black") return "#0f172a";
    if (build.housing === "matte-black") return "#1f2937";
    return build.colorMatchHex;
  }

  if (key === "reflector") {
    if (build.reflector === "clear") return "rgba(255,255,255,0.08)";
    if (build.reflector === "smoke") return "rgba(100,116,139,0.22)";
    return "rgba(245,158,11,0.24)";
  }

  if (key === "drl") {
    if (build.drlColor === "rgb") return build.rgbHex;
    const map: Record<Exclude<BuildConfig["drlColor"], "rgb">, string> = {
      white: "#f8fafc",
      amber: "#f59e0b",
      blue: "#3b82f6",
      red: "#ef4444",
    };
    return map[build.drlColor];
  }

  const map: Record<BuildConfig["projectorGlow"], string> = {
    white: "#f8fafc",
    amber: "#f59e0b",
    blue: "#3b82f6",
    green: "#22c55e",
    red: "#ef4444",
  };
  return map[build.projectorGlow];
}

function LayeredScene({
  product,
  scene,
  build,
  baseSrc,
  baseAlt,
}: {
  product: LightingProduct;
  scene: LightingRenderScene;
  build: BuildConfig;
  baseSrc: string;
  baseAlt: string;
}) {
  const orderedLayers: LightingLayerKey[] = ["lens", "housing", "reflector", "drl", "projector"];

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <img
        src={scene.base || baseSrc}
        alt={baseAlt}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        style={{ filter: imageFilter(build) }}
      />

      {orderedLayers.map((key) => {
        const asset = scene.layers?.[key];
        if (!asset) return null;
        const tint = layerColor(key, build);
        const blendMode = layerBlend(asset);
        const opacity = layerOpacity(asset);
        const glow = key === "drl" || key === "projector";

        return (
          <div
            key={key}
            className="absolute inset-0 z-10"
            style={{
              WebkitMaskImage: `url(${asset.src})`,
              maskImage: `url(${asset.src})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "cover",
              maskSize: "cover",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              backgroundColor: tint,
              mixBlendMode: blendMode,
              opacity: glow ? opacity * 0.95 : opacity,
              filter: glow ? "drop-shadow(0 0 16px rgba(255,255,255,0.35))" : "none",
            }}
          />
        );
      })}

      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/38 via-transparent to-black/8" />
    </div>
  );
}

export function ProductStudioStage({ product, media, build, className }: ProductStudioStageProps) {
  const scene = sceneFor(product, media.kind);
  const drlColor = build.drlColor === "rgb" ? build.rgbHex : glowFill[build.drlColor];
  const projectorColor = glowFill[build.projectorGlow];
  const lightOpacity = 0.2 + build.glowStrength / 150;
  const projectorOpacity = 0.18 + build.glowStrength / 165;
  const lensOpacity = build.opacity / 440;
  const housingOpacity = build.housing === "color-match" ? 0.12 : build.housing === "chrome" ? 0.04 : 0.06;

  const colorMatchStyle: CSSProperties =
    build.housing === "color-match"
      ? {
          background: `radial-gradient(circle at 50% 50%, ${build.colorMatchHex}55, transparent 56%)`,
          mixBlendMode: "soft-light",
          opacity: 0.88,
        }
      : {};

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-black", className)}>
      {scene ? (
        <LayeredScene product={product} scene={scene} build={build} baseSrc={media.src} baseAlt={media.alt} />
      ) : (
        <>
          <img
            src={media.src}
            alt={media.alt}
            className="absolute inset-0 z-0 h-full w-full object-cover"
            style={{ filter: imageFilter(build) }}
          />

          <div className="absolute inset-0 z-10" style={{ background: lensOverlay[build.lensTint], opacity: lensOpacity, mixBlendMode: "multiply" }} />
          <div className="absolute inset-0 z-10" style={{ opacity: housingOpacity, ...colorMatchStyle }} />
          <div
            className="absolute inset-0 z-10"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.04), transparent 36%, rgba(0,0,0,0.14))",
              mixBlendMode: "screen",
              opacity: housingLightness[build.housing] - 0.8,
            }}
          />

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 z-10 h-full w-full">
            <defs>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="2.6" result="blurred" />
                <feMerge>
                  <feMergeNode in="blurred" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="wideGlow">
                <feGaussianBlur stdDeviation="5.4" result="blurred" />
                <feMerge>
                  <feMergeNode in="blurred" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {zones(product, ["reflector"]).map((mask) => (
              <polygon
                key={`${mask.id}-reflector`}
                points={pointsToString(mask.points)}
                fill={reflectorFill[build.reflector]}
                opacity={build.reflector === "clear" ? 0.05 : 0.14}
              />
            ))}

            {zones(product, ["drl"]).map((mask) => (
              <polygon
                key={`${mask.id}-drl-soft`}
                points={pointsToString(mask.points)}
                fill={drlColor}
                opacity={lightOpacity * 0.22}
                filter="url(#wideGlow)"
              />
            ))}
            {zones(product, ["drl"]).map((mask) => (
              <polygon
                key={`${mask.id}-drl-core`}
                points={pointsToString(mask.points)}
                fill={drlColor}
                opacity={lightOpacity * 0.14}
                filter="url(#softGlow)"
              />
            ))}

            {zones(product, ["halo", "accent"]).map((mask) => (
              <polygon
                key={`${mask.id}-projector-soft`}
                points={pointsToString(mask.points)}
                fill={projectorColor}
                opacity={projectorOpacity * 0.2}
                filter="url(#wideGlow)"
              />
            ))}
            {zones(product, ["halo", "accent"]).map((mask) => (
              <polygon
                key={`${mask.id}-projector-core`}
                points={pointsToString(mask.points)}
                fill={projectorColor}
                opacity={projectorOpacity * 0.12}
                filter="url(#softGlow)"
              />
            ))}
          </svg>

          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/42 via-transparent to-black/8" />
        </>
      )}
    </div>
  );
}
