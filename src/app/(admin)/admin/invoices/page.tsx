import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createInvoice, listInvoices } from "./actions";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

export const metadata: Metadata = {
  title: "Invoices",
  robots: { index: false, follow: false },
};

async function handleCreate() {
  "use server";
  const id = await createInvoice();
  redirect(`/admin/invoices/${id}`);
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

export default async function InvoicesPage() {
  const invoices = await listInvoices();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Create, send, and track invoices for completed jobs."
      />

      <div className="flex justify-end">
        <form action={handleCreate}>
          <button type="submit" className="cta-primary text-xs">
            <Plus size={14} aria-hidden />
            New invoice
          </button>
        </form>
      </div>

      {invoices.length === 0 ? (
        <div className="panel-border mt-4 rounded-lg p-10 text-center text-sm text-muted">
          No invoices yet. Click &ldquo;New invoice&rdquo; to create your first one.
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {invoices.map((inv) => {
                const name = [inv.customer_first_name, inv.customer_last_name]
                  .filter(Boolean)
                  .join(" ");
                const isOverdue =
                  inv.status === "sent" &&
                  inv.due_date != null &&
                  inv.due_date < new Date().toISOString().slice(0, 10);

                return (
                  <tr
                    key={inv.id}
                    className="transition hover:bg-white/5"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-text">
                      <Link
                        href={`/admin/invoices/${inv.id}`}
                        className="hover:text-blue-accent"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text">{name || <span className="text-muted">—</span>}</td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(inv.issue_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className={`px-4 py-3 ${isOverdue ? "text-accent" : "text-muted"}`}>
                      {inv.due_date
                        ? new Date(inv.due_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : <span className="text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-text">
                      {fmt(inv.total_cents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
