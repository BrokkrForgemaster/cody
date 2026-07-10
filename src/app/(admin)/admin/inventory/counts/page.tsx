import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CountSessionsList } from "@/components/admin/inventory/CountSessionsList";

export const metadata: Metadata = {
  title: "Count sessions",
  robots: { index: false, follow: false },
};

export default function CountsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader
        eyebrow="Stock"
        title="Cycle counts"
        description="Open a session, scan or add parts, enter actual counts. Committing generates adjustments for any variance."
      />
      <CountSessionsList />
    </div>
  );
}
