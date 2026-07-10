import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewQuoteForm } from "@/components/admin/quotes/NewQuoteForm";

export const metadata: Metadata = {
  title: "New quote",
  robots: { index: false, follow: false },
};

export default function NewQuotePage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader
        eyebrow="Sales"
        title="New quote"
        description="Log a lead phoned in, emailed in, or captured in person."
      />
      <div className="panel-border rounded-lg p-6">
        <NewQuoteForm />
      </div>
    </div>
  );
}
