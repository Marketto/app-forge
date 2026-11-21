// Genera il catalogo statico in _site/ a partire da catalog/apps.json.
// Nessuna dipendenza: node tools/build-catalog.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_site");
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
<header class="top">
  <h1>${esc(data.titolo)} <span aria-hidden="true">✿</span></h1>
  <p class="sub">${esc(data.sottotitolo)}</p>
  ${categorie.length > 1 ? `<nav class="chips" aria-label="Categorie">
    <button type="button" aria-pressed="true" data-cat="">Tutte</button>
    ${categorie.map(c => `<button type="button" aria-pressed="false" data-cat="${esc(c)}">${esc(c)}</button>`).join("\n    ")}
  </nav>` : ""}
</header>
<main>
  <ul class="apps">${apps.map(card).join("")}
  </ul>
</main>
<footer class="foot">
  <p>${apps.length} app · aggiornato il ${new Date().toISOString().slice(0, 10)} · <a href="https://github.com/${esc(data.autore)}">GitHub</a></p>
</footer>
<script>
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
fs.copyFileSync(path.join(ROOT, "catalog/apps.json"), path.join(OUT, "apps.json"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log(`Catalogo OK: ${apps.length} app → _site/`);
