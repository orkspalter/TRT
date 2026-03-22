const CACHE_NAME = "timm-recipes-cache-v16"; // Direkt eins hochgezählt für das Update!
const OFFLINE_URLS = [
  "./",
  "./index.html",
  "./archive.html",
  "./impressum.html",
  "./datenschutz.html",
  "./rezepte.js",       // GANZ WICHTIG für die Daten!
  "./manifest.json",
  "./style.css",
  "./icon-192.png",
  "./icon-512.png",
  "./mask-icon-192.png", 
  "./mask-icon-512.png",
  // Auch die Schriften cachen, sonst sieht es offline komisch aus:
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
