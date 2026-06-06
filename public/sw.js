const CACHE_NAME = 'bingoo-connect-v1';
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests except known CDNs
  const url = new URL(event.request.url);
  const isLocalhost = url.hostname === self.location.hostname;
  const isBase44Media = url.hostname === 'media.base44.com';

  if (!isLocalhost && !isBase44Media) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for same-origin navigation requests
        if (response.ok && isLocalhost) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(() => {
        // Try cache first on failure
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, serve offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'You have a new notification',
    icon: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png',
    badge: 'https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/bingoo' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Bingoo Connect', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/bingoo';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
