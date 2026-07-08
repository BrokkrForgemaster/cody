"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { siteSettings } from "@/data/siteSettings";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-background/82 backdrop-blur-xl">
      <div className="container-page flex h-20 items-center justify-between gap-5">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-10 place-items-center rounded-md border border-accent/55 bg-accent/15 font-heading text-2xl text-white shadow-glow">
            BG
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-heading text-xl uppercase leading-none tracking-normal text-white sm:text-2xl">
              Bluegrass Custom
            </span>
            <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted sm:block">
              Coatings & Lighting
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {siteSettings.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted transition hover:bg-white/5 hover:text-white",
                pathname === item.href && "bg-white/10 text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={`tel:${siteSettings.phone}`} className="cta-secondary px-4">
            <Phone size={17} aria-hidden />
            Call
          </a>
          <Link href="/quote" className="cta-primary">
            {siteSettings.primaryCta}
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-md border border-white/15 bg-white/5 text-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-background/96 px-4 pb-5 pt-2 shadow-2xl shadow-black/40 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
            {siteSettings.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted",
                  pathname === item.href && "bg-white/10 text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/quote" onClick={() => setOpen(false)} className="cta-primary mt-3 w-full">
              {siteSettings.primaryCta}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
