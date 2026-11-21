// R09–R11: controllo dell'interfaccia con Playwright + axe-core (WCAG 2.2 AA).
// Larghezze 320, 390, 768, 1280, 1920 · temi chiaro, scuro, alto contrasto, daltonici · più consenso e wizard.
// Per ogni stato: scorrimento orizzontale, controlli fuori schermo, controlli sovrapposti, bersagli < 44 px, regole axe.
//   node tools/ui-audit.mjs [--shots cartella] [--quick]     → «UI OK» oppure un problema per riga (uscita 1)
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { createRequire } from "node:module";

const ROOT = process.cwd();
const AXE = await readFile(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const SHOTS = arg("--shots"), QUICK = process.argv.includes("--quick");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const srv = createServer(async (q, s) => {
  const p = decodeURIComponent(new URL(q.url, "http://x").pathname);
  try { const b = await readFile(join(ROOT, p.endsWith("/") ? p + "index.html" : p)); s.writeHead(200, { "content-type": MIME[extname(p)] || "text/html" }); s.end(b); }
  catch { s.writeHead(404); s.end(); }
}).listen(0);
const URL0 = `http://localhost:${srv.address().port}/`;
const ID = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8")).name;
const WIDTHS = QUICK ? [390, 1280] : [320, 390, 768, 1280, 1920];
const THEMES = QUICK ? ["light", "dark"] : ["light", "dark", "contrast", "cb"];
const issues = new Map();
const add = (k, v) => { if (!issues.has(k)) issues.set(k, v); };

// Eseguito nella pagina: problemi di layout.
const layout = () => {
  const out = [], W = innerWidth, name = el => (el.getAttribute("aria-label") || el.textContent || el.id || el.tagName).trim().slice(0, 30);
  if (document.documentElement.scrollWidth > W + 1) out.push(`scorrimento orizzontale (${document.documentElement.scrollWidth}px > ${W}px)`);
  const ctl = [...document.querySelectorAll("button, a[href], input:not([type=hidden]), select, textarea, [role=button]")]
    .filter(el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width && r.height && cs.visibility !== "hidden" && !el.closest(".skip,[hidden]"); });
  const top = document.querySelector("dialog[open], .tour");
  const scope = top ? ctl.filter(el => top.contains(el)) : ctl;
  for (const el of scope) {
    const r = el.getBoundingClientRect();
    if (r.right > W + 1 || r.left < -1) out.push(`fuori schermo: ${name(el)}`);
    const small = el.matches("input[type=radio], input[type=checkbox]") ? false : (r.width < 43.5 || r.height < 43.5);
    if (small && !el.closest("p, li > span")) out.push(`bersaglio < 44px: ${name(el)} (${Math.round(r.width)}×${Math.round(r.height)})`);
  }
  for (let i = 0; i < scope.length; i++) for (let j = i + 1; j < scope.length; j++) {
    const a = scope[i].getBoundingClientRect(), b = scope[j].getBoundingClientRect();
    if (scope[i].contains(scope[j]) || scope[j].contains(scope[i]) || scope[i].closest("label") === scope[j].closest("label") && scope[i].closest("label")) continue;
    const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ox > 2 && oy > 2) out.push(`sovrapposti: ${name(scope[i])} / ${name(scope[j])}`);
  }
  return out;
};

async function audit(page, where) {
  for (const p of await page.evaluate(layout)) add(`${where}: ${p}`.replace(/@\d+px/, ""), `${where} · ${p}`);
  await page.addScriptTag({ content: AXE });
  const res = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations
    .map(v => ({ id: v.id, n: v.nodes.length, t: v.nodes[0]?.target?.join(" ") })));
  for (const v of res) add(`axe ${v.id} ${where.split("@")[0]}`, `${where} · axe ${v.id} (${v.n}): ${v.t}`);
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
if (SHOTS) await mkdir(SHOTS, { recursive: true });
for (const theme of THEMES) for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 700 ? 780 : 900 }, locale: "it-IT", reducedMotion: "reduce" });
  await ctx.addInitScript(([id, th]) => { if (!localStorage.getItem(`${id}:theme`)) localStorage.setItem(`${id}:theme`, th); }, [ID, theme]);
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto(URL0); await page.waitForTimeout(600);
  // Primo avvio: consenso (solo una volta per tema, a 390 px).
  if (w === 390) {
    if (await page.locator("dialog#gate[open]").count()) {
      await audit(page, `consenso ${theme}@${w}`);
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/consenso-${theme}-${w}.png` });
      await page.check("#gateOk"); await page.check("#gateDisc"); await page.click("#gateGo"); await page.waitForTimeout(400);
    }
    if (await page.locator(".tour").count()) {
      await page.click('.tour [data-t="next"]'); await page.waitForTimeout(300);
      await audit(page, `wizard ${theme}@${w}`);
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/wizard-${theme}-${w}.png` });
    }
  }
  while (await page.locator("dialog#gate[open]").count()) { await page.check("#gateOk"); await page.check("#gateDisc"); await page.click("#gateGo"); await page.waitForTimeout(300); }
  while (await page.locator(".tour").count()) { await page.keyboard.press("Escape"); await page.waitForTimeout(150); }
  await page.fill("#item", "Elemento di prova con un nome abbastanza lungo da andare a capo"); await page.click("#add button[type=submit]"); await page.waitForTimeout(200);
  await audit(page, `principale ${theme}@${w}`);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/principale-${theme}-${w}.png`, fullPage: true });
  await page.click("#settingsBtn"); await page.waitForTimeout(200);
  await audit(page, `impostazioni ${theme}@${w}`);
  if (SHOTS && w === 390) await page.screenshot({ path: `${SHOTS}/impostazioni-${theme}-${w}.png` });
  for (const e of errors) add(`errore ${e}`, `errore JavaScript: ${e}`);
  await ctx.close();
}
await browser.close(); srv.close();
if (issues.size) { for (const v of issues.values()) console.log(v); console.log(`UI: ${issues.size} problemi`); process.exit(1); }
console.log(`UI OK (${WIDTHS.length} larghezze × ${THEMES.length} temi)`);
