import { test } from "node:test";
import assert from "node:assert/strict";
import { makeBackup, readBackup } from "../js/logic/backup.js";

test("esporta e reimporta gli stessi dati", () => {
  const state = { items: [{ id: "a", text: "mele" }] };
  assert.deepEqual(readBackup(makeBackup("x", "0.1.0", state), "x"), state);
});

test("rifiuta file non validi o di un'altra app", () => {
  assert.throws(() => readBackup("non è json", "x"), /bad-json/);
  assert.throws(() => readBackup(makeBackup("altra", "0.1.0", { items: [] }), "x"), /bad-app/);
  assert.throws(() => readBackup(JSON.stringify({ app: "x", data: { items: [{ id: 1 }] } }), "x"), /bad-data/);
});
