const CACHE = 'game-armn-v32';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', ...Array.from({length:15}, (_,i) => `./avatars/avatar-${String(i+1).padStart(2,'0')}.webp`)];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const isPage = req.mode === 'navigate' || /\.(html|js|css|webmanifest)$/.test(new URL(req.url).pathname) || new URL(req.url).pathname.endsWith('/');
  const store = res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  if (isPage) {
    /* network-first so players always get the newest game; cache only when offline */
    event.respondWith(fetch(req).then(store).catch(() => caches.match(req).then(h => h || caches.match('./index.html'))));
  } else {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(store).catch(() => caches.match('./index.html'))));
  }
});
