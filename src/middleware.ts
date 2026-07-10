import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on everything except static assets, images, and the service worker.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|images|icons|sw.js|workbox-.*|manifest.webmanifest|robots.txt|sitemap.xml).*)",
  ],
};
