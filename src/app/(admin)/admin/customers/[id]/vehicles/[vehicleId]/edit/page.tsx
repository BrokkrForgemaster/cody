import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EditVehicle } from "@/components/admin/customers/EditVehicle";

export const metadata: Metadata = {
  title: "Edit vehicle",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string; vehicleId: string }>;
};

export default async function EditVehiclePage({ params }: Props) {
  const { id, vehicleId } = await params;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader eyebrow="CRM" title="Edit vehicle" />
      <div className="panel-border rounded-lg p-6">
        <EditVehicle customerId={id} vehicleId={vehicleId} />
      </div>
    </div>
  );
}
