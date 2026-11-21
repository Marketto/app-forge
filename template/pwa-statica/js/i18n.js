// R08: ogni testo visibile passa da t("chiave"). Testi in locales/<sigla>.json, riserva: en.
// LINGUE è l'elenco obbligatorio (lingue europee + russo, cinese, giapponese, coreano, arabo).
export const LINGUE = {
  ar: { name: "العربية", rtl: true }, be: { name: "Беларуская" }, bg: { name: "Български" }, bs: { name: "Bosanski" },
  ca: { name: "Català" }, cs: { name: "Čeština" }, da: { name: "Dansk" }, de: { name: "Deutsch" }, el: { name: "Ελληνικά" },
  en: { name: "English" }, es: { name: "Español" }, et: { name: "Eesti" }, eu: { name: "Euskara" }, fi: { name: "Suomi" },
  fr: { name: "Français" }, ga: { name: "Gaeilge" }, gl: { name: "Galego" }, hr: { name: "Hrvatski" }, hu: { name: "Magyar" },
  is: { name: "Íslenska" }, it: { name: "Italiano" }, ja: { name: "日本語" }, ko: { name: "한국어" }, lb: { name: "Lëtzebuergesch" },
  lt: { name: "Lietuvių" }, lv: { name: "Latviešu" }, mk: { name: "Македонски" }, mt: { name: "Malti" }, nl: { name: "Nederlands" },
  no: { name: "Norsk" }, pl: { name: "Polski" }, pt: { name: "Português" }, ro: { name: "Română" }, ru: { name: "Русский" },
  sk: { name: "Slovenčina" }, sl: { name: "Slovenščina" }, sq: { name: "Shqip" }, sr: { name: "Српски" }, sv: { name: "Svenska" },
  tr: { name: "Türkçe" }, uk: { name: "Українська" }, zh: { name: "中文" },
};
const KEY = "__ID__:lang";
let dict = {}, fallback = {}, current = "it";
export const lang = () => current;

const load = code => fetch(new URL(`../locales/${code}.json`, import.meta.url)).then(r => (r.ok ? r.json() : {})).catch(() => ({}));

export async function setLang(code) {
  current = LINGUE[code] ? code : "en";
  [dict, fallback] = await Promise.all([load(current), current === "en" ? Promise.resolve(null) : load("en")]);
  fallback ||= dict;
  document.documentElement.lang = current;
  document.documentElement.dir = LINGUE[current]?.rtl ? "rtl" : "ltr";
  try { localStorage.setItem(KEY, current); } catch {}
  apply();
}
/** Traduzione con segnaposto {nome}. Più varianti separate da «|»: ne sceglie una a caso (frasi della mascotte). */
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
  let saved = null; try { saved = localStorage.getItem(KEY); } catch {}
  return saved || (navigator.language || "en").slice(0, 2).toLowerCase();
}
