// Genera il catalogo statico in _site/ a partire da catalog/apps.json.
// Nessuna dipendenza: node tools/build-catalog.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_site");
const { lionSVG, iconSVG, FRASI, NOME } = await import(pathToFileURL(path.join(ROOT, "site/mascot.mjs")).href);
const VERSIONE = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin/plugin.json"), "utf8")).version;
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "catalog/apps.json"), "utf8"));

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const exists = p => fs.existsSync(path.join(ROOT, "site", p));

const errors = [];
const ids = new Set();
for (const a of data.apps) {
  for (const k of ["id", "nome", "repo", "url", "descrizione"]) if (!a[k]) errors.push(`${a.id ?? "?"}: manca «${k}»`);
  if (ids.has(a.id)) errors.push(`${a.id}: id duplicato`);
  ids.add(a.id);
  if (!/^https:\/\//.test(a.url ?? "")) errors.push(`${a.id}: url non https`);
  if (!exists(`icons/${a.id}.png`) && ["attiva", "prova"].includes(a.stato)) errors.push(`${a.id}: manca site/icons/${a.id}.png (npm run schermate -- ${a.id})`);
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }

const apps = data.apps.filter(a => a.stato !== "nascosta");
const categorie = [...new Set(apps.map(a => a.categoria).filter(Boolean))];

const SHARE = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg>';
const RAW = "https://raw.githubusercontent.com/Marketto/app-forge/main/.claude/skills";
// Modalità d'uso (non passi in sequenza): ognuna funziona da sola.
const MODI = [
  { t: "Creare una nuova app", d: "incolla in Claude Code e descrivi l'idea:", p: `Creami un'app che … seguendo ${RAW}/nuova-app/SKILL.md` },
  { t: "Migliorare un'app esistente", d: "nel repo dell'app:", p: `Migliora quest'app seguendo ${RAW}/migliora-app/SKILL.md` },
  { t: "Revisionare un progetto", d: "due giri con un revisore indipendente:", p: `Revisiona questo progetto seguendo ${RAW}/revisione/SKILL.md` },
  { t: "Con il plugin sul computer", d: "in Claude Code: /plugin marketplace add Marketto/app-forge, poi «fammi un'app che…»." },
];
const card = a => {
  const shot = exists(`screenshots/${a.id}.jpg`)
    ? `<img class="shot" src="screenshots/${esc(a.id)}.jpg" alt="" loading="lazy" width="1280" height="800">`
    : `<div class="shot shot-empty" style="--c:${esc(a.colore || "#ffd9e8")}"></div>`;
  const badge = a.stato === "prova" ? `<span class="badge">in prova</span>` : a.stato === "in sviluppo" ? `<span class="badge">in arrivo</span>` : "";
  return `
    <li class="app" data-cat="${esc(a.categoria)}" style="--c:${esc(a.colore || "#ffd9e8")}">
      <a class="open" href="${esc(a.url)}" aria-label="Apri ${esc(a.nome)}">
        ${shot}
        <img class="icon" src="${exists(`icons/${a.id}.png`) ? `icons/${esc(a.id)}.png` : "favicon.svg"}" alt="" width="256" height="256">
        <span class="name">${esc(a.nome)}</span>
      </a>
      <div class="info">
        <p class="desc">${esc(a.descrizione)} ${badge}</p>
        <p class="meta">${a.mascotte ? `Con ${esc(a.mascotte.nome)} (${esc(a.mascotte.animale)}) · ` : ""}${(a.piattaforme || []).map(esc).join(" · ")}</p>
        <p class="links"><a class="btn" href="${esc(a.url)}">Apri</a><a class="btn ghost" href="https://github.com/${esc(a.repo)}">Codice</a></p>
      </div>
    </li>`;
};

const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(data.titolo)}</title>
<meta name="description" content="${esc(data.sottotitolo)}">
<meta name="theme-color" content="#ffe4ee" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1d1a2b" media="(prefers-color-scheme: dark)">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="wrap">
<header class="top">
  <button class="lion" id="lion" type="button" aria-label="${NOME}, il leone di app-forge">${lionSVG({ size: 56 })}</button>
  <div class="ttl"><h1>${esc(data.titolo)}</h1><p class="ver">fatte con app-forge · v${esc(VERSIONE)}</p></div>
  <button class="ib" id="share" type="button" aria-label="Condividi">${SHARE}</button>
</header>
<p class="bubble" id="bubble" aria-live="polite" hidden></p>
<p class="sub">${esc(data.sottotitolo)}</p>
<details class="forge" id="forge">
  <summary>${lionSVG({ size: 28 })}<span>Cos'è app-forge e come usarlo</span></summary>
  <div class="forge-in">
    <p>app-forge è la «fabbrica» con cui nascono queste app: regole comuni (mascotte kawaii, 42 lingue, temi, accessibilità, privacy) e un assistente Claude che le applica. Puoi usarlo in diversi modi, a scelta:</p>
    <ul class="modes">
      ${MODI.map(m => `<li><strong>${esc(m.t)}</strong> — ${esc(m.d)}${m.p ? `<code>${esc(m.p)}</code><button class="cp" type="button" data-copy="${esc(m.p)}">Copia</button>` : ""}</li>`).join("\n      ")}
    </ul>
    <p class="muted">I prompt funzionano in Claude Code anche dal web e dal telefono. Tutti i dettagli nel <a href="https://github.com/Marketto/app-forge#readme">README su GitHub</a>.</p>
  </div>
</details>
${categorie.length > 1 ? `<nav class="chips" aria-label="Categorie">
  <button type="button" aria-pressed="true" data-cat="">Tutte</button>
  ${categorie.map(c => `<button type="button" aria-pressed="false" data-cat="${esc(c)}">${esc(c)}</button>`).join("\n  ")}
</nav>` : ""}
<main>
  <ul class="apps">${apps.map(card).join("")}
  </ul>
</main>
</div>
<footer class="foot">
  <p>${apps.length} app · v${esc(VERSIONE)} · aggiornato il ${new Date().toISOString().slice(0, 10)} · <a href="https://github.com/${esc(data.autore)}">GitHub</a></p>
</footer>
<script type="module">
  const FRASI = ${JSON.stringify(FRASI)};
  const $ = s => document.querySelector(s);
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // R02: il leone parla al tocco e salta; gli occhi seguono il dito.
  let n = 0, tmr;
  $("#lion").addEventListener("click", () => {
    const b = $("#bubble"); b.hidden = false; b.textContent = FRASI[n++ % FRASI.length];
    clearTimeout(tmr); tmr = setTimeout(() => { b.hidden = true; }, 5000);
    if (!still) { const l = $("#lion"); l.classList.remove("jump"); void l.offsetWidth; l.classList.add("jump"); }
  });
  if (!still) addEventListener("pointermove", e => {
    const p = $("#lion .m-pupils"), r = $("#lion").getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1, k = Math.min(2.5, d / 60);
    p.style.transform = "translate(" + dx / d * k + "px," + dy / d * k + "px)";
  }, { passive: true });
  // R07: Condividi, altrimenti copia il link.
  const toast = t => { const d = Object.assign(document.createElement("div"), { className: "toast", role: "status", textContent: t }); document.body.append(d); setTimeout(() => d.remove(), 2500); };
  const copy = async t => { try { await navigator.clipboard.writeText(t); toast("Copiato!"); } catch { toast(t); } };
  $("#share").addEventListener("click", async () => {
    const url = location.href.split("#")[0];
    try { if (!navigator.share) throw 0; await navigator.share({ title: document.title, url }); } catch (e) { if (e?.name !== "AbortError") copy(url); }
  });
  document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => copy(b.dataset.copy)));
  // Su schermi larghi la spiegazione sta aperta nella colonna laterale.
  if (matchMedia("(min-width: 1100px)").matches) $("#forge").open = true;
  // Filtro per categoria: senza JavaScript si vedono tutte.
  document.querySelectorAll(".chips button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".chips button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    document.querySelectorAll(".app").forEach(li => { li.hidden = !!b.dataset.cat && li.dataset.cat !== b.dataset.cat; });
  }));
</script>
</body>
</html>
`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, "site"), OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.writeFileSync(path.join(OUT, "favicon.svg"), iconSVG()); // R04: favicon dal leone
fs.copyFileSync(path.join(ROOT, "catalog/apps.json"), path.join(OUT, "apps.json"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log(`Catalogo OK: ${apps.length} app → _site/`);
