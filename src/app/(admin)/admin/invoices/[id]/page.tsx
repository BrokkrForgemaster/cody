import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InvoiceEditor } from "@/components/admin/invoices/InvoiceEditor";
import { getInvoice, listCustomers } from "../actions";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const [invoice, customers] = await Promise.all([getInvoice(id), listCustomers()]);
  if (!invoice) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminPageHeader eyebrow="Billing" title={invoice.invoice_number} />
      <InvoiceEditor invoice={invoice} customers={customers} />
    </div>
  );
}
