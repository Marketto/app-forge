import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { controlla } from "../tools/controlla-app.mjs";
import { attivaPlugin } from "../tools/attiva-plugin.mjs";

test("attiva-plugin aggiunge il plugin senza toccare il resto", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "af-plug-"));
  fs.mkdirSync(path.join(dir, ".claude"));
  fs.writeFileSync(path.join(dir, ".claude/settings.json"), JSON.stringify({ model: "haiku", enabledPlugins: { "altro@x": true } }));
  attivaPlugin(dir);
  const s = JSON.parse(fs.readFileSync(path.join(dir, ".claude/settings.json"), "utf8"));
  assert.equal(s.model, "haiku");
  assert.equal(s.enabledPlugins["altro@x"], true);
  assert.equal(s.enabledPlugins["app-forge@app-forge"], true);
  assert.equal(s.extraKnownMarketplaces["app-forge"].source.repo, "Marketto/app-forge");
  assert.match(attivaPlugin(dir), /già attivo/);
});

test("controlla-app: il modello di app passa quasi tutto, una cartella vuota no", () => {
  const vuota = fs.mkdtempSync(path.join(os.tmpdir(), "af-vuota-"));
  const r0 = controlla(vuota);
  assert.ok(r0.controlli.filter(c => c.ok === false).length > 10);
  const r1 = controlla("template/pwa-statica");
  const ko = r1.controlli.filter(c => c.ok === false).map(c => c.cosa);
  // Il modello ha solo it/en (le altre 40 lingue si fanno per ogni app) e il plugin si attiva solo nelle app create.
  assert.deepEqual(ko.sort(), ["Plugin app-forge attivo", "Tutte le 42 lingue"].sort(), ko.join(", "));
});
