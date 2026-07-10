import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CountSessionView } from "@/components/admin/inventory/CountSessionView";

export const metadata: Metadata = {
  title: "Count session",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CountSessionPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminPageHeader eyebrow="Stock" title="Count session" />
      <CountSessionView id={id} />
    </div>
  );
}
