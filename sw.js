// १. क्यासको नाम (भविष्यमा अपडेट गर्दा v1 लाई v2 बनाउनुहोस्)
const CACHE_NAME = 'acharyasuman-portal-v3'; // <--- नयाँ अपडेटका लागि v2 बनाइएको छ

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './Registration/',
  './tippani/template.html',
  './malpot%20calculator/',                     // स्पेस भएको हुनाले %20 राखिएको
  './kutabali%20calculator/',                   // स्पेस भएको हुनाले %20 राखिएको
  './tippani/',
  './ropani%20adder/',                           // स्पेस भएको हुनाले %20 राखिएको
  './tippani/adalat%20Dakhila%20Kharej/',        // स्पेस भएको हुनाले %20 राखिएको
  './tippani/seba%20dakhila%20kharej/',          // स्पेस भएको हुनाले %20 राखिएको
  './tippani/namsari%20suchana%20aades/',        // स्पेस भएको हुनाले %20 राखिएको
  './tippani/namsari_tippani/',
  './tippani/sansodhan/',
  './tippani/sansodhan_tippani/',
  './tippani/jagga%20darta%20sifaris/',          // स्पेस भएको हुनाले %20 राखिएको
  
  // बाह्य आवश्यक फाइलहरू (CDNs)
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Mukta:wght=300;400;600;700&display=swap',
  'https://unpkg.com/lucide@latest'
];

// ३. Install Event: वेबसाइट पहिलो पटक खोल्दा माथिका फाइलहरू सेभ गर्ने
self.addEventListener('install', (event) => {
  self.skipWaiting(); // नयाँ अपडेट आउने बित्तिकै तुरुन्तै एक्टिभ गर्ने
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('केही फाइलहरू प्रि-क्यास हुन सकेनन्, यिनीहरू पछि डाइनामिकली क्यास हुनेछन्:', err);
      });
    })
  );
});

// ४. Activate Event: पुराना क्यास फाइलहरू सफा गर्ने
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('पुरानो क्यास फाइल हटाइयो:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // सबै ट्याबहरूमा नयाँ सर्विस वर्कर तुरुन्तै लागू गर्ने
});

// Fetch Event: नेटवर्क-फर्स्ट रणनीति (इन्ट्रानेट सुरक्षित बनाइएको)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // सुरक्षार्थ थपिएको:
        // १. रेस्पोन्स सफल (status === 200) हुनुपर्छ।
        // २. रेस्पोन्स रिडाइरेक्ट भएको हुनुहुँदैन (!networkResponse.redirected)।
        // (यसले इन्ट्रानेटको ब्लक वा लगइन पेजलाई झुक्किएर क्यास हुन दिँदैन)
        if (networkResponse && networkResponse.status === 200 && !networkResponse.redirected) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // यदि इन्ट्रानेटले गर्दा वेवसाइट कनेक्ट हुन सकेन भने सिधै क्यास फाइल देखाउने
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // अफलाइन भएको सन्देश...
          if (event.request.headers.get('accept').includes('text/html')) {
            return new Response(
              `<div style="font-family: 'Mukta', sans-serif; text-align: center; padding: 50px; color: #333;">
                <h2>तपाईं अहिले अफलाइन हुनुहुन्छ!</h2>
                <p>यो सामग्री पहिले लोड नभएको हुनाले अहिले उपलब्ध गराउन सकिएन। कृपया इन्टरनेट जडान जाँच गर्नुहोस्।</p>
              </div>`,
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'text/html; charset=utf-8' })
              }
            );
          }
        });
      })
  );
});