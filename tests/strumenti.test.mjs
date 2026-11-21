import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const run = (args, cwd = process.cwd()) => spawnSync("node", args, { cwd, encoding: "utf8" });

test("il catalogo ha id unici e animali delle mascotte annotati", () => {
  const { apps } = JSON.parse(fs.readFileSync("catalog/apps.json", "utf8"));
  assert.equal(new Set(apps.map(a => a.id)).size, apps.length);
  for (const a of apps) assert.ok(a.mascotte?.animale, `${a.id} senza mascotte.animale`);
});

test("nuova-app: scelte senza mascotte, con musica e cloud finiscono in js/config.js", () => {
  const dest = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "af-scelte-")), "app");
  const r = run(["tools/nuova-app.mjs", "--id", "senza-m", "--nome", "Senza", "--senza-mascotte", "--musica", "--sync", "dropbox,webdav", "--colore", "#cce5ff", "--prova", "--dest", dest]);
  assert.equal(r.status, 0, r.stderr);
  const cfg = fs.readFileSync(path.join(dest, "js/config.js"), "utf8");
  assert.match(cfg, /"mascot": false/); assert.match(cfg, /"music": true/); assert.match(cfg, /"dropbox",\s*"webdav"/);
  assert.match(fs.readFileSync(path.join(dest, "docs/TODO.md"), "utf8"), /Salvataggio cloud/);
  const bad = run(["tools/nuova-app.mjs", "--id", "x2", "--nome", "X", "--senza-mascotte", "--sync", "ftp", "--colore", "#cce5ff", "--prova", "--dest", dest + "2"]);
  assert.notEqual(bad.status, 0);
});

test("nuova-app rifiuta un animale già usato", () => {
  const r = run(["tools/nuova-app.mjs", "--id", "x-prova", "--nome", "X", "--mascotte", "Y", "--animale", "Capibara", "--colore", "#ffd6a5", "--prova",
    "--dest", path.join(os.tmpdir(), "af-rifiuto")]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /già usato/);
});

test("nuova-app crea un'app che passa i suoi test", () => {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), "af-app-"));
  const r = run(["tools/nuova-app.mjs", "--id", "volpe-prova", "--nome", "Volpe Prova", "--mascotte", "Kitsu", "--animale", "volpe-prova",
    "--colore", "#ffd6a5", "--descrizione", "App di prova.", "--prova", "--dest", dest]);
  assert.equal(r.status, 0, r.stderr);
  const left = spawnSync("grep", ["-rlE", "__(ID|NOME|MASCOTTE|ANIMALE|COLORE|DESCRIZIONE|ANNO)__", dest], { encoding: "utf8" }).stdout.trim();
  assert.equal(left, "", "segnaposto non sostituiti");
  const t = spawnSync("node", ["--test", ...fs.readdirSync(path.join(dest, "tests")).map(f => "tests/" + f)], { cwd: dest, encoding: "utf8" });
  assert.equal(t.status, 0, t.stdout + t.stderr);
  assert.ok(fs.existsSync(path.join(dest, ".claude/skills/verifica/SKILL.md")));
  const cfg = fs.readFileSync(path.join(dest, "js/config.js"), "utf8");
  assert.match(cfg, /"mascot": true/);
  for (const f of ["tools/legal-check.mjs", "tools/ui-audit.mjs", "fonts/app-icons.woff2", "locales/legal/en.json"]) assert.ok(fs.existsSync(path.join(dest, f)), f);
  const legal = spawnSync("node", ["tools/legal-check.mjs"], { cwd: dest, encoding: "utf8" });
  assert.equal(legal.status, 0, legal.stdout);
  fs.rmSync(dest, { recursive: true, force: true });
});
