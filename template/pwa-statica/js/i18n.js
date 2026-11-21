// Ogni testo visibile passa da t("chiave"). Lingue in locales/<sigla>.json.
export const LANGS = { it: "Italiano", en: "English" }; // aggiungi qui le nuove lingue; RTL: { ar: { name: "العربية", rtl: true } }
let dict = {}, fallback = {};
export let lang = "it";

export async function setLang(code) {
  lang = LANGS[code] ? code : "en";
  const get = c => fetch(`locales/${c}.json`).then(r => r.json());
  [dict, fallback] = await Promise.all([get(lang), get("en")]);
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGS[lang]?.rtl ? "rtl" : "ltr";
  try { localStorage.setItem("__ID__:lang", lang); } catch {}
  apply();
}
export function t(key, vars = {}) {
  let s = dict[key] ?? fallback[key] ?? key;
  if (s.includes("|")) { const v = s.split("|"); s = v[Math.floor(Math.random() * v.length)]; }
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
export function apply(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
}
export function preferred() {
  let saved = null; try { saved = localStorage.getItem("__ID__:lang"); } catch {}
  return saved || (navigator.language || "en").slice(0, 2);
}
