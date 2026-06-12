// १. क्यासको नाम (भविष्यमा अपडेट गर्दा v3 लाई v4 बनाउनुहोस्)
const CACHE_NAME = 'acharyasuman-portal-v4'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './Registration/',
  './tippani/template.html',
  './malpot%20calculator/',
  './kutabali%20calculator/',
  './tippani/',
  './ropani%20adder/',
  './tippani/adalat%20Dakhila%20Kharej/',
  './tippani/seba%20dakhila%20kharej/',
  './tippani/namsari%20suchana%20aades/',
  './tippani/namsari_tippani/',
  './tippani/sansodhan/',
  './tippani/sansodhan_tippani/',
  './tippani/jagga%20darta%20sifaris/',
  
  // स्थानीय बनाइएका फाइलहरू (तपाईँले मेन फोल्डरमा राखेका)
  './tailwind.min.js',
  './lucide.min.js',
  
  // बाह्य आवश्यक फाइलहरू
  'https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;600;700&display=swap',
  'https://unpkg.com/lucide@latest'
];

// २. Install Event: फाइलहरू प्रि-क्यास गर्ने
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// ३. Activate Event: पुराना क्यासहरू मेटाउने
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

// ४. Fetch Event: Stale-While-Revalidate रणनीति (Fast + Always Updating)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // क्यासबाट तुरुन्तै रेस्पोन्स दिने (यदि छ भने)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        
        // सुरक्षा जाँच: सफल रेस्पोन्स र रिडाइरेक्ट नभएको हुनुपर्छ (Intranet Blocker सुरक्षा)
        if (networkResponse && networkResponse.status === 200 && !networkResponse.redirected) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // यदि नेटवर्क छैन भने मौन रहने (Silent error)
      });

      // क्यास छ भने तुरुन्तै दिने, छैन भने मात्र नेटवर्क पर्खने
      return cachedResponse || fetchPromise;
    })
  );
});