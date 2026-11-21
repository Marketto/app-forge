// R01: __MASCOTTE__ (__ANIMALE__). UNICA fonte della mascotte: la usano la pagina (js/mascot-live.js) e tools/icons.mjs.
// Funzione pura (niente DOM): restituisce l'SVG. È un segnaposto tondo: ridisegnalo come __ANIMALE__
// nello stile kawaii giapponese anni '90/2000 con la skill mascotte-e-icone, mantenendo i gruppi m-body, m-eyes, m-pupils.
export const COLORS = {
  body: "__COLORE__", ink: "#4a3550", cheek: "#ff9fb8", shine: "#ffffff",
  iconBg: "", // R04: sfondo dell'icona; vuoto = calcolato da tools/icons.mjs per esaltare il colore della mascotte
};

export function mascotSVG({ mood = "happy", size = 140 } = {}) {
  const c = COLORS;
  const wow = mood === "wow";
  const eyes = mood === "sleep"
    ? `<path d="M40 62q6 5 12 0M68 62q6 5 12 0" stroke="${c.ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    : `<g class="m-eyes"><ellipse cx="46" cy="62" rx="7.5" ry="${wow ? 9.5 : 8.5}" fill="${c.ink}"/><ellipse cx="74" cy="62" rx="7.5" ry="${wow ? 9.5 : 8.5}" fill="${c.ink}"/>
       <g class="m-pupils" fill="${c.shine}"><circle cx="48.5" cy="58.5" r="2.8"/><circle cx="76.5" cy="58.5" r="2.8"/><circle cx="44" cy="65.5" r="1.3"/><circle cx="72" cy="65.5" r="1.3"/></g></g>`;
  const mouth = { happy: "M54 74q6 6 12 0", think: "M55 76h10", wow: "M57 74a3 4 0 1 0 6 0a3 4 0 1 0-6 0", sleep: "M56 76q4 2 8 0" }[mood] || "M54 74q6 6 12 0";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true" focusable="false">
  <ellipse cx="60" cy="108" rx="34" ry="6" fill="${c.ink}" opacity=".12"/>
  <g class="m-body">
    <path d="M60 18c28 0 46 20 46 48s-18 40-46 40-46-12-46-40 18-48 46-48z" fill="${c.body}" stroke="${c.ink}" stroke-width="3"/>
    <ellipse cx="38" cy="76" rx="8" ry="5" fill="${c.cheek}" opacity=".85"/><ellipse cx="82" cy="76" rx="8" ry="5" fill="${c.cheek}" opacity=".85"/>
    ${eyes}
    <path d="${mouth}" stroke="${c.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
}
