import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewCountSessionForm } from "@/components/admin/inventory/NewCountSessionForm";

export const metadata: Metadata = {
  title: "New count session",
  robots: { index: false, follow: false },
};

export default function NewCountPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <AdminPageHeader eyebrow="Stock" title="Open count session" />
      <div className="panel-border rounded-lg p-6">
        <NewCountSessionForm />
      </div>
    </div>
  );
}
