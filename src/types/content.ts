export type ImageAsset = {
  src: string;
  alt: string;
  caption?: string;
};

export type SeoFields = {
  title: string;
  description: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  serviceSlug?: string;
};

export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  href: string;
  summary: string;
  description: string;
  heroImage: ImageAsset;
  panelImage: ImageAsset;
  offerings: string[];
  process: string[];
  gallery: ImageAsset[];
  faqs: FaqItem[];
  seo: SeoFields;
};

export type Project = {
  slug: string;
  title: string;
  vehicle: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  location: string;
  heroImage: string;
  imageAlt: string;
  services: string[];
  summary: string;
  goals: string[];
  process: string[];
  results: string[];
  gallery: ImageAsset[];
  seo: SeoFields;
};

export type GalleryImage = ImageAsset & {
  id: string;
  category: string;
  tags: string[];
  featured?: boolean;
};

export type Testimonial = {
  id: string;
  customerName: string;
  city: string;
  review: string;
  rating: number;
  vehicle: string;
  photo?: string;
  videoLink?: string;
};

export type Vendor = {
  id: string;
  name: string;
  leadTime: string;
  shippingOrigin: string;
  supportNotes: string;
  website?: string;
  installationGuideUrl?: string;
  authorizedUseNote?: string;
};

export type ProductShipMode = "customer" | "shop-install";

export type Product = {
  slug: string;
  title: string;
  category: string;
  vendorId: string;
  image: ImageAsset;
  price: string;
  installEstimate: string;
  summary: string;
  description: string;
  compatibleVehicles: string[];
  badges: string[];
  shipModes: ProductShipMode[];
  installGuideUrl?: string;
  options: Array<{
    label: string;
    values: string[];
  }>;
  seo: SeoFields;
};
