import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JobsBoard } from "@/components/admin/jobs/JobsBoard";

export const metadata: Metadata = {
  title: "Jobs",
  robots: { index: false, follow: false },
};

export default function JobsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        eyebrow="Workflow"
        title="Jobs Board"
        description="Every open job. Click a card to open, or use the button to advance it to the next lane."
      />
      <JobsBoard />
    </div>
  );
}
