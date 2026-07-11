"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  maxR: number;
  age: number;
  maxAge: number;
  cr: number;
  cg: number;
  cb: number;
}


export function LogoSmokeIntro({ onComplete }: { onComplete: () => void }) {
  const rootRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef   = useRef<HTMLDivElement>(null);
  const sheenRef  = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const rootRaw  = rootRef.current;
    const canvas   = canvasRef.current;
    const logoRaw  = logoRef.current;
    const sheenRaw = sheenRef.current;
    if (!rootRaw || !canvas || !logoRaw || !sheenRaw) return;

    const root:  HTMLDivElement = rootRaw;
    const logo:  HTMLDivElement = logoRaw;
    const sheen: HTMLDivElement = sheenRaw;

    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    const W   = window.innerWidth;
    const H   = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Logo geometry — SVG intrinsic 1200:560
    const logoW      = Math.min(620, W * 0.82);
    const logoH      = logoW * (560 / 1200);
    const logoCX     = W / 2;
    const logoCY     = H / 2;
    const logoBottom = logoCY + logoH / 2;

    const particles: Particle[] = [];

    function spawnSmoke(burst = false) {
      let x: number, y: number, vx: number, vy: number;
      let r: number, maxR: number, maxAge: number;

      if (burst) {
        // Radial burst from all around the logo perimeter
        const angle = Math.random() * Math.PI * 2;
        const dist  = logoW * (0.35 + Math.random() * 0.55);
        x    = logoCX + Math.cos(angle) * dist;
        y    = logoCY + Math.sin(angle) * dist * 0.5;
        vx   = Math.cos(angle) * (0.4 + Math.random() * 1.4);
        vy   = -(0.8 + Math.random() * 2.8);
        r    = 18 + Math.random() * 28;
        maxR = 70 + Math.random() * 110;
        maxAge = 55 + Math.random() * 55;
      } else {
        const zone = Math.random();

        if (zone < 0.48) {
          // Primary: wide floor — extends well past screen edges for full base
          x  = logoCX + (Math.random() - 0.5) * W * 1.4;
          y  = logoBottom + Math.random() * (H - logoBottom) * 0.75;
          vx = (Math.random() - 0.5) * 1.6;
          vy = -(0.8 + Math.random() * 2.0);
        } else if (zone < 0.66) {
          // Left flank — wraps around left side of logo
          x  = logoCX - logoW * (0.52 + Math.random() * 0.65);
          y  = logoCY + (Math.random() - 0.1) * logoH * 1.3;
          vx = (Math.random() - 0.3) * 1.2;
          vy = -(0.6 + Math.random() * 1.6);
        } else if (zone < 0.84) {
          // Right flank — wraps around right side of logo
          x  = logoCX + logoW * (0.52 + Math.random() * 0.65);
          y  = logoCY + (Math.random() - 0.1) * logoH * 1.3;
          vx = -(Math.random() - 0.3) * 1.2;
          vy = -(0.6 + Math.random() * 1.6);
        } else {
          // Deep sub-frame — large slow puffs rising from below screen
          x  = logoCX + (Math.random() - 0.5) * logoW * 1.6;
          y  = H + Math.random() * 80;
          vx = (Math.random() - 0.5) * 0.7;
          vy = -(0.5 + Math.random() * 1.0);
        }

        r    = 14 + Math.random() * 24;
        maxR = 140 + Math.random() * 230;
        maxAge = 130 + Math.random() * 180;
      }

      // Dark charcoal to mid-gray — must be lighter than #060606 background to be visible
      const smoke = 38 + Math.random() * 88;

      particles.push({ x, y, vx, vy, r, maxR, age: 0, maxAge, cr: smoke, cg: smoke, cb: smoke });
    }

    // Pre-seed the pool so smoke is present on frame 1
    for (let i = 0; i < 55; i++) {
      spawnSmoke();
      const p   = particles[particles.length - 1];
      const pct = Math.random() * 0.42;
      p.age = Math.floor(p.maxAge * pct);
      p.r   = p.r + (p.maxR - p.r) * Math.min(pct * 1.9, 1);
      p.y  += p.vy * p.age;
      p.x  += p.vx * p.age;
    }

    const start = performance.now();
    let phase   = 0;
    let bursted = false;

    function frame(now: number) {
      const t = now - start;
      ctx.clearRect(0, 0, W, H);

      // ── spawn ──
      if (t < 4200) {
        const count = t < 300  ? 18
                    : t < 700  ? 16
                    : t < 1400 ? 13
                    : t < 2400 ? 9
                    : t < 3400 ? 5
                    : 2;
        for (let i = 0; i < count; i++) spawnSmoke();
      }

      // ── radial burst at logo reveal ──
      if (t >= 600 && !bursted) {
        bursted = true;
        for (let i = 0; i < 40; i++) spawnSmoke(true);
      }

      // ── draw particles ──
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age++;
        p.x  += p.vx;
        p.y  += p.vy;
        p.vx += (Math.random() - 0.5) * 0.11;
        p.vy *= 0.998;
        p.r  += (p.maxR - p.r) * 0.014;

        const life  = p.age / p.maxAge;
        const alpha = life < 0.09 ? (life / 0.09) * 0.90
                    : life < 0.50 ? 0.90
                    : (1 - (life - 0.50) / 0.50) * 0.90;

        if (alpha <= 0.01 || p.r < 1) { particles.splice(i, 1); continue; }

        // Skip particles fully outside viewport
        if (p.x + p.r < 0 || p.x - p.r > W || p.y + p.r < 0 || p.y - p.r > H) {
          if (p.age >= p.maxAge) particles.splice(i, 1);
          continue;
        }

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0,    `rgba(${p.cr},${p.cg},${p.cb},${alpha.toFixed(3)})`);
        g.addColorStop(0.38, `rgba(${p.cr},${p.cg},${p.cb},${(alpha * 0.58).toFixed(3)})`);
        g.addColorStop(1,    `rgba(${p.cr},${p.cg},${p.cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (p.age >= p.maxAge) particles.splice(i, 1);
      }

      // ── phase transitions ──

      // Logo in — emerges from the smoke
      if (t >= 650 && phase === 0) {
        phase = 1;
        logo.style.transition = "opacity 1.5s ease-out, transform 1.5s cubic-bezier(0.16,1,0.3,1)";
        logo.style.opacity    = "1";
        logo.style.transform  = "scale(1)";
      }

      // Sheen sweep
      if (t >= 2100 && phase === 1) {
        phase = 2;
        sheen.style.animation = "fc-intro-sheen 0.9s ease-out forwards";
      }

      // Logo out
      if (t >= 3300 && phase === 2) {
        phase = 3;
        logo.style.transition = "opacity 0.75s ease-in, transform 0.75s ease-in";
        logo.style.opacity    = "0";
        logo.style.transform  = "scale(1.09)";
      }

      // Overlay out
      if (t >= 3950 && phase === 3) {
        phase = 4;
        root.style.transition = "opacity 0.55s ease-out";
        root.style.opacity    = "0";
      }

      // Done
      if (t >= 4550 && phase === 4) {
        phase = 5;
        root.style.display = "none";
        onComplete();
        return;
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#060606]"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        ref={logoRef}
        className="pointer-events-none relative z-10 select-none"
        style={{ opacity: 0, transform: "scale(0.86)" }}
      >
        <div className="relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/forged-customs-hero-logo.svg"
            alt="Forged Customs"
            draggable={false}
            className="w-[min(620px,82vw)] drop-shadow-[0_0_60px_rgba(90,90,90,0.75)]"
          />
          <div
            ref={sheenRef}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(108deg, transparent 10%, rgba(255,255,255,0.65) 50%, transparent 90%)",
              transform: "translateX(-160%)",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fc-intro-sheen {
          from { transform: translateX(-160%); }
          to   { transform: translateX(270%); }
        }
      `}</style>
    </div>
  );
}
