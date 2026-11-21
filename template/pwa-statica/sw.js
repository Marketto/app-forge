// R06: cache offline. VERSION viene sostituita da pages.yml con APP_VERSION: nuova versione = nuova cache.
// La nuova versione resta in attesa e si attiva alla prossima apertura, o subito se l'app manda "skipWaiting".
const VERSION = "dev";
const CACHE = "__ID__@" + VERSION; // «@» non può stare in un id: le app sullo stesso dominio non si cancellano le cache
const CORE = ["./", "index.html", "manifest.webmanifest", "css/style.css", "css/icons.css", "fonts/app-icons.woff2",
  "js/app.js", "js/config.js", "js/i18n.js", "js/theme.js", "js/ui.js", "js/share.js", "js/install.js", "js/update.js",
  "js/mascot.js", "js/mascot-live.js", "js/tour.js", "js/legal.js", "js/usage.js", "js/music.js", "js/work.js",
  "js/store.js", "js/version.js", "js/logic/items.js", "js/logic/backup.js",
  "locales/it.json", "locales/en.json", "locales/legal/it.json", "locales/legal/en.json", "icons/icon.svg", "icons/icon-192.png"];
// Se un file manca l'installazione fallisce e il browser riprova: meglio che un'app «offline» senza cache.
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))));
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });
self.addEventListener("activate", e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.startsWith("__ID__@") && k !== CACHE).map(k => caches.delete(k))))
  .then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // Rete prima (aggiornamenti subito) ma al massimo 3 s se c'è una copia in cache; offline, la cache.
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    const net = fetch(e.request).then(r => {
      if (r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
      return r;
    });
    const timeout = cached ? new Promise(res => setTimeout(() => res(cached), 3000)) : null;
    try { return await (timeout ? Promise.race([net, timeout]) : net); }
    catch { return cached || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error()); }
  })());
});
