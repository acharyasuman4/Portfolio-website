const CACHE_NAME = "auto-offline-v4"; // <--- IMPORTANT: I changed v3 to v4 to force an update!

const PRECACHE_URLS = [
  "./", 
  // Add other critical files here if you want them guaranteed offline
  // "./style.css", 
];

// Install event
self.addEventListener("install", event => {
  self.skipWaiting(); // Forces this new SW to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

// Activate event: Clean up old caches
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

// --- THE FIX IS HERE ---
// Network First, Fallback to Cache
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // 1. If we are Online, we get a response.
        // 2. We make a copy of it to save in the cache for later.
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        // 3. We show the user the FRESH network data.
        return networkResponse;
      })
      .catch(() => {
        // 4. If Network fails (Offline), we look in the cache.
        return caches.match(event.request);
      })
  );
});
