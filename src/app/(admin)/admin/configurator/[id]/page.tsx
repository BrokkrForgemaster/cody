import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfigurationBuilder } from "@/components/admin/configurator/ConfigurationBuilder";

export const metadata: Metadata = {
  title: "Build sheet",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ConfigurationDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <AdminPageHeader eyebrow="Sales" title="Build sheet" />
      <ConfigurationBuilder id={id} />
    </div>
  );
}
