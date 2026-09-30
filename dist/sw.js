// Devbhumi AI Media Studio — Service Worker
// App-shell: cache-first. API/media: network-first with fallback.

const CACHE_VERSION = 'devbhumi-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache the n8n generation webhook or cross-origin media blobs.
  if (url.pathname.includes('/generate-ai-media') || url.pathname.startsWith('/blob:')) {
    return;
  }

  // Same-origin navigation → cache-first, fall back to network.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) =>
        cached || fetch(request).catch(() => caches.match('/index.html'))
      )
    );
    return;
  }

  // Same-origin static assets → cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          return resp;
        }).catch(() => cached)
      )
    );
    return;
  }

  // Cross-origin (e.g. generated media URLs) → network-first, cache fallback.
  event.respondWith(
    fetch(request).then((resp) => {
      if (resp.ok && resp.type === 'basic') {
        const copy = resp.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
      }
      return resp;
    }).catch(() => caches.match(request))
  );
});
