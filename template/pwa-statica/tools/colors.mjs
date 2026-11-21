// Colori: contrasto WCAG e sfondo dell'icona che esalta la mascotte (R04). Funzioni pure, testate.
export const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = h => hex2rgb(h).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const rgb2hsl = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l]; const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, s, l]; };
const hsl2hex = (h, s, l) => { const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return "#" + [0, 8, 4].map(n => Math.round(f(n) * 255).toString(16).padStart(2, "0")).join(""); };
export function iconBackground(body) {
  if (!/^#[0-9a-f]{6}$/i.test(body)) throw new Error(`Colore della mascotte non valido: ${body} (serve #rrggbb)`);
  const [h] = rgb2hsl(hex2rgb(body)), light = lum(body) > 0.35;
  const ls = light ? [0.42, 0.36, 0.3, 0.24] : [0.9, 0.85, 0.8];
  // Prima la tinta complementare (fa risaltare i colori), poi le vicine.
  for (const dh of [180, 150, 210, 30, -30, 0]) for (const l of ls) { const c = hsl2hex((h + dh + 360) % 360, 0.6, l); if (contrast(body, c) >= 3) return c; }
  return light ? "#3a2e4a" : "#fff4f8";
}

