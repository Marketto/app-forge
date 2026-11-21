// Genera icone e favicon dalla mascotte (js/mascot.js). Serve Playwright (npm install).
//   node tools/icons.mjs        CHROMIUM_PATH=/percorso/chrome se Playwright non trova il browser
import fs from "node:fs";
import { chromium } from "playwright";
import { mascotSVG, COLORS } from "../js/mascot.js";

const bg = COLORS.body;
const inner = mascotSVG({ size: 120 }).replace(/<svg[^>]*>|<\/svg>/g, "");
// Icona: sfondo arrotondato chiaro + mascotte. Maskable: sfondo pieno, mascotte nell'80% centrale.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#fff8fb"/><g transform="translate(6 4) scale(.9)">${inner}</g></svg>`;
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${bg}"/><rect width="120" height="120" fill="#fff" opacity=".55"/><g transform="translate(18 16) scale(.7)">${inner}</g></svg>`;
fs.mkdirSync("icons", { recursive: true });
fs.writeFileSync("icons/icon.svg", icon);

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
for (const [name, svg, size] of [["icon-192.png", icon, 192], ["icon-512.png", icon, 512], ["maskable-512.png", maskable, 512]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body>`);
  await page.screenshot({ path: `icons/${name}`, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
await browser.close();
console.log("Icone OK → icons/");
