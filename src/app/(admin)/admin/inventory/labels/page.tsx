import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LabelPrintView } from "@/components/admin/inventory/LabelPrintView";

export const metadata: Metadata = {
  title: "Print labels",
  robots: { index: false, follow: false },
};

export default function LabelsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        eyebrow="Stock"
        title="Print labels"
        description="Multi-select parts, then Print. Sheet is sized for Avery 5160 / 5163 (30 labels per Letter sheet)."
      />
      <LabelPrintView />
    </div>
  );
}
