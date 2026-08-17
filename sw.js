const CACHE_NAME = 'land-admin-v12'; // Increment this when you change files
const CORE_ASSETS = [
    './',
    './index.html',
    './all.min.css',
    './tailwind.min.js',
    './lucide.min.js',
    './Mukta-Regular.woff2',
    './Mukta-Bold.woff2',
    './manifest.json'
];

// 1. Install - Cache the UI shell immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting(); // Force the new service worker to become active
});

// 2. Activate - Clean up old versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. Fetch Strategy: Cache-First (Fastest for Intranet/Offline)
self.addEventListener('fetch', (event) => {
    // Only handle GET requests (Ignore Feedback form POSTs)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached version immediately if found
            if (cachedResponse) {
                // Background update: Refresh the cache if online
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse);
                        });
                    }
                }).catch(() => { /* Silent fail if offline */ });
                
                return cachedResponse;
            }

            // If not in cache, go to network
            return fetch(event.request).then((networkResponse) => {
                // Cache this new page for next time
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        })
    );
});