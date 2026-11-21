#!/usr/bin/env node
// Controlla un'app rispetto alle regole comuni R01–R20 (.claude/skills/regole-app/SKILL.md) e stampa cosa manca.
//   node tools/controlla-app.mjs [cartella] [--json]
// Controllo veloce sui file, senza browser: ✅ ok · ⚠️ manca · ❔ da verificare a mano · ➖ non serve per quest'app.
// È il punto di partenza delle skill migliora-app, verifica e revisione: ogni ⚠️ va confermato leggendo il codice.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["node_modules", "vendor", "dist", "build", ".git", "_site", "coverage", ".next", "target", "Pods", "DerivedData"]);
import { LINGUE as LINGUE_MAP } from "../template/pwa-statica/js/i18n.js";
export const LINGUE = Object.keys(LINGUE_MAP); // fonte unica: LINGUE del modello (R08)
const catalogo = () => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, "catalog/apps.json"), "utf8")).apps; } catch { return []; } };
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function controlla(dir) {
  dir = path.resolve(dir);
  const files = [];
  (function walk(d, depth) {
    if (depth > 7) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, depth + 1); else files.push(path.relative(dir, p));
    }
  })(dir, 0);
  const cache = new Map();
  const text = f => {
    if (!cache.has(f)) { let t = ""; try { const p = path.join(dir, f); if (fs.statSync(p).size < 512 * 1024) t = fs.readFileSync(p, "utf8"); } catch {} cache.set(f, t); }
    return cache.get(f);
  };
  const has = re => files.filter(f => re.test(f));
  const notTool = f => !/^(tools|tests?|scripts|\.claude|\.github|docs)\//.test(f);
  const code = has(/\.(js|mjs|jsx|ts|tsx|vue|svelte|html)$/).filter(notTool);
  const css = has(/\.(css|scss)$/);
  const any = (list, re) => list.some(f => re.test(text(f)));
  const pkg = files.includes("package.json") ? (() => { try { return JSON.parse(text("package.json")); } catch { return {}; } })() : {};
  const scripts = Object.entries(pkg.scripts || {}).map(([k, v]) => `${k} ${v}`);
  const out = [];
  const add = (ok, regola, cosa, dettaglio = "") => out.push({ ok, regola, cosa, dettaglio });
  const NA = "na";

  const vite = has(/^vite\.config\./);
  const vitePwa = any(vite, /VitePWA|vite-plugin-pwa/);
  const native = files.includes("Package.swift") || has(/Cargo\.toml$|\.xcodeproj\//).length > 0;
  const manifest = has(/manifest\.(webmanifest|json)$/).filter(f => !/package|tsconfig|i18n|locales|\.claude/.test(f));
  const manText = manifest.map(text).join("\n") + vite.map(text).join("\n");

  // R01–R02 Mascotte
  const known = catalogo().find(a => a.id.toLowerCase() === path.basename(dir).toLowerCase())?.mascotte?.nome;
  const knownRe = known && known !== "—" ? "|(^|/)" + reEsc(known.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()) + "[^/]*\\.(js|ts|tsx|mjs|svg|py)$" : "";
  const mascot = has(new RegExp(`mascot|mascotte${knownRe}`, "i")).filter(f => !/\.claude|\.md$/.test(f));
  const noMascot = any(has(/config\.(js|ts|json)$/), /mascot:\s*false/);
  if (noMascot) add(NA, 1, "Mascotte", "scelta: senza mascotte");
  else {
    add(mascot.length > 0, 1, "Mascotte da una fonte unica", mascot.slice(0, 2).join(", ") || "nessun file mascot*");
    add(any([...css, ...code], /@keyframes[^{]*(blink|breath|respir|ciglia|idle|bob|float)|animation:[^;]*(blink|breath|respir|idle)/i), 1, "Mascotte animata (respiro, ciglia…)", "");
    add(any(code, /pointermove|mousemove|deviceorientation/) && mascot.length > 0, 2, "Mascotte interattiva (occhi che seguono, reazioni al tocco)", "");
    const locs = has(/(^|\/)(locales|i18n|lang|lingue)\/(it|en)\.(json|js|ts)$/);
    add(any(locs, /(cheer|motiv|incoragg|mascot)[^"']*["']\s*:\s*["'][^"']*\|/i) || any(code, /cheer|motivat|incoragg/i), 2, "Frasi di incoraggiamento della mascotte", "");
  }

  // R03 Icone in font
  const fontIcons = has(/\.(woff2?|ttf)$/).filter(f => /icon|glyph|ic[-_]/i.test(f));
  add(fontIcons.length > 0 || any(css, /@font-face[^}]*icon/i), 3, "Icone in font", fontIcons[0] || "nessun font di icone");
  add(any(code, /aria-hidden=["']true["']/), 3, "Icone nascoste ai lettori di schermo (aria-hidden)", "");

  // R04–R06 Icona, installazione, aggiornamenti
  add(/maskable/.test(manText), 4, "Icona maskable", "");
  add((manifest.length > 0 || vitePwa) && /192/.test(manText) && /512/.test(manText), 5, "Manifest con icone 192 e 512", manifest[0] || (vitePwa ? "vite-plugin-pwa" : "manca"));
  add(any(code, /beforeinstallprompt/), 5, "Pulsante Installa", "");
  add(any(code, /navigator\.standalone|install\.ios|Add to Home Screen|schermata Home/i) || any(has(/(locales|i18n|lang)\/(it|en)\.json$/), /Home/), 5, "Indicazioni per iPhone/iPad", "");
  const sw = has(/(^|\/)(sw|service-worker)\.(js|ts)$/);
  add(sw.length > 0 || vitePwa || native, 6, "Funziona offline (service worker)", sw[0] || (vitePwa ? "vite-plugin-pwa" : native ? "app nativa" : "manca"));
  add(any([...code, ...vite], /updatefound|controllerchange|skipWaiting|autoUpdate|registerSW|onNeedRefresh/) || native, 6, "Aggiornamenti automatici", "");
  const ver = has(/(^|\/)version\.(js|ts|json)$/);
  add(ver.length > 0 || !!pkg.version, 6, "Versione in un posto solo", ver[0] || (pkg.version ? `package.json ${pkg.version}` : "manca"));

  // R07 Versione e Condividi
  add(any(code, /APP_VERSION|__APP_VERSION__|VITE_APP_VERSION|appVersion|version\.js/), 7, "Versione visibile nell'app", "");
  add(any(code, /navigator\.share/), 7, "Pulsante Condividi (navigator.share)", "");

  // R08 Lingue
  const LANG = /(^|\/)[a-z]{2,3}([-_][A-Za-z]{2,4})?\.(json|js|ts)$/;
  const byDir = {};
  for (const f of files) if (LANG.test(f) && !/test|legal|vendor|tesseract|audio|\.claude/i.test(f)) (byDir[path.dirname(f)] ||= []).push(path.basename(f));
  const [locDir, langs = []] = Object.entries(byDir).sort((a, b) => a[1].length - b[1].length).pop() || [];
  if (locDir && (langs.length >= 5 || /(^|\/)(locales|i18n|lang|lingue|translations)$/.test(locDir))) {
    const codes = langs.map(l => l.split(".")[0].toLowerCase().split(/[-_]/)[0]);
    const missing = LINGUE.filter(c => !codes.includes(c));
    add(missing.length === 0, 8, "Tutte le 42 lingue", missing.length ? `${langs.length} in ${locDir}; mancano ${missing.length}: ${missing.slice(0, 12).join(" ")}${missing.length > 12 ? " …" : ""}` : `${langs.length} in ${locDir}`);
    const ref = langs.find(l => l === "en.json") || langs.find(l => l === "it.json");
    if (ref) {
      const flat = (o, p = "") => Object.entries(o || {}).flatMap(([k, v]) => v && typeof v === "object" ? flat(v, p + k + ".") : [p + k]);
      const parse = f => { try { return JSON.parse(text(f)); } catch { return {}; } };
      const keys = flat(parse(`${locDir}/${ref}`));
      const gaps = langs.filter(l => l.endsWith(".json")).map(l => { const have = new Set(flat(parse(`${locDir}/${l}`))); return [l, keys.filter(k => !have.has(k)).length]; }).filter(([, n]) => n);
      add(gaps.length === 0, 8, "Chiavi allineate a " + ref, gaps.length ? gaps.slice(0, 5).map(([l, n]) => `${l}: −${n}`).join(", ") + (gaps.length > 5 ? ` … (+${gaps.length - 5})` : "") : "tutte");
    }
  } else {
    const single = has(/(^|\/)(locales|i18n|translations|strings)\.(js|ts|json)$/)[0];
    add(null, 8, "Tutte le 42 lingue", single ? `tutte in un file (${single}): contale leggendolo` : "non trovate: forse non tradotta, controlla");
  }
  add(any(code, /["']rtl["']|\.dir\s*=|\brtl\b/i), 8, "Arabo da destra a sinistra (rtl)", "");
  add(has(/i18n[-_]?check|check[-_]?i18n/i).length > 0 || scripts.some(s => /i18n/.test(s)), 8, "Controllo automatico traduzioni", "");

  // R09–R12 Accessibilità, temi, layout, semplicità
  add(any([...css, ...code], /prefers-reduced-motion|reducedMotion/), 9, "Riduci movimento", "");
  add(any(code, /aria-label/), 9, "Pulsanti con aria-label", "");
  add(has(/ui[-_]?audit|a11y|axe/i).length > 0 || "axe-core" in (pkg.devDependencies || {}), 9, "Controllo automatico accessibilità (axe)", "");
  add(any([...css, ...code], /prefers-color-scheme:\s*dark|data-theme=["']?dark|\.dark\b|theme.*dark/i), 10, "Tema scuro", "");
  add(any([...css, ...code], /prefers-contrast|data-theme=["']?contrast|high-?contrast|alto contrasto/i), 10, "Tema ad alto contrasto", "");
  add(any([...css, ...code], /data-theme=["']?cb|daltoni|colou?r-?blind|okabe|deuteran|protan/i), 10, "Tema per daltonici", "");
  let fixed = 0;
  for (const f of css) for (const line of text(f).split("\n")) if (/#[0-9a-f]{3,8}\b|rgb\(/i.test(line) && !/^\s*--|\[data-theme|:root/.test(line)) fixed++;
  add(fixed <= 10, 10, "Colori solo da variabili", `${fixed} righe CSS con colori fissi fuori dalle variabili`);
  add(any(has(/\.html$/), /name=["']viewport["']/) || native, 11, "Viewport per telefoni", "");
  add(has(/ui[-_]?audit|e2e|layout[-_]?check/i).filter(f => /\.(m?js|ts)$/.test(f)).length > 0, 11, "Controllo automatico layout (overflow, sovrapposizioni)", "");
  add(null, 12, "Semplice e intuitiva", "da valutare guardando l'app: un'azione principale per schermata, max 5 schede");

  // R13–R15 Wizard, legale, statistiche
  const tour = has(/tour|wizard|onboard|coach/i).filter(f => !/\.claude|\.md$|test/.test(f));
  add(tour.length > 0, 13, "Wizard con focus sugli elementi", tour[0] || "");
  add(tour.some(f => /seen|version|\bv:/.test(text(f))), 13, "Wizard una volta e solo novità dopo aggiornamento", "");
  const legal = has(/legal|privacy|terms|condizioni/i).filter(f => !/\.claude|privacy[-_]?check|test/.test(f));
  add(legal.length > 0, 14, "Privacy e condizioni d'uso", legal[0] || "");
  add(legal.some(f => /disclaimer|responsabilit|liability|garanzi/i.test(text(f))), 14, "Scarico di responsabilità", "");
  add(any(code, /POLICY_VERSION|policyVersion|legal.*version|accepted/i), 14, "Accettazione con versione del testo", "");
  const stats = any(code, /goatcounter|plausible|umami|simpleanalytics/i);
  add(stats, 15, "Statistiche anonime d'uso", "");
  if (stats) add(any(code, /consent|consenso|setConsent/i), 15, "Statistiche solo con consenso", "");

  // R16–R18 Facoltative
  const audio = any(code, /AudioContext|new Audio\(|\.mp3|\.ogg|<audio/);
  if (audio) add(any(code, /music|musica|aria-pressed|mute/i), 16, "Interruttore della musica", "");
  else add(NA, 16, "Musica", "l'app non ha audio (chiedi se la vuole)");
  const heavy = any(code, /tesseract|pdf\.?js|pdfjs|ffmpeg|\bocr\b|OffscreenCanvas|\.wasm/i);
  const worker = any(code, /new Worker\(|new SharedWorker\(|\?worker/);
  if (heavy || worker) add(worker, 17, "Elaborazioni in un Web Worker", worker ? "" : "l'app elabora file ma non usa Worker");
  else add(NA, 17, "Lavoro in background", "nessuna elaborazione pesante trovata");
  const sync = any(code, /dropbox|googleapis|drive\.google|webdav|remoteStorage/i);
  add(sync ? true : null, 18, "Salvataggio/condivisione dati", sync ? "cloud presente" : "solo locale: chiedi se serve Dropbox, Google Drive o WebDAV");
  add(any(code, /export|esporta/i) && any(code, /import\b(?!\s*[{*\w"'])|importa|readAsText|showOpenFilePicker/i), 18, "Esporta e importa da file", "");

  // R19 Codice
  add(has(/(^|\/)(tests?|__tests__)\/|\.test\.|\.spec\./).length > 0, 19, "Test della logica", scripts.find(s => s.startsWith("test ")) || "");
  add(has(/(^|\/)(logic|core|domain|lib)\//).filter(notTool).length > 0, 19, "Logica separata dalla UI", "");
  const big = code.filter(f => text(f).split("\n").length > 800);
  add(big.length === 0, 19, "Moduli piccoli (< 800 righe)", big.slice(0, 4).map(f => `${f} (${text(f).split("\n").length})`).join(", "));

  // R20 Repo e consegna
  add(has(/privacy[-_]?check|secrets?[-_]?check/i).length > 0 || scripts.some(s => /secret|privacy/.test(s)), 20, "Controllo dati sensibili", "");
  add(!has(/(^|\/)\.env($|\.)/).filter(f => !/example|sample/.test(f)).length, 20, "Nessun file .env nel repo", "");
  const wf = has(/^\.github\/workflows\/.+\.ya?ml$/);
  add(wf.some(f => /deploy-pages|pages/.test(text(f))) || native, 20, "Deploy su GitHub Pages", wf.find(f => /deploy-pages|pages/.test(text(f))) || "");
  add(files.includes("LICENSE") || files.includes("LICENSE.md"), 20, "LICENSE", "");

  // Agenti
  add(files.includes("AGENTS.md") || files.includes("CLAUDE.md"), 0, "Guida per agenti (AGENTS.md o CLAUDE.md)", "");
  let plugin = false;
  try { plugin = !!JSON.parse(text(".claude/settings.json")).enabledPlugins?.["app-forge@app-forge"]; } catch {}
  add(plugin, 0, "Plugin app-forge attivo", plugin ? "" : "npx github:Marketto/app-forge attiva-plugin");

  return { dir, app: path.basename(dir), stack: vitePwa || vite.length ? "Vite" : native ? "nativa" : "senza build", controlli: out };
}

export function formatta(r) {
  const ko = r.controlli.filter(c => c.ok === false), known = r.controlli.filter(c => c.ok === true || c.ok === false);
  const icon = c => (c.ok === true ? "✅" : c.ok === false ? "⚠️ " : c.ok === null ? "❔" : "➖");
  return [`# ${r.app} (${r.stack}) — ${known.length - ko.length}/${known.length} ok`, "",
    ...r.controlli.map(c => `${icon(c)} ${c.regola ? `R${String(c.regola).padStart(2, "0")} ` : ""}${c.cosa}${c.dettaglio ? ` — ${c.dettaglio}` : ""}`),
    "", "✅ ok · ⚠️ manca · ❔ da verificare a mano · ➖ non serve. Controllo veloce sui file: conferma ogni ⚠️ leggendo il codice."].join("\n");
}

if (process.argv[1]?.endsWith("controlla-app.mjs")) {
  const args = process.argv.slice(2);
  const r = controlla(args.find(a => !a.startsWith("--")) || ".");
  console.log(args.includes("--json") ? JSON.stringify(r, null, 2) : formatta(r));
}
