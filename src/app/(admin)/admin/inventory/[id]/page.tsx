import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PartDetail } from "@/components/admin/inventory/PartDetail";

export const metadata: Metadata = {
  title: "Part",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PartDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminPageHeader eyebrow="Stock" title="Part" />
      <PartDetail id={id} />
    </div>
  );
}
