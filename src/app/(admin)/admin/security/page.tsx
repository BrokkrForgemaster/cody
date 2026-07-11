import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MfaSetup } from "@/components/admin/security/MfaSetup";

export const metadata: Metadata = {
  title: "Security",
  robots: { index: false, follow: false },
};

export default function AdminSecurityPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        eyebrow="Account"
        title="Security"
        description="Set up Google Authenticator for admin sign-in."
      />
      <MfaSetup />
    </div>
  );
}
