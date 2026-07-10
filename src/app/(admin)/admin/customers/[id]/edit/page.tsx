import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EditCustomer } from "@/components/admin/customers/EditCustomer";

export const metadata: Metadata = {
  title: "Edit customer",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-3xl">
      <AdminPageHeader eyebrow="CRM" title="Edit customer" />
      <div className="panel-border rounded-lg p-6">
        <EditCustomer id={id} />
      </div>
    </div>
  );
}
