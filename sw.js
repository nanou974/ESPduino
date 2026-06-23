// Service Worker pour ESPduino
const CACHE_NAME = 'espduino-v1';
const urlsToCache = [
  'https://nanou974.github.io/ESPduino/',
  'https://nanou974.github.io/ESPduino/index.html',
  'https://nanou974.github.io/ESPduino/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2'
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Si certaines URLs échouent, on continue quand même
        return cache.addAll(urlsToCache.filter(url => !url.includes('cdnjs')));
      });
    })
  );
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('https://nanou974.github.io/ESPduino/index.html');
      });
    })
  );
});
