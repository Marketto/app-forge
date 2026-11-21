import { test } from "node:test";
import { execFileSync } from "node:child_process";
test("tutte le lingue hanno le stesse chiavi e segnaposto", () => { execFileSync("node", ["tools/i18n-check.mjs"]); });
