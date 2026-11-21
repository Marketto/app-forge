// R06: aggiornamenti automatici. Controlla al rientro nell'app e ogni ora; la nuova versione si attiva da sola
// alla prossima apertura, oppure subito con «Aggiorna».
import { t } from "./i18n.js";
import { toast } from "./ui.js";
export async function setupUpdates() {
  if (!("serviceWorker" in navigator)) return;
  let reg;
  try { reg = await navigator.serviceWorker.register("sw.js"); } catch { return; }
  const check = () => reg.update().catch(() => {});
  addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") check(); });
  setInterval(check, 60 * 60 * 1000);
  const offer = w => toast(t("update.ready"), { label: t("update.now"), run: () => w.postMessage("skipWaiting") });
  if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
  reg.addEventListener("updatefound", () => {
    const w = reg.installing;
    w?.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) offer(w); });
  });
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (!reloading) { reloading = true; location.reload(); } });
}
