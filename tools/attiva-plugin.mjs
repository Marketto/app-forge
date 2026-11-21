#!/usr/bin/env node
// Attiva il plugin app-forge in un repo esistente, senza toccare le altre impostazioni.
//   node tools/attiva-plugin.mjs [cartella]     (predefinita: cartella corrente)
import fs from "node:fs";
import path from "node:path";

export function attivaPlugin(dir = ".") {
  const file = path.join(path.resolve(dir), ".claude/settings.json");
  let s = {};
  if (fs.existsSync(file)) {
    try { s = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch { throw new Error(`${file} non è JSON valido: correggilo prima.`); }
  }
  const already = s.enabledPlugins?.["app-forge@app-forge"] === true && s.extraKnownMarketplaces?.["app-forge"];
  s.extraKnownMarketplaces = { ...s.extraKnownMarketplaces, "app-forge": { source: { source: "github", repo: "Marketto/app-forge" } } };
  s.enabledPlugins = { ...s.enabledPlugins, "app-forge@app-forge": true };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(s, null, 2) + "\n");
  return already ? `Il plugin era già attivo in ${file}.` : `Plugin attivo in ${file}. Fai commit del file: chi apre il repo con Claude Code se lo vedrà proporre.`;
}

if (process.argv[1]?.endsWith("attiva-plugin.mjs")) {
  try { console.log(attivaPlugin(process.argv[2] || ".")); } catch (e) { console.error(e.message); process.exit(1); }
}
