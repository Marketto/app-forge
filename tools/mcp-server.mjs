#!/usr/bin/env node
// Server MCP di app-forge (stdio, senza dipendenze). Lo usano il plugin, .mcp.json e qualsiasi client MCP.
//   node tools/mcp-server.mjs        oppure   npx github:Marketto/app-forge mcp
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";
import { spawnSync } from "node:child_process";
import { controlla } from "./controlla-app.mjs";
import { attivaPlugin } from "./attiva-plugin.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const catalog = () => JSON.parse(read("catalog/apps.json"));

const TOOLS = [
  {
    name: "elenco_app",
    description: "Elenco delle app di Marketto nel catalogo: nome, url, repo, descrizione, mascotte, stack, stato.",
    inputSchema: { type: "object", properties: {} },
    run: () => JSON.stringify(catalog().apps.map(({ screenshot, iconaManuale, ...a }) => a), null, 2),
  },
  {
    name: "mascotte_usate",
    description: "Animali delle mascotte già usati. Una nuova app deve sceglierne uno diverso.",
    inputSchema: { type: "object", properties: {} },
    run: () => catalog().apps.map(a => `${a.mascotte.animale}: ${a.mascotte.nome} (${a.nome})`).join("\n"),
  },
  {
    name: "regole",
    description: "Regole comuni delle app di Marketto (PWA offline, mascotte, i18n, accessibilità, privacy, rilascio) con esempi.",
    inputSchema: { type: "object", properties: {} },
    run: () => read(".claude/skills/regole-app/SKILL.md") + "\n\n" + read("docs/CONVENZIONI.md"),
  },
  {
    name: "da_dove_copiare",
    description: "Tabella: per ogni funzione già fatta (sync cloud, OCR, tour, export Excel…) da quale app e file copiarla.",
    inputSchema: { type: "object", properties: {} },
    run: () => read("docs/APP.md"),
  },
  {
    name: "nuova_app",
    description: "Crea lo scheletro di una nuova app (PWA senza build con mascotte, lingue, tema, test, deploy, agenti) nella cartella indicata.",
    inputSchema: {
      type: "object",
      required: ["id", "nome", "colore", "dest"],
      properties: {
        id: { type: "string", description: "nome del repo: minuscole, numeri, trattini" },
        nome: { type: "string" },
        mascotte: { type: "string", description: "nome della mascotte" },
        animale: { type: "string", description: "animale non ancora usato (vedi mascotte_usate)" },
        colore: { type: "string", description: "colore principale #rrggbb" },
        categoria: { type: "string" },
        descrizione: { type: "string", description: "una riga" },
        dest: { type: "string", description: "cartella di destinazione (assoluta), vuota o inesistente; la cartella che la contiene deve esistere" },
        senza_mascotte: { type: "boolean", description: "R01: app senza mascotte (mascotte e animale allora non servono)" },
        musica: { type: "boolean", description: "R16: musica di sottofondo con interruttore" },
        sync: { type: "array", items: { enum: ["dropbox", "gdrive", "webdav"] }, description: "R18: salvataggio cloud facoltativo" },
        goatcounter: { type: "string", description: "R15: codice del sito GoatCounter per le statistiche anonime" },
      },
    },
    run: a => {
      if (!fs.existsSync(path.dirname(path.resolve(a.dest)))) throw new Error(`La cartella ${path.dirname(path.resolve(a.dest))} non esiste.`);
      if (!a.senza_mascotte && (!a.mascotte || !a.animale)) throw new Error("Servono mascotte e animale (oppure senza_mascotte: true).");
      const args = ["--id", a.id, "--nome", a.nome, "--colore", a.colore, "--dest", a.dest, "--prova"];
      if (a.senza_mascotte) args.push("--senza-mascotte"); else args.push("--mascotte", a.mascotte, "--animale", a.animale);
      if (a.musica) args.push("--musica");
      if (a.sync?.length) args.push("--sync", a.sync.join(","));
      if (a.goatcounter) args.push("--goatcounter", a.goatcounter);
      if (a.categoria) args.push("--categoria", a.categoria);
      if (a.descrizione) args.push("--descrizione", a.descrizione);
      const r = spawnSync(process.execPath, [path.join(ROOT, "tools/nuova-app.mjs"), ...args], { encoding: "utf8", cwd: path.dirname(path.resolve(a.dest)) });
      if (r.error || r.status !== 0) throw new Error(r.error?.message || r.stderr || r.stdout || "nuova-app non riuscito");
      return r.stdout + "\nPer il catalogo: aggiungi l'app in app-forge con la skill `catalogo`.";
    },
  },
];

TOOLS.push(
  {
    name: "controlla_app",
    description: "Controllo veloce di un'app rispetto alle regole R01–R20. Per ogni controllo ok: true (fatto), false (manca), null (da verificare a mano), \"na\" (non serve per quest'app).",
    inputSchema: { type: "object", required: ["cartella"], properties: { cartella: { type: "string", description: "percorso assoluto del repo dell'app" } } },
    run: a => JSON.stringify(controlla(a.cartella), null, 2),
  },
  {
    name: "attiva_plugin",
    description: "Attiva il plugin app-forge di Claude Code in un repo esistente (.claude/settings.json), senza toccare le altre impostazioni.",
    inputSchema: { type: "object", required: ["cartella"], properties: { cartella: { type: "string", description: "percorso assoluto del repo" } } },
    run: a => attivaPlugin(a.cartella),
  },
);

const PROMPTS = [
  {
    name: "crea_app",
    description: "Avvia la creazione di una nuova app con le regole di app-forge.",
    arguments: [{ name: "idea", description: "cosa deve fare l'app", required: true }],
    text: ({ idea }) => `Voglio una nuova app: ${idea}
Usa gli strumenti di app-forge: leggi «regole», «da_dove_copiare» e «mascotte_usate».
Proponimi un piano breve (cosa fa, dati, schermate, stack) e 3 mascotte con animali non usati.
Aspetta la mia scelta, poi crea lo scheletro con «nuova_app».`,
  },
  {
    name: "migliora_app",
    description: "Propone e applica miglioramenti a un'app esistente secondo le regole di app-forge.",
    arguments: [{ name: "cartella", description: "percorso del repo dell'app", required: true }],
    text: ({ cartella }) => `Migliora l'app in ${cartella} con app-forge.
1. Leggi CLAUDE.md/AGENTS.md dell'app: le sue regole vincono su quelle comuni.
2. Usa «controlla_app» e «regole»; conferma ogni punto nel codice.
3. Proponimi al massimo 7 miglioramenti in ordine di importanza (privacy, offline, accessibilità, lingue, test, stile, tour), con lavoro stimato e da dove copiarli («da_dove_copiare»).
4. Aspetta la mia scelta, poi un miglioramento alla volta, con test e un commit ciascuno.`,
  },
];

const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];
const send = msg => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...msg }) + "\n");

async function handle(req) {
  const { id, method, params = {} } = req;
  switch (method) {
    case "initialize":
      return { protocolVersion: SUPPORTED.includes(params.protocolVersion) ? params.protocolVersion : SUPPORTED[0], capabilities: { tools: {}, prompts: {} },
        serverInfo: { name: "app-forge", version: JSON.parse(read(".claude-plugin/plugin.json")).version } };
    case "ping": return {};
    case "tools/list": return { tools: TOOLS.map(({ run, ...t }) => t) };
    case "tools/call": {
      const tool = TOOLS.find(t => t.name === params.name);
      if (!tool) throw Object.assign(new Error(`Strumento sconosciuto: ${params.name}`), { code: -32602 });
      try { return { content: [{ type: "text", text: await tool.run(params.arguments || {}) }] }; }
      catch (e) { return { content: [{ type: "text", text: String(e.message || e) }], isError: true }; }
    }
    case "prompts/list": return { prompts: PROMPTS.map(({ text, ...p }) => p) };
    case "prompts/get": {
      const p = PROMPTS.find(x => x.name === params.name);
      if (!p) throw Object.assign(new Error(`Prompt sconosciuto: ${params.name}`), { code: -32602 });
      return { messages: [{ role: "user", content: { type: "text", text: p.text(params.arguments || {}) } }] };
    }
    default: throw Object.assign(new Error(`Metodo non gestito: ${method}`), { code: -32601 });
  }
}

readline.createInterface({ input: process.stdin }).on("line", async line => {
  if (!line.trim()) return;
  let req;
  try { req = JSON.parse(line); } catch { return send({ id: null, error: { code: -32700, message: "JSON non valido" } }); }
  if (Array.isArray(req)) return send({ id: null, error: { code: -32600, message: "Richieste in blocco non supportate" } });
  if (req.id === undefined) return; // notifiche (es. notifications/initialized)
  try { send({ id: req.id, result: await handle(req) }); }
  catch (e) { send({ id: req.id, error: { code: e.code || -32603, message: e.message } }); }
});
