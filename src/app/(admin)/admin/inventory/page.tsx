import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PartsList } from "@/components/admin/inventory/PartsList";

export const metadata: Metadata = {
  title: "Inventory",
  robots: { index: false, follow: false },
};

export default function InventoryPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        eyebrow="Stock"
        title="Inventory"
        description="Parts master with cost, price, on-hand, min/par, vendor. Scan a barcode to jump to a part."
      />
      <PartsList />
    </div>
  );
}
