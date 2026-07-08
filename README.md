# Forged Customs Demo

Premium Next.js website demo for a Central Kentucky automotive customization business specializing in custom lighting, OEM paint matching, powder coating, and full vehicle transformations.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Local placeholder image assets
- Static TypeScript data structured for future Sanity CMS integration

## Routes

- `/`
- `/services`
- `/services/custom-lighting`
- `/services/paint-matching`
- `/services/powder-coating`
- `/projects`
- `/projects/[slug]`
- `/products`
- `/products/[slug]`
- `/gallery`
- `/about`
- `/faq`
- `/quote`

## Content Structure

Editable demo content lives in:

- `src/data/siteSettings.ts`
- `src/data/homePage.ts`
- `src/data/services.ts`
- `src/data/projects.ts`
- `src/data/products.ts`
- `src/data/gallery.ts`
- `src/data/testimonials.ts`
- `src/data/faq.ts`

These files are shaped like future CMS collections, so Sanity can replace static imports later.

## Replace AI Images

Current local assets live in `public/images`.

To replace an image:

1. Add the new image to `public/images`.
2. Update the matching `src` value in `src/data`.
3. Keep alt text specific to the vehicle, service, or gallery item.

Image prompt references are documented in `AI_IMAGE_PROMPTS.md`.

## Edit Projects

Project data lives in `src/data/projects.ts`.

Each project includes:

- `slug`
- `title`
- `vehicle`
- `location`
- `heroImage`
- `services`
- `summary`
- `goals`
- `process`
- `results`
- `gallery`
- `seo`

The dynamic route `/projects/[slug]` reads from that data.

## Edit Products

Product data lives in `src/data/products.ts`.

The current catalog is a prototype for product-only orders, ship-to-shop install routing, vendor lead times, fitment notes, and quote-required fabrication requests. Production should connect this to Shopify or Stripe Checkout for payments, tax, shipping, and order emails.

The demo includes AlphaRex and Morimoto as external supplier references with links to their official installation guide resources. It does not copy supplier images, logos, PDFs, or guide content. Real supplier media should only be added after dealer approval, supplier permission, or customer-provided usage rights.

## Edit Services

Service data lives in `src/data/services.ts`.

Each service includes page copy, hero image, panel image, offerings, process steps, gallery images, FAQs, and SEO metadata.

## Production Prep

See `PHASE_2_CMS_PLAN.md` for the Sanity CMS conversion plan.

Recommended production stack:

- Frontend: Next.js on Vercel
- CMS: Sanity Studio
- Commerce: Shopify or Stripe Checkout
- 3D: Three.js / React Three Fiber with headlight-specific GLB assets
- Media: Sanity Images or Cloudinary
- Forms: `/api/quote` with Resend, SendGrid, or Google Workspace
- Analytics: Google Analytics 4 and Google Search Console
- Local SEO: Google Business Profile content plan
- Deployment: GitHub to Vercel automatic deploys

## SEO Notes

The app includes route metadata, Open Graph defaults, local business JSON-LD, `robots.ts`, and `sitemap.ts`. Copy naturally targets Central Kentucky, Lexington KY, Richmond KY, Georgetown KY, Nicholasville KY, Winchester KY, custom truck lighting, paint matching, powder coating, and vehicle customization.
