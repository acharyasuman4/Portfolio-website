const CACHE_NAME = "auto-offline-v3"; // change this if you make big updates

// Optional: list of core files to pre-cache
const PRECACHE_URLS = [
  "/",          // index.html
  "/style.css", // example CSS
  "/app.js",    // example JS
  // add more static files as needed
];

// Install event: pre-cache core files
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

// Activate event: remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event: offline-first with automatic cache update
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          // Update cache in background
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => {
          // If network fails, return cached version
          return cachedResponse;
        });

      // If cached version exists, return it immediately
      return cachedResponse || fetchPromise;
    })
  );
});
