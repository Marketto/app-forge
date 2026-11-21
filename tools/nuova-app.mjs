// Crea una nuova app dal modello template/pwa-statica e la aggiunge al catalogo.
// npm run nuova-app -- --id volpe-note --nome "Volpe Note" --mascotte Kitsu --animale volpe \
//   --colore "#ffd6a5" --categoria Casa --descrizione "Note veloci offline." [--dest ../volpe-note] [--prova]
// --prova: crea i file ma non tocca catalog/apps.json (automatico fuori dal repo app-forge).
// Scelte (R01, R16, R18, R15): --senza-mascotte  --musica  --sync dropbox,gdrive,webdav  --goatcounter <codice>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const k = argv[i].slice(2);
  opt[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
}

const noMascot = !!opt["senza-mascotte"];
if (noMascot) { opt.mascotte ||= opt.nome; opt.animale ||= "—"; }
const need = ["id", "nome", "mascotte", "animale", "colore"];
const missing = need.filter(k => !opt[k]);
if (missing.length) { console.error(`Mancano: ${missing.map(k => "--" + k).join(", ")}`); process.exit(1); }
if (!/^[a-z0-9][a-z0-9-]*$/.test(opt.id)) { console.error("--id: solo minuscole, numeri e trattini"); process.exit(1); }
if (!/^#[0-9a-f]{6}$/i.test(opt.colore)) { console.error("--colore: formato #rrggbb"); process.exit(1); }

const catPath = path.join(ROOT, "catalog/apps.json");
const cat = JSON.parse(fs.readFileSync(catPath, "utf8"));
const norm = s => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim();
const used = !noMascot && cat.apps.find(a => a.mascotte && norm(a.mascotte.animale) === norm(opt.animale));
if (used) { console.error(`L'animale «${opt.animale}» è già usato da ${used.nome}. Scegline un altro.`); process.exit(1); }
if (cat.apps.some(a => a.id.toLowerCase() === opt.id.toLowerCase())) { console.error(`Esiste già un'app con id «${opt.id}».`); process.exit(1); }

const rel = path.relative(ROOT, path.resolve(process.cwd()));
const inForge = !rel.startsWith("..") && !path.isAbsolute(rel) && fs.existsSync(path.join(ROOT, ".git"));
if (!inForge && !opt.catalogo) opt.prova = true; // copia del plugin o di npx: il catalogo si aggiorna solo da app-forge
// Scelte fatte con il proprietario (controllate prima di creare qualsiasi file)
const sync = typeof opt.sync === "string" ? opt.sync.split(",").map(x => x.trim()).filter(Boolean) : [];
const bad = sync.filter(x => !["dropbox", "gdrive", "webdav"].includes(x));
if (bad.length) { console.error(`--sync: valori ammessi dropbox, gdrive, webdav (non ${bad.join(", ")})`); process.exit(1); }
if (opt.goatcounter !== undefined && !/^[a-z0-9-]+$/.test(String(opt.goatcounter))) { console.error("--goatcounter: solo minuscole, numeri e trattini (il codice del sito GoatCounter)"); process.exit(1); }
const dest = path.resolve(opt.dest || (inForge ? path.join(ROOT, "..", opt.id) : opt.id));
if (fs.existsSync(dest) && fs.readdirSync(dest).filter(f => f !== ".git").length) { console.error(`${dest} non è vuota.`); process.exit(1); }

const desc = opt.descrizione || `${opt.nome}, con ${opt.mascotte}.`;
const vars = {
  __ID__: opt.id, __NOME__: opt.nome, __MASCOTTE__: opt.mascotte, __ANIMALE__: opt.animale,
  __COLORE__: opt.colore, __DESCRIZIONE__: desc, __ANNO__: String(new Date().getFullYear()), __REPO__: `${cat.autore}/${opt.id}`,
};
const fill = s => s.replace(/__(ID|NOME|MASCOTTE|ANIMALE|COLORE|DESCRIZIONE|ANNO|REPO)__/g, m => vars[m]);

function copy(src, dst) {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copy(s, d); }
    else if (/\.(png|jpe?g|webp|woff2?|ico)$/i.test(e.name)) fs.copyFileSync(s, d);
    else fs.writeFileSync(d, fill(fs.readFileSync(s, "utf8")));
  }
}
fs.mkdirSync(dest, { recursive: true });
copy(path.join(ROOT, "template/pwa-statica"), dest);

// Scelte → js/config.js
fs.writeFileSync(path.join(dest, "js/config.js"), `// Scelte fatte alla creazione dell'app (tools/nuova-app.mjs). Cambiale qui, non sparse nel codice.
export const CONFIG = ${JSON.stringify({ id: opt.id, mascot: !noMascot, music: !!opt.musica, goatcounter: typeof opt.goatcounter === "string" ? opt.goatcounter : "", sync, repo: vars.__REPO__ }, null, 2)};
`);
if (sync.length) fs.appendFileSync(path.join(dest, "docs/TODO.md"), `- [ ] Salvataggio cloud (${sync.join(", ")}): porta la sync da Kapibo (\`js/sync/\`) con la skill porta-funzione e citala nella privacy (R18, R14).\n`);
if (noMascot) fs.appendFileSync(path.join(dest, "docs/TODO.md"), "- [ ] Senza mascotte: disegna in `js/mascot.js` il simbolo dell'app (usato per le icone) e togli i passi del wizard sulla mascotte.\n");

// Agenti e skill comuni (non quelli che servono solo ad app-forge).
const claudeSrc = path.join(ROOT, ".claude");
for (const sub of ["agents", "skills"]) fs.mkdirSync(path.join(dest, ".claude", sub), { recursive: true });
// Copie locali (servono anche agli agenti diversi da Claude): i rimandi ad app-forge diventano comandi npx e link.
const local = t => t
  .replace(/node \$\{CLAUDE_PLUGIN_ROOT\}\/tools\/controlla-app\.mjs \.?/g, "npx -y github:Marketto/app-forge controlla")
  .replace(/^> \*\*Percorsi\*\*.*$/gm, "> Fa parte delle regole comuni di [app-forge](https://github.com/Marketto/app-forge): `catalog/` e `docs/` citati qui sono in quel repo.")
  .replace(/\$\{CLAUDE_PLUGIN_ROOT\}\/?/g, "app-forge/");
for (const f of fs.readdirSync(path.join(claudeSrc, "agents")).filter(f => f !== "revisore.md")) // il revisore arriva dal plugin
  fs.writeFileSync(path.join(dest, ".claude/agents", f), local(fs.readFileSync(path.join(claudeSrc, "agents", f), "utf8")));
for (const s of ["regole-app", "mascotte-e-icone", "traduzioni", "verifica", "rilascio"]) {
  fs.mkdirSync(path.join(dest, ".claude/skills", s), { recursive: true });
  fs.writeFileSync(path.join(dest, ".claude/skills", s, "SKILL.md"), local(fs.readFileSync(path.join(claudeSrc, "skills", s, "SKILL.md"), "utf8")));
}
fs.writeFileSync(path.join(dest, ".claude/settings.json"), JSON.stringify({
  model: "sonnet",
  // Il plugin app-forge viene proposto a chi apre il repo (anche nelle sessioni cloud).
  extraKnownMarketplaces: { "app-forge": { source: { source: "github", repo: "Marketto/app-forge" } } },
  enabledPlugins: { "app-forge@app-forge": true },
  permissions: {
    allow: ["Bash(node --test:*)", "Bash(node tools/:*)", "Bash(npm test:*)", "Bash(git status:*)", "Bash(git diff:*)"],
    deny: ["Read(vendor/**)", "Read(./.env*)", "Read(./config.local.js)"],
  },
}, null, 2) + "\n");

if (!opt.prova) {
  cat.apps.push({
    id: opt.id, nome: opt.nome, repo: `${cat.autore}/${opt.id}`, url: `https://${cat.autore.toLowerCase()}.github.io/${opt.id}/`,
    descrizione: desc, categoria: opt.categoria || "Strumenti",
    mascotte: noMascot ? { nome: "—", animale: "nessuna" } : { nome: opt.mascotte, animale: opt.animale },
    piattaforme: ["Web"], stack: "PWA, JavaScript senza build", colore: opt.colore, stato: "in sviluppo",
  });
  fs.writeFileSync(catPath, JSON.stringify(cat, null, 2) + "\n");
}

console.log(`Creata in ${dest}${opt.prova ? "" : " e aggiunta al catalogo (stato: in sviluppo)"}.
Prossimi passi:
  cd ${path.relative(process.cwd(), dest) || "."} && git init -b main && npm install && npm run icons && npm test
  git remote add origin https://github.com/${cat.autore}/${opt.id}.git && git add -A && git commit -m "Prima versione" && git push -u origin main
  Su GitHub: Settings → Pages → Source: GitHub Actions.`);
