/// Service Worker for رحلة في السيرة PWA
const CACHE_NAME = "rihla-seerah-v2";
const STATIC_ASSETS = [
  "/shamsah-favicon-64.png",
  "/shamsah-icon-1024.png",
  "/shamsah-icon.svg",
  "/thumbnail.jpg",
];

// Install: Pre-cache critical image assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept localhost / development requests
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return;
  }

  // Only handle same-origin GET requests
  if (url.origin !== location.origin || request.method !== "GET") return;

  // Next.js internal chunks and hot reload: always fetch from network
  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  // Navigation requests (HTML pages): Network-first with fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static images & fonts: Cache-first
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2?|ttf|otf)$/)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }
});
