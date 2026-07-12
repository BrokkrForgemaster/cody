/// <reference lib="webworker" />
export {};

declare const self: ServiceWorkerGlobalScope;

// Development no-op: take over immediately, intercept nothing.
// Displaces any stale production SW without blocking requests.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
