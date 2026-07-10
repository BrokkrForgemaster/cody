import type { Metadata } from "next";
import { ConfiguratorAdminClient } from "@/components/admin/configurator/ConfiguratorAdminClient";

export const metadata: Metadata = {
  title: "Lighting Configurator",
  robots: { index: false, follow: false },
};

export default function AdminConfiguratorPage() {
  return <ConfiguratorAdminClient />;
}
