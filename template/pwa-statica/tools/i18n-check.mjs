// R08: ogni lingua in locales/ ha le stesse chiavi e gli stessi segnaposto {…} di en.json.
//   node tools/i18n-check.mjs          struttura delle lingue presenti
//   node tools/i18n-check.mjs --tutte  in più: devono esserci tutte le lingue di LINGUE (js/i18n.js)
import fs from "node:fs";
import { LINGUE } from "../js/i18n.js";
const dir = new URL("../locales/", import.meta.url);
const ref = JSON.parse(fs.readFileSync(new URL("en.json", dir), "utf8"));
const ph = s => (String(s).match(/\{\w+\}/g) || []).sort().join(",");
const present = fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => f.slice(0, -5));
let bad = 0;
const say = m => { bad++; console.log(m); };
for (const code of present) {
  if (!LINGUE[code]) say(`${code}.json: lingua non in LINGUE (js/i18n.js)`);
  const d = JSON.parse(fs.readFileSync(new URL(`${code}.json`, dir), "utf8"));
  for (const k of Object.keys(ref)) {
    if (!(k in d)) say(`${code}.json: manca ${k}`);
    else if (ph(d[k]) !== ph(ref[k])) say(`${code}.json: segnaposto diversi in ${k}`);
  }
  for (const k of Object.keys(d)) if (!(k in ref)) say(`${code}.json: chiave in più ${k}`);
}
const missing = Object.keys(LINGUE).filter(c => !present.includes(c));
if (process.argv.includes("--tutte") && missing.length) say(`Lingue mancanti (${missing.length}/${Object.keys(LINGUE).length}): ${missing.join(" ")} → skill traduzioni`);
console.log(bad ? `Traduzioni: ${bad} problemi` : `Traduzioni OK (${present.length}/${Object.keys(LINGUE).length} lingue)`);
process.exit(bad ? 1 : 0);
