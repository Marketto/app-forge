import { test } from "node:test";
import assert from "node:assert/strict";
import { contrast, iconBackground } from "../tools/colors.mjs";

test("contrasto WCAG: nero su bianco = 21", () => assert.equal(Math.round(contrast("#000000", "#ffffff")), 21));

test("lo sfondo dell'icona esalta la mascotte (contrasto ≥ 3:1)", () => {
  for (const body of ["#ffb38a", "#ffd9e8", "#a8e6cf", "#6a3fd8", "#23284f", "#ffffff"]) {
    assert.ok(contrast(body, iconBackground(body)) >= 3, `${body} → ${iconBackground(body)}`);
  }
});
