"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const lightingZones = [
  { id: "headlights", label: "Headlights", color: "bg-white/55", position: "left-[44%] top-[44%] h-16 w-44" },
  { id: "fog", label: "Fog Lights", color: "bg-blue-accent/35", position: "left-[39%] top-[56%] h-14 w-52" },
  { id: "rock", label: "Rock Lights", color: "bg-accent/35", position: "left-[24%] top-[70%] h-20 w-[54%]" },
  { id: "wheel", label: "Wheel Lights", color: "bg-blue-accent/28", position: "left-[16%] top-[57%] h-24 w-24" },
  { id: "under", label: "Underglow", color: "bg-accent/28", position: "left-[20%] top-[77%] h-20 w-[62%]" },
];

export function LightingSimulator() {
  const [active, setActive] = useState<Record<string, boolean>>({
    headlights: true,
    fog: true,
    rock: false,
    wheel: false,
    under: true,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/35">
        <Image
          src="/images/after-custom-truck.png"
          alt="Vehicle lighting simulator demo truck"
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/5" />
        {lightingZones.map((zone) =>
          active[zone.id] ? (
            <div
              key={zone.id}
              className={cn(
                "pointer-events-none absolute rounded-full blur-2xl transition",
                zone.color,
                zone.position,
              )}
              aria-hidden
            />
          ) : null,
        )}
      </div>

      <div className="rounded-lg border border-white/10 bg-panel p-5">
        <p className="eyebrow">Lighting Simulator</p>
        <h3 className="mt-3 font-heading text-4xl uppercase leading-none text-white">
          Toggle The Look
        </h3>
        <div className="mt-5 grid gap-3">
          {lightingZones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={cn(
                "flex min-h-12 items-center justify-between rounded-md border px-4 text-sm font-bold uppercase tracking-[0.14em] transition",
                active[zone.id]
                  ? "border-accent bg-accent text-white"
                  : "border-white/10 bg-white/5 text-muted hover:border-blue-accent hover:text-white",
              )}
              onClick={() => setActive((current) => ({ ...current, [zone.id]: !current[zone.id] }))}
            >
              {zone.label}
              <span className="text-xs">{active[zone.id] ? "On" : "Off"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
