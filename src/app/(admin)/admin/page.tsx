import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText, KanbanSquare, Package, ShieldCheck, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Open jobs", value: "—", trend: "Awaiting DB" },
  { label: "Quotes this week", value: "—", trend: "Awaiting DB" },
  { label: "Low-stock parts", value: "—", trend: "Awaiting DB" },
  { label: "Follow-ups due", value: "—", trend: "Awaiting DB" },
];

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
        description="Live view of shop activity. Data will populate once the database and sync layer are connected."
      />

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="panel-border rounded-lg p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {stat.label}
            </p>
            <p className="mt-2 font-heading text-4xl uppercase leading-none text-text">
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-muted">{stat.trend}</p>
          </div>
        ))}
      </section>

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

      <section aria-label="Getting started" className="mt-8">
        <div className="panel-border rounded-lg p-6">
          <h2 className="font-heading text-2xl uppercase text-text">Getting started</h2>
          <p className="mt-2 text-sm text-muted">
            The shell and PWA foundation are live. Next up is the Customers + Vehicles vertical
            slice (schema, API, offline reads, queued writes). Once that is proven end-to-end, the
            other modules follow the same pattern.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-muted">
            <li>• Create a Supabase project and add its URL + anon key to <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-text">.env.local</code></li>
            <li>• Run the initial schema migration</li>
            <li>• Sign in as the first shop-owner user</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
