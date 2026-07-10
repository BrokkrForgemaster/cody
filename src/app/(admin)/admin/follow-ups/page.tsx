import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FollowUpsView } from "@/components/admin/followUps/FollowUpsView";

export const metadata: Metadata = {
  title: "Follow-ups",
  robots: { index: false, follow: false },
};

export default function FollowUpsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <AdminPageHeader
        eyebrow="Retention"
        title="Follow-ups"
        description="Post-delivery check-ins, review requests, seasonal outreach — grouped by due date."
      />
      <FollowUpsView />
    </div>
  );
}
