// Service worker da Central de Documentos (guarda a página e o pacote criptografado para funcionar offline)
const CACHE = 'ba-docs-d98836b510';
const ASSETS = ['./', 'index.html', 'app.enc?v=d98836b510', 'html2pdf.bundle.min.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // só arquivos do próprio site; chamadas ao Supabase (dados de clientes) nunca passam pelo cache
  if (new URL(e.request.url).origin !== self.location.origin) return;
  // rede primeiro (pega sempre a versão nova); sem rede, usa o que está guardado
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
