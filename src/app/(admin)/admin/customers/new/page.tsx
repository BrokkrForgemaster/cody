import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CustomerForm } from "@/components/admin/customers/CustomerForm";

export const metadata: Metadata = {
  title: "New customer",
  robots: { index: false, follow: false },
};

export default function NewCustomerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <AdminPageHeader
        eyebrow="CRM"
        title="New customer"
        description="Saved locally first, then synced to the shop database."
      />
      <div className="panel-border rounded-lg p-6">
        <CustomerForm mode="create" />
      </div>
    </div>
  );
}
