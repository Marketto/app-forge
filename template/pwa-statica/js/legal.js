// R14: privacy e condizioni d'uso da accettare al primo avvio e a ogni nuova versione del testo (POLICY_VERSION).
// Testi in locales/legal/<lingua>.json (riserva: en), adattati a quello che fa l'app. Lo scarico di responsabilità
// è evidenziato e approvato con una casella a parte. R15: consenso facoltativo alle statistiche anonime.
import { t, lang } from "./i18n.js";
import { esc } from "./ui.js";

export const POLICY_VERSION = "0.1.0";
const KEY = "__ID__:legal";
const cache = {};
async function texts() {
  const get = c => (cache[c] ||= fetch(new URL(`../locales/legal/${c}.json`, import.meta.url)).then(r => (r.ok ? r.json() : null)).catch(() => null));
  return (await get(lang())) || (await get("en"));
}
export const accepted = () => { try { return JSON.parse(localStorage.getItem(KEY))?.v === POLICY_VERSION; } catch { return false; } };
const updated = L => esc(String(L.updated).replace("{v}", POLICY_VERSION));
const body = (L, part) => L[part].map(([k, s]) => (k === "h" ? `<h3>${esc(s)}</h3>` : `<p>${esc(s)}</p>`)).join("");
function sheet(id) {
  let d = document.getElementById(id);
  if (!d) { d = document.createElement("dialog"); d.id = id; d.setAttribute("aria-labelledby", id + "T"); document.body.append(d); }
  return d;
}

/** Chiede di accettare. Risolve con { stats } (consenso alle statistiche) quando l'utente accetta. */
export async function gate({ mascotSvg = "", askStats = false } = {}) {
  if (accepted()) return null;
  const L = await texts(), d = sheet("gate");
  d.innerHTML = `<form method="dialog" class="sheet gate">
    <div class="mascot-mini" aria-hidden="true">${mascotSvg}</div>
    <h2 id="gateT">${esc(t("gate.title"))}</h2><p>${esc(t("gate.intro"))}</p>
    <ul>${L.summary.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
    <div class="disclaimer" role="note"><strong>${esc(L.disclaimerTitle)}</strong><p>${esc(L.disclaimer)}</p></div>
    <details><summary>${esc(t("legal.privacy"))}</summary><div class="legal-body">${body(L, "privacy")}</div></details>
    <details><summary>${esc(t("legal.terms"))}</summary><div class="legal-body">${body(L, "terms")}</div></details>
    <p class="muted">${updated(L)}</p>
    <label class="check"><input type="checkbox" id="gateOk" required><span>${esc(t("gate.accept"))}</span></label>
    <label class="check"><input type="checkbox" id="gateDisc" required><span>${esc(L.approve)}</span></label>
    ${askStats ? `<label class="check"><input type="checkbox" id="gateStats"><span>${esc(t("usage.ask"))}</span></label>` : ""}
    <div class="btns"><button class="btn" id="gateGo" disabled>${esc(t("gate.go"))}</button></div></form>`;
  const ok = d.querySelector("#gateOk"), disc = d.querySelector("#gateDisc"), go = d.querySelector("#gateGo");
  ok.onchange = disc.onchange = () => { go.disabled = !(ok.checked && disc.checked); };
  let done = false;
  d.addEventListener("cancel", e => e.preventDefault()); // serve il consenso: Esc non chiude
  d.addEventListener("close", () => { if (!done) d.showModal(); }); // Chrome lascia chiudere al secondo Esc: si riapre
  d.showModal();
  const title = d.querySelector("#gateT"); title.tabIndex = -1; title.focus(); // il lettore di schermo parte dal titolo
  await new Promise(res => { d.querySelector("form").onsubmit = e => { if (!ok.checked || !disc.checked) { e.preventDefault(); return; } res(); }; });
  done = true;
  const stats = !!d.querySelector("#gateStats")?.checked;
  try { localStorage.setItem(KEY, JSON.stringify({ v: POLICY_VERSION, at: new Date().toISOString(), lang: lang() })); } catch {}
  d.close();
  return { stats };
}

/** Testo completo, sempre consultabile dal piè di pagina. */
export async function showLegal() {
  const L = await texts(), d = sheet("legalView");
  d.innerHTML = `<form method="dialog" class="sheet"><div class="sheet-head"><h2 id="legalViewT">${esc(L.title)}</h2>
    <button class="icon-btn" aria-label="${esc(t("ui.close"))}"><i class="ic ic-close" aria-hidden="true"></i></button></div>
    <div class="disclaimer" role="note"><strong>${esc(L.disclaimerTitle)}</strong><p>${esc(L.disclaimer)}</p></div>
    <div class="legal-body"><h3>${esc(t("legal.privacy"))}</h3>${body(L, "privacy")}<h3>${esc(t("legal.terms"))}</h3>${body(L, "terms")}</div>
    <p class="muted">${updated(L)}</p></form>`;
  d.showModal();
}
