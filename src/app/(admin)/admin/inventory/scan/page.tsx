import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ScannerView } from "@/components/admin/inventory/ScannerView";

export const metadata: Metadata = {
  title: "Scan barcode",
  robots: { index: false, follow: false },
};

export default function ScanPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <AdminPageHeader
        eyebrow="Stock"
        title="Scan"
        description="Scan a barcode with the device camera to jump to a part, or type it in manually."
      />
      <ScannerView />
    </div>
  );
}
