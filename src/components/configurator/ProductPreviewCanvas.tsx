"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Image as KonvaImage, Layer, Line, Rect, Stage, Text } from "react-konva";
import type { BuildConfig, LightingProduct, MaskName } from "@/types/lighting-configurator";

type ProductPreviewCanvasProps = {
  product: LightingProduct;
  imageSrc: string;
  build: BuildConfig;
  showCustomization?: boolean;
  editableMask?: MaskName;
  className?: string;
};

const neutralHousing: Record<BuildConfig["housing"], string> = {
  chrome: "#d8dee7",
  "gloss-black": "#111827",
  "matte-black": "#1f2937",
  "color-match": "#ffffff",
};

const lensFill: Record<BuildConfig["lensTint"], string> = {
  clear: "#f8fafc",
  smoke: "#475569",
  "dark-smoke": "#111827",
  amber: "#f59e0b",
};

const reflectorFill: Record<BuildConfig["reflector"], string> = {
  clear: "#ffffff",
  smoke: "#64748b",
  amber: "#f59e0b",
};

const glowFill: Record<Exclude<BuildConfig["drlColor"], "rgb"> | BuildConfig["projectorGlow"], string> = {
  white: "#f8fafc",
  amber: "#f59e0b",
  blue: "#60a5fa",
  red: "#f43f5e",
  green: "#34d399",
};

function percentPoints(points: [number, number][], width: number, height: number) {
  return points.flatMap(([x, y]) => [(x / 100) * width, (y / 100) * height]);
}

function useLoadedImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.crossOrigin = "anonymous";
    nextImage.src = src;
    nextImage.onload = () => setImage(nextImage);
  }, [src]);

  return image;
}

export function ProductPreviewCanvas({
  product,
  imageSrc,
  build,
  showCustomization = true,
  editableMask,
  className,
}: ProductPreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 960, height: 600 });
  const image = useLoadedImage(imageSrc);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const width = Math.max(containerRef.current.clientWidth, 320);
      setSize({ width, height: Math.round(width * 0.625) });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const drlColor = build.drlColor === "rgb" ? build.rgbHex : glowFill[build.drlColor];
  const projectorColor = glowFill[build.projectorGlow];
  const housingColor = build.housing === "color-match" ? build.colorMatchHex : neutralHousing[build.housing];
  const lensOpacity = build.opacity / 100;
  const glowStrength = build.glowStrength / 100;
  const brightness = build.brightness / 100;

  return (
    <div ref={containerRef} className={className}>
      <Stage width={size.width} height={size.height}>
        <Layer>
          <Rect width={size.width} height={size.height} fill="#0B0B0B" />
          {image ? (
            <KonvaImage image={image} width={size.width} height={size.height} />
          ) : (
            <Text
              x={size.width / 2 - 60}
              y={size.height / 2 - 10}
              text="Loading preview"
              fill="#A3A3A3"
              fontSize={16}
            />
          )}
        </Layer>

        {showCustomization ? (
          <>
            <Layer opacity={0.32 + brightness * 0.15}>
              {product.masks
                .filter((mask) => mask.name === "housing")
                .map((mask) => (
                  <Line
                    key={mask.id}
                    points={percentPoints(mask.points, size.width, size.height)}
                    closed
                    fill={housingColor}
                    opacity={build.housing === "chrome" ? 0.14 : 0.26}
                  />
                ))}
            </Layer>
            <Layer opacity={lensOpacity}>
              {product.masks
                .filter((mask) => mask.name === "lens")
                .map((mask) => (
                  <Line
                    key={mask.id}
                    points={percentPoints(mask.points, size.width, size.height)}
                    closed
                    fill={lensFill[build.lensTint]}
                    opacity={build.lensTint === "clear" ? 0.08 : 0.22}
                  />
                ))}
            </Layer>
            <Layer opacity={0.26}>
              {product.masks
                .filter((mask) => mask.name === "reflector")
                .map((mask) => (
                  <Line
                    key={mask.id}
                    points={percentPoints(mask.points, size.width, size.height)}
                    closed
                    fill={reflectorFill[build.reflector]}
                    opacity={build.reflector === "clear" ? 0.12 : 0.28}
                  />
                ))}
            </Layer>
            <Layer opacity={0.72}>
              {product.masks
                .filter((mask) => mask.name === "drl")
                .map((mask) => (
                  <Line
                    key={mask.id}
                    points={percentPoints(mask.points, size.width, size.height)}
                    closed
                    fill={drlColor}
                    opacity={0.38 + glowStrength * 0.22}
                    shadowColor={drlColor}
                    shadowBlur={18 + glowStrength * 42}
                    shadowOpacity={0.55}
                  />
                ))}
            </Layer>
            <Layer opacity={0.78}>
              {product.masks
                .filter((mask) => mask.name === "halo" || mask.name === "accent")
                .map((mask) => (
                  <Line
                    key={mask.id}
                    points={percentPoints(mask.points, size.width, size.height)}
                    closed
                    fill={projectorColor}
                    opacity={0.32 + glowStrength * 0.24}
                    shadowColor={projectorColor}
                    shadowBlur={20 + glowStrength * 48}
                    shadowOpacity={0.65}
                  />
                ))}
            </Layer>
          </>
        ) : null}

        {editableMask ? (
          <Layer>
            {product.masks.map((mask) => (
              <Line
                key={`${mask.id}-stroke`}
                points={percentPoints(mask.points, size.width, size.height)}
                closed
                stroke={editableMask === mask.name ? "#C1121F" : "rgba(193,18,31,0.18)"}
                strokeWidth={editableMask === mask.name ? 2.4 : 1.2}
              />
            ))}
            {product.masks
              .filter((mask) => mask.name === editableMask)
              .flatMap((mask) => mask.points)
              .map(([x, y], index) => (
                <Circle
                  key={`point-${index}`}
                  x={(x / 100) * size.width}
                  y={(y / 100) * size.height}
                  radius={4}
                  fill="#C1121F"
                  stroke="#fff7ed"
                  strokeWidth={1}
                />
              ))}
          </Layer>
        ) : null}
      </Stage>
    </div>
  );
}
