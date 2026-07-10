import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CustomersList } from "@/components/admin/customers/CustomersList";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default function CustomersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        eyebrow="CRM"
        title="Customers"
        description="All shop customers. Reads run against your local device store — new records sync when online."
      />
      <CustomersList />
    </div>
  );
}
