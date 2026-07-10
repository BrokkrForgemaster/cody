"use client";

import {
  BarChart3,
  ClipboardCheck,
  Package,
  Printer,
  Receipt,
  RotateCcw,
  ScanLine,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin/inventory", label: "Parts", icon: Package, exact: true },
  { href: "/admin/inventory/scan", label: "Scan", icon: ScanLine },
  { href: "/admin/inventory/labels", label: "Labels", icon: Printer },
  { href: "/admin/inventory/counts", label: "Counts", icon: ClipboardCheck },
  { href: "/admin/inventory/reorder", label: "Reorder", icon: RotateCcw },
  { href: "/admin/inventory/purchase-orders", label: "POs", icon: Receipt },
  { href: "/admin/inventory/analytics", label: "Analytics", icon: BarChart3 },
];

export function InventoryNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Inventory sections" className="mb-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-1 rounded-md border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-[0.14em]">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-3 py-1.5 transition",
                  active ? "bg-accent text-white" : "text-muted hover:text-white",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={13} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
