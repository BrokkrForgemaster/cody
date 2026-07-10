import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EditPart } from "@/components/admin/inventory/EditPart";

export const metadata: Metadata = {
  title: "Edit part",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPartPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader eyebrow="Stock" title="Edit part" />
      <div className="panel-border rounded-lg p-6">
        <EditPart id={id} />
      </div>
    </div>
  );
}
