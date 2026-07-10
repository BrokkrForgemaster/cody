import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EditJob } from "@/components/admin/jobs/EditJob";

export const metadata: Metadata = {
  title: "Edit job",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditJobPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader eyebrow="Workflow" title="Edit job" />
      <div className="panel-border rounded-lg p-6">
        <EditJob id={id} />
      </div>
    </div>
  );
}
