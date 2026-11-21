import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, removeItem } from "../js/logic/items.js";

test("aggiunge un elemento e ignora quelli vuoti", () => {
  let s = { items: [] };
  s = addItem(s, "  mele ", 1);
  s = addItem(s, "   ", 2);
  assert.deepEqual(s.items, [{ id: "1", text: "mele" }]);
});

test("toglie un elemento per id", () => {
  const s = removeItem({ items: [{ id: "a", text: "x" }, { id: "b", text: "y" }] }, "a");
  assert.deepEqual(s.items.map(i => i.id), ["b"]);
});
