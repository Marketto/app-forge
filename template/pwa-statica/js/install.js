// R05: pulsante «Installa» quando il browser lo permette; su iPhone/iPad spiega come aggiungere alla Home.
import { t } from "./i18n.js";
import { toast } from "./ui.js";
let deferred = null;
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
export function setupInstall(btn, onInstalled) {
  if (standalone()) return;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; btn.hidden = false; });
  addEventListener("appinstalled", () => { btn.hidden = true; deferred = null; onInstalled?.(); });
  if (ios()) btn.hidden = false;
  btn.addEventListener("click", async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; btn.hidden = true; }
    else toast(t("install.ios"));
  });
}
