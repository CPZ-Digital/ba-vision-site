const CACHE = 'ba-orcamento-v17';
const ASSETS = [
  './index.html',
  './template-pdf.html',
  './template-contrato.html',
  './cpz-assinatura-v4.png',
  './ba-vision-assinatura-v3.png',
  './cpz-icon.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })
      .catch(() => caches.match(e.request))
  );
});