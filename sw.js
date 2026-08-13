// १. क्यासको नाम (भविष्यमा अपडेट गर्दा v7 लाई v8 बनाउनुहोस्)
const CACHE_NAME = 'land-admin-v9';


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



self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // एउटा-एउटा गर्दै क्यास गर्ने ताकि एउटा बिग्रिए अरु नरोकियुन्
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map(key => { if(key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
  self.clients.claim();
});

// Cache-First Strategy: अफलाइनको लागि सबैभन्दा भरपर्दो
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // यदि अफलाइन छ र क्यासमा पनि छैन भने
      return new Response("Offline resource not found");
    })
  );
});