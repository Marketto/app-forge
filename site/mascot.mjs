// Forgino, il leone di app-forge (R01). UNICA fonte: la usano tools/build-catalog.mjs (pagina, favicon) e la pagina.
// Gruppi animati dal CSS: m-body (respiro), m-eyes (ciglia), m-pupils (occhi che seguono).
const INK = "#5a3a2e", SKIN = "#ffd27f", MANE = ["#f29a3e", "#f7b45c"];
export const ICON_BG = "#3d6fb6"; // R04: blu che esalta l'arancio (contrasto ≥ 3:1)
export const NOME = "Forgino";
export const FRASI = [
  "Ciao! Sono Forgino, le ho costruite io 🦁",
  "Un'app alla volta, con il mio martellino!",
  "Vuoi crearne una? Apri «Cos'è app-forge»!",
  "Tutte gratuite e senza server. Ruggito di gioia!",
  "Toccami ancora, mi fa il solletico!",
];

export function lionSVG({ size = 160, mood = "happy" } = {}) {
  const cx = 80, cy = 62, n = 14, r = 40;
  let mane = "";
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n, x = (cx + r * Math.cos(a)).toFixed(1), y = (cy + r * Math.sin(a)).toFixed(1);
    mane += `<ellipse cx="${x}" cy="${y}" rx="15" ry="12.3" transform="rotate(${Math.round((a * 180) / Math.PI + 90)} ${x} ${y})" fill="${MANE[i % 2]}" stroke="${INK}" stroke-width="2.2"/>`;
  }
  const eyes = mood === "wow" ? 10 : 8.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="${size}" height="${size}" aria-hidden="true" focusable="false">
<ellipse cx="80" cy="150" rx="38" ry="5" fill="${INK}" opacity=".12"/>
<g class="m-body">
<ellipse cx="80" cy="112" rx="27" ry="22" fill="${SKIN}" stroke="${INK}" stroke-width="2.6"/><ellipse cx="80" cy="116" rx="15" ry="13" fill="#fff6e6"/>
<ellipse cx="66" cy="132" rx="9" ry="6" fill="${SKIN}" stroke="${INK}" stroke-width="2.4"/><ellipse cx="94" cy="132" rx="9" ry="6" fill="${SKIN}" stroke="${INK}" stroke-width="2.4"/>
<path d="M105 120q20 4 14-14" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="119" cy="104" r="5" fill="#e08a3a" stroke="${INK}" stroke-width="2"/>
${mane}
<circle cx="80" cy="62" r="34" fill="${SKIN}" stroke="${INK}" stroke-width="2.6"/>
<circle cx="52" cy="36" r="9" fill="${SKIN}" stroke="${INK}" stroke-width="2.4"/><circle cx="52" cy="36" r="4.5" fill="#ff9fb3"/>
<circle cx="108" cy="36" r="9" fill="${SKIN}" stroke="${INK}" stroke-width="2.4"/><circle cx="108" cy="36" r="4.5" fill="#ff9fb3"/>
<ellipse cx="80" cy="74" rx="15" ry="11" fill="#fff6e6"/>
<g class="m-eyes"><ellipse cx="67" cy="60" rx="7" ry="${eyes}" fill="${INK}"/><ellipse cx="93" cy="60" rx="7" ry="${eyes}" fill="${INK}"/>
<g class="m-pupils" fill="#fff"><circle cx="69.5" cy="56.5" r="2.8"/><circle cx="95.5" cy="56.5" r="2.8"/><circle cx="65" cy="63.5" r="1.3"/><circle cx="91" cy="63.5" r="1.3"/></g></g>
<ellipse cx="58" cy="71" rx="6.5" ry="4" fill="#ff9fb3" opacity=".85"/><ellipse cx="102" cy="71" rx="6.5" ry="4" fill="#ff9fb3" opacity=".85"/>
<path d="M76 69h8l-4 4z" fill="${INK}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M80 73v3M80 76q-4 4-7 1M80 76q4 4 7 1" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<g transform="translate(40 108) rotate(-30)"><rect x="-2.5" y="-2" width="5" height="24" rx="2.5" fill="#b9814f" stroke="${INK}" stroke-width="2"/><rect x="-11" y="-10" width="22" height="11" rx="3.5" fill="#c9c3d6" stroke="${INK}" stroke-width="2.2"/></g>
</g></svg>`;
}

/** Icona/favicon: leone su sfondo pieno arrotondato. */
export const iconSVG = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="36" fill="${ICON_BG}"/>${lionSVG().replace(/<svg[^>]*>|<\/svg>/g, "").replace('class="m-body"', 'transform="translate(8 2) scale(.9)"')}</svg>`;
