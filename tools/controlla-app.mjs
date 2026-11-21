#!/usr/bin/env node
// Controlla un'app esistente rispetto alle regole comuni e stampa cosa manca.
//   node tools/controlla-app.mjs [cartella] [--json]
// Controlli veloci sui file, senza browser: il punto di partenza della skill migliora-app.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const SKIP = new Set(["node_modules", "vendor", "dist", "build", ".git", "_site", "coverage", ".next", "target"]);

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const catalogo = () => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, "catalog/apps.json"), "utf8")).apps; } catch { return []; } };

export function controlla(dir) {
  dir = path.resolve(dir);
  const files = [];
  (function walk(d, depth) {
    if (depth > 6) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, depth + 1); else files.push(path.relative(dir, p));
    }
  })(dir, 0);
  const has = re => files.filter(f => re.test(f));
  const cache = new Map();
  const text = f => {
    if (!cache.has(f)) { let t = ""; try { const p = path.join(dir, f); if (fs.statSync(p).size < 512 * 1024) t = fs.readFileSync(p, "utf8"); } catch {} cache.set(f, t); }
    return cache.get(f);
  };
  const grep = (list, re) => list.filter(f => re.test(text(f)));
  const pkg = files.includes("package.json") ? JSON.parse(text("package.json") || "{}") : {};
  const scripts = Object.keys(pkg.scripts || {});
  const out = [];
  const add = (ok, regola, cosa, dettaglio = "") => out.push({ ok, regola, cosa, dettaglio });

  const css = has(/\.(css|scss)$/);
  const code = has(/\.(js|mjs|jsx|ts|tsx|vue|svelte)$/);
  const vite = has(/^vite\.config\./);
  const usesVitePwa = grep(vite, /VitePWA|vite-plugin-pwa/).length > 0;

  // 1. PWA offline
  const manifest = has(/manifest\.(webmanifest|json)$/).filter(f => !/package|tsconfig|i18n|locales/.test(f));
  add(manifest.length > 0 || usesVitePwa, 1, "Manifest PWA", manifest[0] || (usesVitePwa ? "vite-plugin-pwa" : "manca"));
  const sw = has(/(^|\/)(sw|service-worker)\.(js|ts)$/);
  add(sw.length > 0 || usesVitePwa, 1, "Service worker (offline)", sw[0] || (usesVitePwa ? "vite-plugin-pwa" : "manca"));

  // 3. Mascotte
  const known = catalogo().find(a => a.id.toLowerCase() === path.basename(dir).toLowerCase())?.mascotte?.nome;
  const mascot = has(new RegExp(`mascot|mascotte${known ? "|(^|/)" + known.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase() + "[^/]*\\.(js|ts|mjs|svg|py)$" : ""}`, "i"));
  add(mascot.length > 0, 3, "Mascotte da una fonte unica", mascot.slice(0, 2).join(", ") || "nessun file mascot*");

  // 4. Lingue: cartella con file per lingua (it.json, en.js, pt-BR.json…)
  const LANG = /(^|\/)[a-z]{2,3}([-_][A-Za-z]{2,4})?\.(json|js|ts)$/;
  const byDir = {};
  for (const f of files) if (LANG.test(f) && !/test|legal|vendor|tesseract|audio/i.test(f)) (byDir[path.dirname(f)] ||= []).push(path.basename(f));
  const [locDir, langs = []] = Object.entries(byDir).sort((a, b) => a[1].length - b[1].length).pop() || [];
  if (locDir && (langs.length >= 5 || /(^|\/)(locales|i18n|lang|lingue|translations)$/.test(locDir))) {
    add(langs.length >= 39, 4, "Lingue", `${langs.length} in ${locDir}${langs.length < 39 ? " (obiettivo 39)" : ""}`);
    const ref = langs.find(l => /^en\.json$/.test(l)) || langs.find(l => /^it\.json$/.test(l));
    if (ref) {
      const flat = (o, p = "") => Object.entries(o || {}).flatMap(([k, v]) => v && typeof v === "object" ? flat(v, p + k + ".") : [p + k]);
      const parse = f => { try { return JSON.parse(text(f)); } catch { return {}; } };
      const keys = flat(parse(`${locDir}/${ref}`));
      const gaps = langs.filter(l => l.endsWith(".json")).map(l => { const have = new Set(flat(parse(`${locDir}/${l}`))); return [l, keys.filter(k => !have.has(k)).length]; }).filter(([, n]) => n);
      add(gaps.length === 0, 4, "Chiavi allineate a " + ref, gaps.length ? gaps.slice(0, 5).map(([l, n]) => `${l}: −${n}`).join(", ") + (gaps.length > 5 ? ` … (+${gaps.length - 5})` : "") : "tutte");
    }
  } else {
    const single = has(/(^|\/)(locales|i18n|translations|strings)\.(js|ts|json)$/)[0];
    add(null, 4, "Lingue", single ? `tutte in un file (${single}): contale leggendolo` : "non trovate: forse non tradotta, controlla");
  }
  add(has(/i18n[-_]?check|check[-_]?i18n/i).length > 0 || scripts.some(s => /i18n/.test(s)), 4, "Controllo automatico traduzioni", "");

  // 5. Design e accessibilità
  add(grep(css, /prefers-reduced-motion/).length > 0 || grep(code, /prefers-reduced-motion/).length > 0, 5, "prefers-reduced-motion", "");
  add(grep(css, /prefers-color-scheme:\s*dark|data-theme/).length > 0 || grep(code, /prefers-color-scheme|data-theme/).length > 0, 5, "Tema scuro", "");
  let fixed = 0;
  for (const f of css) for (const line of text(f).split("\n")) if (/#[0-9a-f]{3,8}\b|rgb\(/i.test(line) && !/^\s*--/.test(line)) fixed++;
  add(fixed <= 10, 5, "Colori solo da variabili", `${fixed} righe CSS con colori fissi fuori dalle variabili`);

  // 6. Test
  add(has(/(^|\/)(tests?|__tests__)\/|\.test\.|\.spec\./).length > 0 || scripts.includes("test"), 6, "Test della logica", scripts.includes("test") ? `npm test: ${pkg.scripts.test}` : "");

  // 7. Privacy
  add(has(/privacy[-_]?check|secrets?[-_]?check/i).length > 0 || scripts.some(s => /secret|privacy/.test(s)), 7, "Controllo dati sensibili", "");
  add(!has(/(^|\/)\.env($|\.)/).filter(f => !/example|sample/.test(f)).length, 7, "Nessun file .env nel repo", "");

  // 8. Versione
  const ver = has(/(^|\/)version\.(js|ts|json)$/);
  add(ver.length > 0 || !!pkg.version, 8, "Versione in un posto solo", ver[0] || (pkg.version ? `package.json ${pkg.version}` : "manca"));

  // 9. Tour / novità
  add(has(/tour|news|novit|changelog|whats-?new/i).length > 0, 9, "Tour o novità per chi aggiorna", "");

  // 10. Deploy e repo
  const wf = has(/^\.github\/workflows\/.+\.ya?ml$/);
  add(grep(wf, /deploy-pages|pages/).length > 0, 10, "Deploy su GitHub Pages", grep(wf, /deploy-pages|pages/)[0] || "nessun workflow Pages");
  add(files.includes("LICENSE") || files.includes("LICENSE.md"), 10, "LICENSE", "");

  // Agenti
  add(files.includes("AGENTS.md") || files.includes("CLAUDE.md"), 0, "Guida per agenti (AGENTS.md o CLAUDE.md)", "");
  let plugin = false;
  try { plugin = !!JSON.parse(text(".claude/settings.json")).enabledPlugins?.["app-forge@app-forge"]; } catch {}
  add(plugin, 0, "Plugin app-forge attivo", plugin ? "" : "npx github:Marketto/app-forge attiva-plugin");

  return { dir, app: path.basename(dir), stack: usesVitePwa || vite.length ? "Vite" : files.includes("Package.swift") || has(/Cargo\.toml$/).length ? "nativa" : "senza build", controlli: out };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("controlla-app.mjs")) {
  const args = process.argv.slice(2);
  const r = controlla(args.find(a => !a.startsWith("--")) || ".");
  if (args.includes("--json")) console.log(JSON.stringify(r, null, 2));
  else {
    const ko = r.controlli.filter(c => c.ok === false);
    const known = r.controlli.filter(c => c.ok !== null);
    console.log(`# ${r.app} (${r.stack}) — ${known.length - ko.length}/${known.length} ok\n`);
    for (const c of r.controlli) console.log(`${c.ok ? "✅" : c.ok === null ? "❔" : "⚠️ "} ${c.regola ? `[regola ${c.regola}] ` : ""}${c.cosa}${c.dettaglio ? ` — ${c.dettaglio}` : ""}`);
    console.log("\nÈ un controllo veloce sui file: conferma ogni punto leggendo il codice prima di cambiarlo.");
  }
}
