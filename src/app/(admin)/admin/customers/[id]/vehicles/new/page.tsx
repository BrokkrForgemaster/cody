import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VehicleForm } from "@/components/admin/customers/VehicleForm";

export const metadata: Metadata = {
  title: "New vehicle",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewVehiclePage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader
        eyebrow="CRM"
        title="Add vehicle"
        description="Attaches to this customer. Saved locally and synced when online."
      />
      <div className="panel-border rounded-lg p-6">
        <VehicleForm customerId={id} mode="create" />
      </div>
    </div>
  );
}
