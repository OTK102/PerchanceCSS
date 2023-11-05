// (A) CREATE/INSTALL CACHE
self.addEventListener("install", evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open("JSINV")
    .then(cache => cache.addAll([
      "js-inventory.css",
      "js-inventory.html",
      "js-inventory-db",
      "js-inventory-db.js",
      "js-inventory-items.js",
      "js-inventory-move.js",
      "js-inventory-manifest.json",
      "images/favicon.png",
      "images/icon-512.png"
    ]))
    .catch(err => console.error(err))
  );
});

// (B) CLAIM CONTROL INSTANTLY
self.addEventListener("activate", evt => self.clients.claim());

// (C) LOAD FROM CACHE FIRST, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", evt => evt.respondWith(
  caches.match(evt.request).then(res => res || fetch(evt.request))
));