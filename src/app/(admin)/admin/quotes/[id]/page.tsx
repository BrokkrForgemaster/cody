import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { QuoteDetail } from "@/components/admin/quotes/QuoteDetail";

export const metadata: Metadata = {
  title: "Quote",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader eyebrow="Sales" title="Quote" />
      <QuoteDetail id={id} />
    </div>
  );
}
