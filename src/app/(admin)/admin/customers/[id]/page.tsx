import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CustomerDetail } from "@/components/admin/customers/CustomerDetail";

export const metadata: Metadata = {
  title: "Customer",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader eyebrow="CRM" title="Customer" />
      <CustomerDetail id={id} />
    </div>
  );
}
