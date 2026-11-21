// R10: temi auto (segue il sistema), chiaro, scuro, alto contrasto, daltonici.
const KEY = "__ID__:theme";
export const THEMES = ["auto", "light", "dark", "contrast", "cb"];
export function getTheme() { try { return localStorage.getItem(KEY) || "auto"; } catch { return "auto"; } }
export function setTheme(name) {
  const v = THEMES.includes(name) ? name : "auto";
  if (v === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
  try { localStorage.setItem(KEY, v); } catch {}
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() || meta.content;
}
