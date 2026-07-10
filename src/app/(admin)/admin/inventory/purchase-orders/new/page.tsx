import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewPurchaseOrderForm } from "@/components/admin/inventory/NewPurchaseOrderForm";

export const metadata: Metadata = {
  title: "New PO",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ vendor?: string }>;
};

export default async function NewPurchaseOrderPage({ searchParams }: Props) {
  const { vendor } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminPageHeader eyebrow="Stock" title="New purchase order" />
      <div className="panel-border rounded-lg p-6">
        <NewPurchaseOrderForm initialVendor={vendor} />
      </div>
    </div>
  );
}
