// R15: statistiche d'uso anonime con GoatCounter (senza cookie, nessun identificativo).
// Attive solo se CONFIG.goatcounter è impostato E l'utente ha acconsentito. Si inviano solo nomi di eventi
// («open», «add»…), mai contenuti. Offline restano in coda (al massimo 200) e partono dopo.
import { CONFIG } from "./config.js";
const K = { consent: "__ID__:stats", queue: "__ID__:statsQueue" };
const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
let busy = false;

export const available = () => !!CONFIG.goatcounter;
export const consent = () => get(K.consent, null);               // true · false · null (mai chiesto)
export const enabled = () => available() && consent() === true;
export function setConsent(v) { set(K.consent, !!v); if (v) flush(); else set(K.queue, []); }
export function track(event) {
  if (!enabled()) return;
  const q = get(K.queue, []); q.push(String(event).slice(0, 40)); if (q.length > 200) q.splice(0, q.length - 200);
  set(K.queue, q); flush();
}
function flush() {
  if (!enabled() || busy || navigator.onLine === false) return;
  const q = get(K.queue, []); if (!q.length) return;
  busy = true;
  const url = `https://${CONFIG.goatcounter}.goatcounter.com/count?p=${encodeURIComponent("/" + q[0])}&e=true&rnd=${Math.random().toString(36).slice(2)}`;
  fetch(url, { mode: "no-cors", keepalive: true, credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" })
    .then(() => { const q2 = get(K.queue, []); q2.shift(); set(K.queue, q2); busy = false; setTimeout(flush, 250); })
    .catch(() => { busy = false; });
}
addEventListener("online", flush);
