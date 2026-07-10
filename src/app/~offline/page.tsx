"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Navigation fallback served by the service worker (see src/app/sw.ts) when a
 * document request can't be fulfilled from the network or the runtime cache —
 * i.e. a cold offline start on a route that was never opened while online.
 * Routes visited online are cached and served directly, so this is the
 * safety net for everything else. Retrying once connectivity returns loads
 * the real page.
 */
export default function OfflineFallback() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center text-text">
      <div className="max-w-md space-y-4">
        <div className="mx-auto grid size-14 place-items-center rounded-full border border-cfg-orange/40 bg-cfg-orange/10 text-cfg-orange">
          <WifiOff size={24} aria-hidden />
        </div>
        <h1 className="text-xl font-semibold">This screen isn&apos;t cached yet</h1>
        <p className="text-sm text-muted">
          You&apos;re offline and this page hasn&apos;t been opened on this device
          before. Sections you&apos;ve already visited keep working without a
          connection — head back to the dashboard, or retry once you&apos;re back
          online.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/admin"
            className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-text transition hover:border-blue-accent"
          >
            Go to dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            disabled={!online}
            className="rounded-md bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {online ? "Retry" : "Waiting for connection…"}
          </button>
        </div>
      </div>
    </div>
  );
}
