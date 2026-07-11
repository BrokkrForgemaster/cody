import type { Metadata } from "next";
import { AuthIntroGate } from "@/components/AuthIntroGate";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthIntroGate>
      <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
        {children}
      </div>
    </AuthIntroGate>
  );
}
