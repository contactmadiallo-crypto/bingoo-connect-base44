const CACHE_NAME = 'bingoo-pwa-v1';

// Never cache vite dev server chunks or source files
const DEV_PATTERNS = [
  '/node_modules/.vite',
  '/@vite',
  '/@react-refresh',
  '/src/',
];

function isDevChunk(url) {
  return DEV_PATTERNS.some(p => url.includes(p));
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Never intercept dev chunks, non-GET, or cross-origin requests
  if (
    event.request.method !== 'GET' ||
    isDevChunk(url) ||
    url.includes('.js') ||
    url.includes('.jsx') ||
    url.includes('.css') ||
    !url.startsWith(self.location.origin)
  ) {
    return; // fall through to network
  }

  // Only cache navigation requests (HTML pages) and static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
      return cached || networkFetch;
    })
  );
});
