// Intentionally does nothing but exist and control the page — Chromium's installability check
// (the thing that decides whether to ever fire `beforeinstallprompt`, see use-install-prompt.ts)
// requires an active service worker with a fetch handler. No caching, no offline support: every
// request just falls straight through to the network, so this can never serve stale content.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => event.respondWith(fetch(event.request)));
