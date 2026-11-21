// R14: ogni lingua dell'app ha privacy e condizioni con la stessa struttura dell'inglese, lo scarico di
// responsabilità e nessuna parte da adattare rimasta tra [parentesi quadre].
//   node tools/legal-check.mjs [--tutte]   (--tutte: anche le parti [da adattare] bloccano)
import fs from "node:fs";
const dir = new URL("../locales/", import.meta.url), en = JSON.parse(fs.readFileSync(new URL("legal/en.json", dir), "utf8"));
const strict = process.argv.includes("--tutte");
let bad = 0;
const say = m => { bad++; console.log(m); };
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".json"))) {
  const p = new URL("legal/" + f, dir);
  if (!fs.existsSync(p)) { say(`manca locales/legal/${f}`); continue; }
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const k of ["privacy", "terms", "summary"]) if (!Array.isArray(d[k]) || d[k].length !== en[k].length) say(`legal/${f}: «${k}» diverso dall'inglese`);
  for (const k of ["title", "updated", "disclaimerTitle", "disclaimer", "approve"]) if (!d[k]) say(`legal/${f}: manca «${k}»`);
  if (strict && /\[[^\]]{8,}\]/.test(JSON.stringify(d))) say(`legal/${f}: c'è ancora una parte [da adattare] a quello che fa l'app`);
}
console.log(bad ? `Testi legali: ${bad} problemi` : "Testi legali OK");
process.exit(bad ? 1 : 0);
