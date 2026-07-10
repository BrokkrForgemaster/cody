import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InventoryAnalytics } from "@/components/admin/inventory/InventoryAnalytics";
import { InventoryNav } from "@/components/admin/inventory/InventoryNav";

export const metadata: Metadata = {
  title: "Inventory analytics",
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        eyebrow="Stock"
        title="Analytics"
        description="Top movers, dead stock, and total value — driven by the movement ledger."
      />
      <InventoryNav />
      <InventoryAnalytics />
    </div>
  );
}
