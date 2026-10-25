// Abyss Bistro service worker: rete prima, cache come riserva (così gli aggiornamenti arrivano subito e il gioco va anche offline).
const CACHE = 'abyss-bistro-v7';
const CORE = ['./', './index.html', './manifest.json', './css/style.css', './js/core.js', './js/data.js', './js/art.js', './js/world.js', './js/game.js', './js/ui.js', './js/cards.js', './js/tutorial.js', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
