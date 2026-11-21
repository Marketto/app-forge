import { test } from "node:test";
import assert from "node:assert/strict";
import { pick, cmp, STEPS } from "../js/tour.js";

test("confronto di versioni", () => {
  assert.ok(cmp("0.10.0", "0.9.9") > 0);
  assert.equal(cmp("1.2.0", "1.2"), 0);
});

test("wizard: tutto al primo avvio, solo novità dopo un aggiornamento, niente se già visto", () => {
  const steps = [...STEPS, { id: "nuova", v: "0.2.0", sel: "#x" }];
  assert.deepEqual(pick("", "0.1.0", steps).map(s => s.id), STEPS.map(s => s.id));
  assert.deepEqual(pick("0.1.0", "0.2.0", steps).map(s => s.id), ["news", "nuova", "end"]);
  assert.deepEqual(pick("0.2.0", "0.2.0", steps), []);
});
