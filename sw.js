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

const CACHE_NAME = 'malpot-guthicalc-v1';

// Resources to cache immediately when the app is first opened online
const ASSETS_TO_CACHE = [
  '/',                          // Home/Index page
  '/malpot-calculator',         // This calculator page (adjust URL if different)
  '/ropani adder/',             // The page loaded inside your iframe
  
  // External CDN assets
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Mukta:wght=300;400;600;700&display=swap',
  'https://unpkg.com/lucide@latest'
];

// 1. Install Event: Prepare cache and store initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll to cache vital static resources
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Some static assets failed to precache during install. They will be fetched and cached dynamically.', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches if updated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Intercept network requests
// Strategy: Network-first falling back to Cache, but caching successful new requests dynamically
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If the response is valid, clone it and put it in cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If the network fails (offline), try to serve from local cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback if resource is completely missing from cache
          return new Response('You are offline, and this resource was not cached yet.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/html' })
          });
        });
      })
  );
});