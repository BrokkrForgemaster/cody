import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PartForm } from "@/components/admin/inventory/PartForm";

export const metadata: Metadata = {
  title: "New part",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ barcode?: string }>;
};

export default async function NewPartPage({ searchParams }: Props) {
  const { barcode } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader eyebrow="Stock" title="New part" />
      <div className="panel-border rounded-lg p-6">
        <PartForm mode="create" initialBarcode={barcode} />
      </div>
    </div>
  );
}
