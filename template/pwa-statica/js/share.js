// R07: pulsante Condividi con icona standard. Condivisione di sistema, altrimenti copia il link.
import { t } from "./i18n.js";
import { toast } from "./ui.js";
export async function share() {
  const data = { title: document.title, text: t("share.text"), url: location.href.split("#")[0] };
  try {
    if (navigator.share) { await navigator.share(data); return "shared"; }
    await navigator.clipboard.writeText(data.url);
    toast(t("share.copied"));
    return "copied";
  } catch (e) {
    if (e?.name !== "AbortError") toast(t("share.manual", { url: data.url }));
    return "none";
  }
}
