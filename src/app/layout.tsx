import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteSettings } from "@/data/siteSettings";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: siteSettings.seo.title,
    template: `%s | ${siteSettings.businessName}`,
  },
  description: siteSettings.seo.description,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body className="font-body antialiased">{children}</body>
      </html>
  );
}