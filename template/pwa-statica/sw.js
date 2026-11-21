// Cache offline. VERSION viene sostituita da pages.yml con APP_VERSION: nuova versione = nuova cache = aggiornamento.
const VERSION = "dev";
const CACHE = "__ID__-" + VERSION;
const CORE = ["./", "index.html", "css/style.css", "js/app.js", "js/i18n.js", "js/mascot.js", "js/store.js", "js/version.js",
  "js/logic/items.js", "locales/it.json", "locales/en.json", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})); });
self.addEventListener("activate", e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.startsWith("__ID__-") && k !== CACHE).map(k => caches.delete(k))))
  .then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // Rete prima (aggiornamenti subito), cache se offline.
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
