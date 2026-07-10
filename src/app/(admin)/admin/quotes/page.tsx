import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { QuotesList } from "@/components/admin/quotes/QuotesList";

export const metadata: Metadata = {
  title: "Quotes",
  robots: { index: false, follow: false },
};

export default function QuotesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        eyebrow="Sales"
        title="Quotes"
        description="Inbound from the public /quote form and quotes you create in-shop."
      />
      <QuotesList />
    </div>
  );
}
