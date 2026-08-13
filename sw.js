// १. क्यासको नाम (भविष्यमा अपडेट गर्दा v7 लाई v8 बनाउनुहोस्)
const CACHE_NAME = 'acharyasuman-portal-v7'; 


const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './tailwind.min.js',
  './lucide.min.js',
  './css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;600;700&display=swap',

  // मुख्य टुलहरूका इन्ट्री पोइन्टहरू
  './Registration/index.html',
  './Registration/local_level_old_new/index.html',
  './Registration/valuation_report/index.html',
  './malpot%20calculator/index.html',
  './kutabali%20calculator/index.html',
  './ropani%20adder/index.html',
  './ropani%20divider/index.html',

  // टिप्पणी भित्रका सबै मुख्य टुलहरू (यी अनिवार्य छन्)
  './tippani/index.html',
  './tippani/template.html',
  './tippani/namsari_tippani/index.html',
  './tippani/sansodhan_tippani/index.html',
  './tippani/adalat%20Dakhila%20Kharej/index.html',
  './tippani/seba%20dakhila%20kharej/index.html',
  './tippani/namsari%20suchana%20aades/index.html',
  './tippani/jagga%20darta%20sifaris/index.html',
  './tippani/sansodhan/index.html',
  './tippani/pratilipi_purja/index.html',

  // अन्य टुलहरू
  './tool/index.html',
  './tool/rajaswo_calculator.html',
  './tool/advance_rajaswo_calculator.html'
];


// २. Install Event: फाइलहरू क्यास गर्ने
self.addEventListener('install', (event) => {
  // नयाँ Service Worker भेटिने बित्तिकै सुचारु हुन तयार हुने
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// ३. Activate Event: पुराना क्यासहरू सफा गर्ने
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // तुरुन्तै कन्ट्रोल लिने
  self.clients.claim();
});

// ४. Fetch Event: Stale-While-Revalidate रणनीति
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // अफलाइनमा हुँदा केही नभेटिए यहाँ fallback दिन सकिन्छ
      });

      return cachedResponse || fetchPromise;
    })
  );
});