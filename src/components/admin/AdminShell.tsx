"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { SyncBoot } from "./SyncBoot";

type AdminShellProps = {
  children: React.ReactNode;
  userInitials: string;
  userEmail: string;
};

export function AdminShell({ children, userInitials, userEmail }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text">
      <SyncBoot />
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="lg:pl-64">
        <AdminTopBar
          onMenuClick={() => setMobileNavOpen(true)}
          userInitials={userInitials}
          userEmail={userEmail}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
