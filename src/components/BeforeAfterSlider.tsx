"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageAsset } from "@/types/content";

type BeforeAfterSliderProps = {
  before: ImageAsset;
  after: ImageAsset;
};

export function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(52);

  return (
    <div className="panel-border overflow-hidden rounded-lg">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black sm:aspect-video">
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}>
          <div className="relative h-full" style={{ width: `${10000 / Math.max(position, 1)}%` }}>
            <Image
              src={after.src}
              alt={after.alt}
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-[0_0_24px_rgba(255,255,255,0.5)]"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-black/75 text-xs font-bold uppercase text-white backdrop-blur">
            Drag
          </span>
        </div>
        <div className="absolute left-4 top-4 rounded-md bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
          {after.caption ?? "After"}
        </div>
        <div className="absolute bottom-4 right-4 rounded-md bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
          {before.caption ?? "Before"}
        </div>
      </div>
      <div className="bg-panel p-4">
        <label className="sr-only" htmlFor="before-after-slider">
          Compare before and after
        </label>
        <input
          id="before-after-slider"
          type="range"
          min="8"
          max="92"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="h-2 w-full cursor-ew-resize appearance-none rounded-full bg-white/15 accent-accent"
        />
      </div>
    </div>
  );
}
