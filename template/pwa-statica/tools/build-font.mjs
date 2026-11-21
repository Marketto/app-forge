// Font di icone "app-icons" da tools/icons/icons.mjs (metodo di Kapibo: tratti → contorni pieni con potrace).
// Uscita: fonts/app-icons.woff2, css/icons.css, fonts/anteprima.html. Uso: npm install && npm run font
// Uso in pagina: <i class="ic ic-share" aria-hidden="true"></i> dentro un pulsante con aria-label.
import fs from "node:fs";
import { Readable } from "node:stream";
import sharp from "sharp";
import potrace from "potrace";
import { SVGIcons2SVGFontStream } from "svgicons2svgfont";
import svg2ttf from "svg2ttf";
import ttf2woff2 from "ttf2woff2";
import { ICONS } from "./icons/icons.mjs";

const root = new URL("../", import.meta.url), S = 480;
const trace = buf => new Promise((res, rej) => potrace.trace(buf, { threshold: 140, turdSize: 6, optTolerance: 0.25, color: "#000", background: "transparent" }, (e, svg) => (e ? rej(e) : res(svg))));
// potrace usa evenodd; i font usano nonzero: si inverte il verso dei sotto-percorsi annidati un numero dispari di volte.
function nonzero(svg) {
  const d = svg.match(/ d="([^"]+)"/)?.[1]; if (!d) return svg;
  const subs = d.trim().split(/(?=M)/).map(sp => {
    const nums = sp.slice(1).replace(/[CL]/g, m => " " + m + " ").trim().split(/[\s,]+/);
    const start = [+nums[0], +nums[1]], segs = []; let i = 2, cur = start;
    while (i < nums.length) {
      const c = nums[i++];
      if (c === "C") { const pts = [0, 1, 2].map(k => [+nums[i + k * 2], +nums[i + k * 2 + 1]]); i += 6; segs.push({ t: "C", from: cur, pts }); cur = pts[2]; }
      else if (c === "L") { const pt = [+nums[i], +nums[i + 1]]; i += 2; segs.push({ t: "L", from: cur, pts: [pt] }); cur = pt; }
      else i++;
    }
    const poly = [start, ...segs.map(s => s.pts[s.pts.length - 1])];
    let area = 0; for (let k = 0; k < poly.length; k++) { const a = poly[k], b = poly[(k + 1) % poly.length]; area += a[0] * b[1] - b[0] * a[1]; }
    return { start, segs, poly, area };
  });
  const inside = (pt, poly) => { let c = false; for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) { const [xi, yi] = poly[a], [xj, yj] = poly[b]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const f = n => +n.toFixed(2);
  const out = subs.map((sp, k) => {
    const depth = subs.filter((o, j) => j !== k && Math.abs(o.area) > Math.abs(sp.area) && inside(sp.start, o.poly)).length;
    const rev = (sp.area > 0) !== (depth % 2 === 0);
    if (!rev) return "M" + sp.start.map(f).join(" ") + sp.segs.map(s => s.t + s.pts.map(p => p.map(f).join(" ")).join(" ")).join("");
    const r = sp.segs.slice().reverse(), end = r.length ? r[0].pts[r[0].pts.length - 1] : sp.start;
    return "M" + end.map(f).join(" ") + r.map(s => s.t === "C" ? "C" + [s.pts[1], s.pts[0], s.from].map(p => p.map(f).join(" ")).join(" ") : "L" + s.from.map(f).join(" ")).join("") + "Z";
  });
  return svg.replace(/ d="[^"]+"/, ` d="${out.map(x => x.endsWith("Z") ? x : x + "Z").join("")}"`).replace(/ fill-rule="evenodd"/, "");
}

const names = Object.keys(ICONS), glyphs = [];
for (const [i, name] of names.entries()) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 24 24"><rect width="24" height="24" fill="#fff"/>
    <g fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><style>.f{fill:#000;stroke:none}</style>${ICONS[name]}</g></svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  glyphs.push({ name, code: 0xe001 + i, svg: nonzero(await trace(png)) });
}
fs.mkdirSync(new URL("fonts/", root), { recursive: true });
const svgFont = await new Promise((res, rej) => {
  const chunks = [], st = new SVGIcons2SVGFontStream({ fontName: "app-icons", fontHeight: 1000, normalize: true, descent: 125, log: () => {} });
  st.on("data", c => chunks.push(c)).on("end", () => res(chunks.map(String).join(""))).on("error", rej);
  for (const g of glyphs) { const r = Readable.from([g.svg]); r.metadata = { name: g.name, unicode: [String.fromCodePoint(g.code)] }; st.write(r); }
  st.end();
});
const ttf = Buffer.from(svg2ttf(svgFont, { ts: 0 }).buffer);
fs.writeFileSync(new URL("fonts/app-icons.woff2", root), ttf2woff2(ttf));
fs.writeFileSync(new URL("css/icons.css", root), `/* Generato da tools/build-font.mjs: non modificare a mano. Uso: <i class="ic ic-share" aria-hidden="true"></i> */
@font-face { font-family: "app-icons"; src: url("../fonts/app-icons.woff2") format("woff2"); font-display: block; }
.ic { display: inline-block; font-family: "app-icons" !important; font-style: normal; font-weight: normal; line-height: 1; vertical-align: -0.14em; speak: never; -webkit-font-smoothing: antialiased; }
${glyphs.map(g => `.ic-${g.name}::before { content: "\\${g.code.toString(16)}"; }`).join("\n")}
`);
fs.writeFileSync(new URL("fonts/anteprima.html", root), `<!doctype html><meta charset="utf-8"><title>app-icons</title><link rel="stylesheet" href="../css/icons.css">
<style>body{font:14px system-ui;display:grid;grid-template-columns:repeat(auto-fill,110px);gap:10px;padding:20px}div{border:1px solid #ddd;border-radius:16px;padding:12px;text-align:center}.ic{font-size:40px;display:block;margin-bottom:6px}</style>
${glyphs.map(g => `<div><i class="ic ic-${g.name}"></i>${g.name}</div>`).join("")}`);
console.log(`app-icons: ${glyphs.length} icone, ${fs.statSync(new URL("fonts/app-icons.woff2", root)).size} byte`);
