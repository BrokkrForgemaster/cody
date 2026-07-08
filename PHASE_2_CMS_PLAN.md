# Phase 2 Sanity CMS Plan

The demo is intentionally built with static TypeScript data in `src/data`. Production can replace those imports with Sanity queries without changing the design system.

## Production Tasks

1. Add Sanity Studio.
2. Create schemas for `siteSettings`, `homePage`, `services`, `projects`, `galleryImages`, `testimonials`, `faqItems`, `teamMembers`, `businessInfo`, and `seoSettings`.
3. Replace static data imports with Sanity queries.
4. Add Sanity Images or Cloudinary for uploads, focal points, crop metadata, and alt text.
5. Add draft preview mode in Next.js.
6. Add role-based CMS access for owner, editor, and developer.
7. Train the customer on content updates.
8. Add a backup/export process for CMS content and media.
9. Deploy Sanity Studio and the Next.js website.
10. Connect domain, Google Analytics 4, Google Search Console, and local SEO tracking.

## Quote Request System

Production should add `/api/quote` and send each request to:

- Business email through Resend, SendGrid, or Google Workspace.
- Optional CRM.
- Optional Google Sheet.
- Optional customer confirmation email.

Each request should include contact info, vehicle info, selected services, budget range, timeline, project description, and uploaded photos.

## Customer Can Update

- New completed build.
- New project images.
- New before/after images.
- Service descriptions.
- Special promotions.
- Homepage featured vehicles.
- Business hours.
- FAQ answers.
- Reviews and testimonials.

## Customer Should Not Edit

- Code.
- Layout components.
- Animation logic.
- Navigation structure unless intentionally exposed.
- Color system.
- Font system.
- Form logic.

## Image Management

Recommended image categories:

```txt
Lighting
Paint Matching
Powder Coating
Truck
Jeep
SUV
Car
Night Shot
Detail Shot
Before
After
Shop
Team
```

Customers should be able to upload from phone or computer, add alt text, crop or select focal point, assign images to projects, assign before/after labels, and mark images as featured.

## Customer Training Guide

Customer can update:

- Add a completed build.
- Upload project photos.
- Update homepage featured builds.
- Add a customer review.
- Edit FAQs.
- Update hours and contact info.

Customer should avoid:

- Uploading blurry photos.
- Uploading screenshots instead of photos.
- Using inconsistent captions.
- Writing very long paragraphs.
- Adding low-quality images to the homepage.
