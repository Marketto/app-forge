#!/usr/bin/env node
// Riga di comando di app-forge. Senza clonare:  npx github:Marketto/app-forge <comando>
//   nuova-app --id … --nome … --mascotte … --animale … --colore …   crea un'app nella cartella corrente
//   app                                                              elenco delle app del catalogo
//   mascotte                                                         animali già usati
//   regole                                                           regole comuni R01–R20 (skill regole-app)
//   controlla [cartella]                                             cosa manca a un'app esistente
//   attiva-plugin [cartella]                                         attiva il plugin in un repo esistente
//   revisione                                                        revisione in 2 giri con Claude Code (modello opus)
//   mcp                                                              avvia il server MCP (stdio)
//   catalogo | schermate                                             solo dentro il repo app-forge
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [cmd, ...rest] = process.argv.slice(2);
const node = (file, args) => process.exit(spawnSync(process.execPath, [path.join(ROOT, file), ...args], { stdio: "inherit" }).status ?? 1);
const catalog = () => JSON.parse(fs.readFileSync(path.join(ROOT, "catalog/apps.json"), "utf8"));

switch (cmd) {
  case "nuova-app": node("tools/nuova-app.mjs", rest); break;
  case "catalogo": node("tools/build-catalog.mjs", rest); break;
  case "schermate": node("tools/screenshots.mjs", rest); break;
  case "mcp": await import("./mcp-server.mjs"); break;
  case "revisione": {
    // Carica il plugin direttamente da questa copia di app-forge: niente da installare nel progetto.
    const r = spawnSync("claude", ["--model", "opus", "--plugin-dir", ROOT, "/app-forge:revisione", ...rest], { stdio: "inherit" });
    if (r.error) { console.error("Serve Claude Code: https://claude.com/claude-code (poi rilancia questo comando)."); process.exit(1); }
    process.exit(r.status ?? 0);
  }
  case "controlla": node("tools/controlla-app.mjs", rest.length ? rest : [process.cwd()]); break;
  case "attiva-plugin": node("tools/attiva-plugin.mjs", rest.length ? rest : [process.cwd()]); break;
  case "app":
    for (const a of catalog().apps) console.log(`${a.nome.padEnd(18)} ${a.url}`);
    break;
  case "mascotte":
    for (const a of catalog().apps) console.log(`${a.mascotte.animale.padEnd(20)} ${a.mascotte.nome} (${a.nome})`);
    break;
  case "regole":
    process.stdout.write(fs.readFileSync(path.join(ROOT, ".claude/skills/regole-app/SKILL.md"), "utf8"));
    break;
  default:
    console.log(`app-forge — comandi: nuova-app, controlla, revisione, attiva-plugin, app, mascotte, regole, mcp, catalogo, schermate
Esempio: npx github:Marketto/app-forge nuova-app --id volpe-note --nome "Volpe Note" --mascotte Kitsu --animale volpe --colore "#ffd6a5"`);
    process.exit(cmd ? 1 : 0);
}
