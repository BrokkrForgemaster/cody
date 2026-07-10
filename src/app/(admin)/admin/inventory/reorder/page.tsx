import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InventoryNav } from "@/components/admin/inventory/InventoryNav";
import { ReorderDashboard } from "@/components/admin/inventory/ReorderDashboard";

export const metadata: Metadata = {
  title: "Reorder",
  robots: { index: false, follow: false },
};

export default function ReorderPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        eyebrow="Stock"
        title="Reorder"
        description="Every SKU below its minimum, grouped by vendor, with a suggested order-to-par quantity."
      />
      <InventoryNav />
      <ReorderDashboard />
    </div>
  );
}
