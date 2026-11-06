
const CACHE = 'tuner-pro-v2';
const LOCAL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const TAILWIND = 'https://cdn.tailwindcss.com';
 
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(LOCAL);
    // Tailwind arriva da un altro dominio: va salvato a parte
    try {
      const res = await fetch(new Request(TAILWIND, { mode: 'no-cors' }));
      await cache.put(TAILWIND, res);
    } catch (e) {}
  })());
  self.skipWaiting();
});
 
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
 
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      if (res && (res.ok || res.type === 'opaque')) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, res.clone());
      }
      return res;
    } catch (e) {
      if (event.request.mode === 'navigate') return caches.match('./index.html');
      throw e;
    }
  })());
});
 