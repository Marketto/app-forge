import { test } from "node:test";
import assert from "node:assert/strict";
import { creaPagina, validaSpec } from "../tools/proposte.mjs";

const base = { titolo: "T", proposte: [{ id: "P1", titolo: "Uno", dopo: { html: "<p>ok</p>" } }] };

test("spec: segnala gli errori utili", () => {
  assert.deepEqual(validaSpec(base), []);
  const e = validaSpec({ proposte: [{ id: "P 1" }, { id: "P2", titolo: "x", varianti: [{ id: "A" }] }] });
  assert.ok(e.some(x => /titolo/.test(x)) && e.some(x => /caratteri/.test(x)) && e.some(x => /varianti\[0\]/.test(x)), e.join("; "));
  assert.throws(() => creaPagina({ titolo: "x", proposte: [] }), /Spec non valida/);
});

test("pagina: dati incorporati senza poter chiudere lo script", () => {
  const html = creaPagina({ ...base, titolo: "</script><script>alert(1)</script>" });
  assert.equal((html.match(/<\/script>/g) || []).length, 2, "solo i due script della pagina");
  assert.match(html, /Genera il prompt/);
  assert.match(html, /name="viewport"/);
});

import { execFileSync } from "node:child_process";
import fs from "node:fs";
test("catalogo: leone, versione, Condividi e modalità d'uso", () => {
  execFileSync("node", ["tools/build-catalog.mjs"]);
  const html = fs.readFileSync("_site/index.html", "utf8");
  const v = JSON.parse(fs.readFileSync(".claude-plugin/plugin.json", "utf8")).version;
  assert.match(html, new RegExp(`v${v.replace(/\./g, "\\.")}`));
  assert.match(html, /aria-label="Condividi"/);
  assert.match(html, /class="m-body"/);
  assert.match(html, /<ul class="modes">/);
  assert.doesNotMatch(html, /<ol/);
  assert.match(fs.readFileSync("_site/favicon.svg", "utf8"), /<svg/);
});
