import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InventoryNav } from "@/components/admin/inventory/InventoryNav";
import { PurchaseOrdersList } from "@/components/admin/inventory/PurchaseOrdersList";

export const metadata: Metadata = {
  title: "Purchase orders",
  robots: { index: false, follow: false },
};

export default function PurchaseOrdersPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminPageHeader
        eyebrow="Stock"
        title="Purchase orders"
        description="Paper trail for what's on order. Prefill from low-stock, receive against a PO to auto-log stock."
      />
      <InventoryNav />
      <PurchaseOrdersList />
    </div>
  );
}
