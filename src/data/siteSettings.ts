// Phase 2: this file maps cleanly to Sanity documents such as siteSettings,
// businessInfo, navigation, and seoSettings.
export const siteSettings = {
  businessName: "Forged Customs",
  shortName: "Forged Customs",
  tagline: "Built Different. Finished Right.",
  logo: {
    src: "/images/forged-customs-logo.svg",
    alt: "Forged Customs logo",
    width: 1200,
    height: 560,
  },
  heroLogo: {
    src: "/images/forged-customs-hero-logo.svg",
    alt: "Forged Customs hero logo",
    width: 1200,
    height: 560,
  },
  logoMark: {
    src: "/favicon.svg",
    alt: "Forged Customs FC monogram",
    width: 64,
    height: 64,
  },
  location: "Central Kentucky",
  phone: "(859) 555-0198",
  email: "quotes@forgedcustoms.demo",
  address: "Central Kentucky",
  hours: [
    { label: "Monday - Friday", value: "8:00 AM - 6:00 PM" },
    { label: "Saturday", value: "By appointment" },
    { label: "Sunday", value: "Closed" },
  ],
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
  googleMapsLink: "https://maps.google.com",
  primaryCta: "Build My Project",
  secondaryCta: "View Featured Builds",
  nav: [
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Products", href: "/products" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ],
  seo: {
    title:
      "Forged Customs | Custom Lighting, Paint Matching & Powder Coating in Central Kentucky",
    description:
      "Premium vehicle customization in Central Kentucky specializing in custom lighting, OEM paint matching, powder coating, and full build transformations.",
  },
};
