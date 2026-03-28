const CACHE_NAME = "timm-recipes-cache-v22"; // <- bei Updates hochzählen
const OFFLINE_URLS = [
  "./",
  "./index.html",
  "./archive.html",
  "./impressum.html",
  "./datenschutz.html",
  "./rezepte.js",       
  "./app.js",            
  "./style.css",         
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./mask-icon-192.png", 
  "./mask-icon-512.png",
  "./fonts/nunito-regular.woff2",
  "./fonts/nunito-600.woff2",
  "./fonts/nunito-700.woff2",
  "./fonts/playfair-700.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
