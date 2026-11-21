// R10: temi auto (segue il sistema), chiaro, scuro, alto contrasto, daltonici.
// «auto» viene tradotto nel tema del sistema (contrasto alto > scuro > chiaro) e segue i suoi cambi.
const KEY = "__ID__:theme";
export const THEMES = ["auto", "light", "dark", "contrast", "cb"];
const mq = { dark: matchMedia("(prefers-color-scheme: dark)"), contrast: matchMedia("(prefers-contrast: more)") };
export const systemTheme = () => (mq.contrast.matches ? "contrast" : mq.dark.matches ? "dark" : "light");
export function getTheme() { try { return localStorage.getItem(KEY) || "auto"; } catch { return "auto"; } }
export function setTheme(name) {
  const v = THEMES.includes(name) ? name : "auto";
  document.documentElement.dataset.theme = v === "auto" ? systemTheme() : v;
  try { localStorage.setItem(KEY, v); } catch {}
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() || meta.content;
}
for (const m of Object.values(mq)) m.addEventListener("change", () => { if (getTheme() === "auto") setTheme("auto"); });
