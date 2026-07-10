import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PurchaseOrderDetail } from "@/components/admin/inventory/PurchaseOrderDetail";

export const metadata: Metadata = {
  title: "Purchase order",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PurchaseOrderPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminPageHeader eyebrow="Stock" title="Purchase order" />
      <PurchaseOrderDetail id={id} />
    </div>
  );
}
