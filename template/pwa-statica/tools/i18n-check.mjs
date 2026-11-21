// Ogni lingua in locales/ deve avere le stesse chiavi e gli stessi segnaposto {…} di en.json.
import fs from "node:fs";
const dir = "locales";
const ref = JSON.parse(fs.readFileSync(`${dir}/en.json`, "utf8"));
const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(",");
let bad = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
  for (const k of Object.keys(ref)) {
    if (!(k in d)) { bad++; console.log(`${f}: manca ${k}`); }
    else if (ph(d[k]) !== ph(ref[k])) { bad++; console.log(`${f}: segnaposto diversi in ${k}`); }
  }
  for (const k of Object.keys(d)) if (!(k in ref)) { bad++; console.log(`${f}: chiave in più ${k}`); }
}
console.log(bad ? `Traduzioni: ${bad} problemi` : "Traduzioni OK");
process.exit(bad ? 1 : 0);
