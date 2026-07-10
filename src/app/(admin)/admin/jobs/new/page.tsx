import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JobForm } from "@/components/admin/jobs/JobForm";

export const metadata: Metadata = {
  title: "New job",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ customer?: string; vehicle?: string }>;
};

export default async function NewJobPage({ searchParams }: Props) {
  const { customer, vehicle } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader
        eyebrow="Workflow"
        title="New job"
        description="Saved locally first, synced when online. Lands in the New lane by default."
      />
      <div className="panel-border rounded-lg p-6">
        <JobForm
          mode="create"
          initialCustomerId={customer}
          initialVehicleId={vehicle}
        />
      </div>
    </div>
  );
}
