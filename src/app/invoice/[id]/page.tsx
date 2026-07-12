import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { siteSettings } from "@/data/siteSettings";
import type { Invoice, InvoiceLineItem } from "@/lib/supabase/types";
import { PrintBar } from "./PrintBar";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase.from("invoices").select("invoice_number").eq("id", id).single();
  return {
    title: data ? `${data.invoice_number} — ${siteSettings.businessName}` : "Invoice",
    robots: { index: false, follow: false },
  };
}

function currency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PublicInvoicePage({ params }: Props) {
  const { id } = await params;
  const supabase = getSupabaseServiceClient();

  const { data: invRaw } = await supabase
    .from("invoices")
    .select("*, customers(first_name, last_name, email, phone), vehicles(year, make, model, trim)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!invRaw) notFound();

  const { customers, vehicles, ...inv } = invRaw as Invoice & {
    customers: { first_name: string; last_name: string; email: string | null; phone: string | null } | null;
    vehicles: { year: number; make: string; model: string; trim: string | null } | null;
  };

  const { data: lineItems } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", id)
    .order("sort_order");

  const items = (lineItems ?? []) as InvoiceLineItem[];
  const customerName = customers
    ? `${customers.first_name} ${customers.last_name}`.trim()
    : null;
  const vehicleDesc = vehicles
    ? `${vehicles.year} ${vehicles.make} ${vehicles.model}${vehicles.trim ? ` ${vehicles.trim}` : ""}`
    : null;

  const isDraft = inv.status === "draft";
  const isVoid = inv.status === "void";

  return (
    <>
      <PrintBar invoiceNumber={inv.invoice_number} />

      <main className="mx-auto min-h-screen max-w-3xl bg-white px-8 py-12 text-gray-900 print:px-0 print:py-0">
        {(isDraft || isVoid) && (
          <div className="mb-6 rounded border border-gray-300 bg-gray-100 px-4 py-2 text-center text-sm font-semibold uppercase tracking-widest text-gray-500">
            {inv.status}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight">{siteSettings.businessName}</p>
            <p className="mt-0.5 text-sm text-gray-500">{siteSettings.address}</p>
            <p className="text-sm text-gray-500">{siteSettings.phone}</p>
            <p className="text-sm text-gray-500">{siteSettings.email}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-bold">{inv.invoice_number}</p>
            <p className="mt-1 text-sm text-gray-500">
              Issued: {fmtDate(inv.issue_date)}
            </p>
            {inv.due_date && (
              <p className="text-sm text-gray-500">Due: {fmtDate(inv.due_date)}</p>
            )}
            {inv.paid_on && (
              <p className="mt-1 text-sm font-semibold text-green-700">
                Paid {fmtDate(inv.paid_on)}
              </p>
            )}
          </div>
        </div>

        {/* Bill to */}
        {(customerName || vehicleDesc) && (
          <div className="mt-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Bill to
            </p>
            {customerName && <p className="font-semibold">{customerName}</p>}
            {customers?.email && <p className="text-sm text-gray-600">{customers.email}</p>}
            {customers?.phone && <p className="text-sm text-gray-600">{customers.phone}</p>}
            {vehicleDesc && (
              <p className="mt-1 text-sm text-gray-600">Vehicle: {vehicleDesc}</p>
            )}
          </div>
        )}

        {/* Line items */}
        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Unit price</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 pr-4">{item.description}</td>
                <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                <td className="py-2 text-right text-gray-600">
                  {currency(item.unit_price_cents)}
                </td>
                <td className="py-2 text-right font-semibold">
                  {currency(item.amount_cents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <dl className="w-64 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <dt>Subtotal</dt>
              <dd>{currency(inv.subtotal_cents)}</dd>
            </div>
            {inv.shop_fee_cents > 0 && (
              <div className="flex justify-between text-gray-600">
                <dt>{inv.shop_fee_label}</dt>
                <dd>{currency(inv.shop_fee_cents)}</dd>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <dt>Tax ({(inv.tax_rate_bps / 100).toFixed(2)}%)</dt>
              <dd>{currency(inv.tax_cents)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
              <dt>Total</dt>
              <dd>{currency(inv.total_cents)}</dd>
            </div>
          </dl>
        </div>

        {/* Customer notes */}
        {inv.notes && (
          <div className="mt-8 rounded border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Notes
            </p>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{inv.notes}</p>
          </div>
        )}

        <p className="mt-12 text-center text-xs text-gray-400">
          Thank you for your business — {siteSettings.businessName}
        </p>
      </main>
    </>
  );
}
