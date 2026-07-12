import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText, KanbanSquare, Package, ShieldCheck, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DashboardStats } from "@/components/admin/DashboardStats";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const quickLinks = [
  { label: "New quote", href: "/admin/quotes/new", icon: FileText },
  { label: "Add customer", href: "/admin/customers/new", icon: Users },
  { label: "Jobs board", href: "/admin/jobs", icon: KanbanSquare },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Security", href: "/admin/security", icon: ShieldCheck },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        eyebrow="Shop Ops"
        title="Dashboard"
        description="Live view of shop activity."
      />

      <DashboardStats />

      <section aria-label="Quick actions" className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="panel-border group flex items-center justify-between rounded-lg p-4 transition hover:border-blue-accent/60 hover:bg-white/5"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className="text-blue-accent" aria-hidden />
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-text">
                    {link.label}
                  </span>
                </span>
                <ArrowUpRight
                  size={16}
                  aria-hidden
                  className="text-muted transition group-hover:text-blue-accent"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
