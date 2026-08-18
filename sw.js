const CACHE_NAME = 'land-admin-v13';

// IMPORTANT: You must list every subpage here to make them work offline
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './all.min.css',
    './tailwind.min.js',
    './lucide.min.js',
    './Mukta-Regular.woff2',
    './Mukta-Bold.woff2',
    './manifest.json',
    
    // Tools & Calculators
    './malpot calculator/index.html',
    './kutabali calculator/index.html',
    './ropani adder/index.html',
    './ropani divider/index.html',
    './registration/index.html',
    './registration/local_level_old_new/index.html',
    './registration/valuation_report/index.html',
    './tool/index.html',
    './tool/rajaswo_calculator.html',
    './tool/advance_rajaswo_calculator.html',

    // Tippani (Decisions) Templates
    './tippani/index.html',
    './tippani/namsari_tippani/index.html',
    './tippani/namsari suchana aades/index.html',
    './tippani/adalat Dakhila Kharej/index.html',
    './tippani/seba dakhila kharej/index.html',
    './tippani/jagga darta sifaris/index.html',
    './tippani/sansodhan_tippani/index.html',
    './tippani/sansodhan/index.html'
];

// Install: Cache everything immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching all assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Don't activate yet, wait for the user to click "Update"
});

// Activate: Cleanup old caches
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

// STRICT CACHE-FIRST FETCH
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // If found in cache, return it IMMEDIATELY and STOP. 
            // Do NOT call fetch() here.
            if (cachedResponse) {
                return cachedResponse;
            }

            // If NOT in cache, only then try the network
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});

// Listen for the "SKIP_WAITING" message from the Update Button
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});