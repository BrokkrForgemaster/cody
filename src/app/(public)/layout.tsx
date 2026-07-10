import type { Metadata } from "next";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { MobileQuoteBar } from "@/components/MobileQuoteBar";
import { Navbar } from "@/components/Navbar";
import { siteSettings } from "@/data/siteSettings";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  keywords: [
    "Central Kentucky vehicle customization",
    "Lexington KY custom truck lighting",
    "Richmond KY paint matching",
    "Georgetown KY powder coating",
    "Nicholasville KY vehicle customization",
    "Winchester KY custom lighting",
    "custom truck lighting",
    "OEM paint matching",
    "powder coating",
    "truck customization",
    "Jeep lighting",
  ],
  openGraph: {
    title: siteSettings.seo.title,
    description: siteSettings.seo.description,
    url: absoluteUrl(),
    siteName: siteSettings.businessName,
    images: [
      {
        url: siteSettings.logo.src,
        width: siteSettings.logo.width,
        height: siteSettings.logo.height,
        alt: siteSettings.logo.alt,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteSettings.seo.title,
    description: siteSettings.seo.description,
    images: [siteSettings.logo.src],
  },
  alternates: {
    canonical: absoluteUrl(),
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: siteSettings.businessName,
  description: siteSettings.seo.description,
  areaServed: [
    "Central Kentucky",
    "Lexington KY",
    "Richmond KY",
    "Georgetown KY",
    "Nicholasville KY",
    "Winchester KY",
  ],
  telephone: siteSettings.phone,
  email: siteSettings.email,
  url: absoluteUrl(),
  image: absoluteUrl(siteSettings.logo.src),
  logo: absoluteUrl(siteSettings.logo.src),
  makesOffer: [
    "Custom vehicle lighting",
    "OEM paint matching",
    "Powder coating",
    "Truck customization",
  ],
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script
        id="local-business-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <MobileQuoteBar />
    </>
  );
}
