"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  Package,
  Users,
  X,
} from "lucide-react";
import { siteSettings } from "@/data/siteSettings";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Quotes", href: "/admin/quotes", icon: FileText },
  { label: "Jobs", href: "/admin/jobs", icon: KanbanSquare },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Follow-ups", href: "/admin/follow-ups", icon: BellRing },
];

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-label="Close navigation"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-panel/95 backdrop-blur-xl transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        aria-label="Admin navigation"
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="flex items-center gap-3" onClick={onMobileClose}>
            <Image
              src={siteSettings.logoMark.src}
              alt={siteSettings.logoMark.alt}
              width={40}
              height={40}
              className="size-10 object-contain drop-shadow-[0_0_18px_rgba(193,18,31,0.35)]"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-lg uppercase tracking-wide text-text">
                {siteSettings.shortName}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-accent">
                Shop Ops
              </span>
            </div>
          </Link>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-md border border-white/15 bg-white/5 text-white lg:hidden"
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] transition",
                      active
                        ? "bg-white/10 text-white shadow-[inset_2px_0_0_0_var(--accent)]"
                        : "text-muted hover:bg-white/5 hover:text-white",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon
                      size={18}
                      aria-hidden
                      className={cn(
                        "shrink-0 transition",
                        active ? "text-accent" : "text-muted group-hover:text-white",
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted transition hover:border-blue-accent hover:text-white"
            onClick={onMobileClose}
          >
            <span>View public site</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
