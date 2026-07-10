import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JobDetail } from "@/components/admin/jobs/JobDetail";

export const metadata: Metadata = {
  title: "Job",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader eyebrow="Workflow" title="Job" />
      <JobDetail id={id} />
    </div>
  );
}
