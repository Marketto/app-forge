// Aggiorna icone e schermate del catalogo aprendo le app pubblicate.
//   node tools/screenshots.mjs            → tutte le app
//   node tools/screenshots.mjs Kapibo     → solo quella
//   --solo-icone / --solo-schermate
// Serve Playwright: `npm install` (dev) e `npx playwright install chromium`,
// oppure CHROMIUM_PATH=/percorso/di/chrome.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { apps } = JSON.parse(fs.readFileSync(path.join(ROOT, "catalog/apps.json"), "utf8"));
const args = process.argv.slice(2);
const only = args.filter(a => !a.startsWith("--"));
const doIcons = !args.includes("--solo-schermate");
const doShots = !args.includes("--solo-icone");

// Pulsanti dei benvenuti/consensi più comuni nelle app (se un'app non ha "passi" propri).
const GENERIC = /^\s*(Accetto.*|Iniziamo.*|Inizia.*|Salta.*|Cominciamo|Avanti.*|Chiudi|Fine|Ho capito.*|Più tardi|Non ora|No,? grazie|Rifiuta.*)\s*$/i;

async function clickText(pg, text) {
  const re = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  for (const loc of [pg.getByRole("button", { name: re }), pg.getByRole("checkbox", { name: re }), pg.getByLabel(re), pg.getByText(re)]) {
    const el = loc.first();
    try { if (await el.isVisible()) { await el.click({ timeout: 1500 }); return true; } } catch {}
  }
  return false;
}

async function genericClear(pg) {
  for (let i = 0; i < 10; i++) {
    await pg.waitForTimeout(600);
    for (const cb of await pg.locator("dialog[open] input[type=checkbox], [role=dialog] input[type=checkbox]").all()) {
      try { if (await cb.isVisible() && !(await cb.isChecked())) await cb.check({ timeout: 1000 }); } catch {}
    }
    let clicked = false;
    for (const b of await pg.getByRole("button", { name: GENERIC }).all()) {
      try { if (await b.isVisible() && await b.isEnabled()) { await b.click({ timeout: 1500 }); clicked = true; break; } } catch {}
    }
    if (!clicked) { await pg.keyboard.press("Escape"); }
  }
}

async function icon(browser, app) {
  const ctx = await browser.newContext();
  const pg = await ctx.newPage();
  await pg.goto(app.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  const href = await pg.evaluate(() => document.querySelector('link[rel="manifest"]')?.href);
  if (!href) { await ctx.close(); return "nessun manifest"; }
  const man = await (await pg.request.get(href)).json();
  // PNG più grande (non maskable); SVG solo se non c'è un PNG.
  const icons = (man.icons || []).filter(i => !/maskable/.test(i.purpose || ""));
  const px = i => parseInt(String(i.sizes || "").split("x")[0]) || 0;
  const pngs = icons.filter(i => /png/.test(i.type || i.src)).sort((a, b) => px(b) - px(a));
  const best = pngs[0] || icons.find(i => /svg/.test(i.type || i.src));
  if (!best) { await ctx.close(); return "nessuna icona"; }
  const src = new URL(best.src, href).href;
  await pg.setContent(`<body style="margin:0;background:transparent"><img id="i" src="${src}" style="width:256px;height:256px;display:block"></body>`);
  await pg.waitForFunction(() => document.getElementById("i").complete);
  await pg.locator("#i").screenshot({ path: path.join(ROOT, "site/icons", `${app.id}.png`), omitBackground: true });
  await ctx.close();
  return "icona ok";
}

async function shot(browser, app) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "it-IT", colorScheme: "light" });
  await ctx.route(/goatcounter|plausible|umami/, r => r.abort()); // il bot non deve finire nelle statistiche delle app
  const pg = await ctx.newPage();
  try { await pg.goto(app.url, { waitUntil: "networkidle", timeout: 45000 }); } catch {}
  await pg.waitForTimeout(2000);
  const passi = app.screenshot?.passi;
  // Prima i passi propri dell'app (testi da cliccare, in ordine), poi i benvenuti generici.
  for (const p of passi || []) { await clickText(pg, p); await pg.waitForTimeout(700); }
  if (app.screenshot?.generico !== false) await genericClear(pg);
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: path.join(ROOT, "site/screenshots", `${app.id}.jpg`), type: "jpeg", quality: 80 });
  await ctx.close();
  return "schermata ok";
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let bad = 0;
for (const app of apps.filter(a => !only.length || only.includes(a.id))) {
  if (app.stato === "nascosta") continue;
  const out = [];
  try { if (doIcons && !app.iconaManuale) out.push(await icon(browser, app)); } catch (e) { bad++; out.push("icona KO: " + e.message.split("\n")[0]); }
  try { if (doShots) out.push(await shot(browser, app)); } catch (e) { bad++; out.push("schermata KO: " + e.message.split("\n")[0]); }
  console.log(`${app.id}: ${out.join(" · ")}`);
}
await browser.close();
process.exit(bad ? 1 : 0);
