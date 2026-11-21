// R17: lavoro in background. Le elaborazioni pesanti girano in un Web Worker: l'interfaccia non si blocca
// e il lavoro continua anche con l'app in background finché resta aperta.
// Uso: const r = await runInWorker(new URL("./workers/mio.worker.js", import.meta.url), dati, p => barra(p));
// Il worker risponde con { progress: 0..1 } durante il lavoro e { result } oppure { error } alla fine.
let active = 0;
const guard = e => { e.preventDefault(); e.returnValue = ""; }; // avvisa se si chiude a metà
export function runInWorker(url, data, onProgress) {
  return new Promise((resolve, reject) => {
    const w = new Worker(url, { type: "module" });
    if (active++ === 0) addEventListener("beforeunload", guard);
    const done = () => { w.terminate(); if (--active === 0) removeEventListener("beforeunload", guard); };
    w.onmessage = ({ data: m }) => {
      if ("progress" in m) onProgress?.(m.progress);
      else if ("error" in m) { done(); reject(new Error(m.error)); }
      else { done(); resolve(m.result); }
    };
    w.onerror = e => { done(); reject(e); };
    w.postMessage(data);
  });
}
export const busy = () => active > 0;
