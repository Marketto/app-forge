import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

function client() {
  const p = spawn(process.execPath, ["tools/mcp-server.mjs"], { stdio: ["pipe", "pipe", "inherit"] });
  let buf = "", waiting = new Map(), n = 0;
  p.stdout.on("data", d => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) { const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); waiting.get(m.id)?.(m); }
  });
  const call = (method, params) => new Promise(r => { const id = ++n; waiting.set(id, r); p.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); });
  return { call, close: () => p.kill() };
}

test("server MCP: inizializza, elenca e usa gli strumenti", async () => {
  const c = client();
  const init = await c.call("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } });
  assert.equal(init.result.serverInfo.name, "app-forge");
  const { result } = await c.call("tools/list", {});
  assert.deepEqual(result.tools.map(t => t.name).sort(), ["attiva_plugin", "controlla_app", "da_dove_copiare", "elenco_app", "mascotte_usate", "nuova_app", "regole"]);
  const m = await c.call("tools/call", { name: "mascotte_usate", arguments: {} });
  assert.match(m.result.content[0].text, /capibara/);

  const dest = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "af-mcp-")), "gatto-prova");
  const r = await c.call("tools/call", { name: "nuova_app", arguments: { id: "gatto-prova", nome: "Gatto", mascotte: "Neko", animale: "gatto-prova", colore: "#ffe0a3", dest } });
  assert.ok(!r.result.isError, r.result.content[0].text);
  assert.ok(fs.existsSync(path.join(dest, "index.html")));
  const bad = await c.call("tools/call", { name: "nuova_app", arguments: { id: "x", nome: "X", mascotte: "Y", animale: "riccio", colore: "#ffffff", dest: dest + "-2" } });
  assert.ok(bad.result.isError);
  c.close();
});
