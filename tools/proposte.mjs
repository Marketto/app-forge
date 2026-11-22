#!/usr/bin/env node
// Pagina delle proposte: per ogni proposta prima/dopo, varianti, scelta sì/no e indicazioni facoltative
// (con «sì»: migliorie; con «no»: cosa riprovare, senza indicazioni la proposta si scarta); alla fine genera il prompt di risposta da incollare a Claude. Un solo file HTML, senza dipendenze
// esterne: si apre dal PC o si pubblica (Artifact su claude.ai) per consultarla dal telefono.
//   node tools/proposte.mjs <spec.json> [-o proposte.html] [--app <cartella dell'app>]
// --app incorpora css/style.css, css/icons.css e il font di icone dell'app, così i «dopo» hanno l'aspetto vero.
// Formato di spec.json: vedi .claude/skills/proposte/SKILL.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function validaSpec(spec) {
  const err = [];
  if (!spec || typeof spec !== "object") return ["spec non è un oggetto"];
  if (!spec.titolo) err.push("manca «titolo»");
  if (!Array.isArray(spec.proposte) || !spec.proposte.length) err.push("serve almeno una proposta in «proposte»");
  const ids = new Set();
  for (const [i, p] of (spec.proposte || []).entries()) {
    const at = `proposte[${i}]`;
    if (!p.id || !/^[A-Za-z0-9_-]+$/.test(p.id)) err.push(`${at}: «id» mancante o con caratteri non ammessi`);
    if (ids.has(p.id)) err.push(`${at}: id «${p.id}» ripetuto`);
    ids.add(p.id);
    if (!p.titolo) err.push(`${at}: manca «titolo»`);
    if (!p.dopo && !(p.varianti || []).length) err.push(`${at}: serve «dopo» oppure «varianti»`);
    for (const [j, v] of (p.varianti || []).entries()) if (!v.id || !v.titolo || !v.dopo) err.push(`${at}.varianti[${j}]: servono id, titolo e dopo`);
  }
  return err;
}

/** Legge gli stili dell'app per mostrare i «dopo» con l'aspetto vero (font di icone incorporato). */
export function stiliApp(dir) {
  if (!dir) return "";
  const read = f => { try { return fs.readFileSync(path.join(dir, f), "utf8"); } catch { return ""; } };
  let css = read("css/icons.css") + "\n" + read("css/style.css");
  const font = path.join(dir, "fonts/app-icons.woff2");
  if (fs.existsSync(font)) css = css.replace(/url\(["']?\.\.\/fonts\/app-icons\.woff2["']?\)/g, `url(data:font/woff2;base64,${fs.readFileSync(font).toString("base64")})`);
  return css;
}

export function creaPagina(spec, { appCss = "" } = {}) {
  const errs = validaSpec(spec);
  if (errs.length) throw new Error("Spec non valida:\n- " + errs.join("\n- "));
  const data = JSON.stringify({ ...spec, appCss: (spec.css || "") + "\n" + appCss, creata: spec.data || new Date().toISOString().slice(0, 10) })
    .replace(/</g, "\\u003c"); // niente </script> dentro i dati
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Proposte · ${esc(spec.titolo)}</title>
<style>
:root { --bg:#fff7fb; --card:#fff; --ink:#3a2e4a; --muted:#6a5d7a; --line:#efd9e4; --accent:#c2416b; --on:#fff; --soft:#fde7ef;
  --ok:#2f7d4f; --mid:#9a5b00; --no:#b3261e; --r:20px; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root { --bg:#1d1a2b; --card:#2b2540; --ink:#f6eefc; --muted:#c9bddc; --line:#3d3456; --accent:#ff9cbd; --on:#2b1530; --soft:#3b2f52;
  --ok:#7ad3a0; --mid:#f3c46b; --no:#ff9b8f; color-scheme: dark; } }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.5 ui-rounded,"SF Pro Rounded","Nunito","Segoe UI",system-ui,sans-serif; }
:focus-visible { outline:3px solid var(--accent); outline-offset:2px; }
header, main, footer { max-width:1100px; margin:0 auto; padding:16px; }
header h1 { margin:0 0 4px; font-size:clamp(1.3rem,4vw,1.8rem); }
.muted { color:var(--muted); }
.ctx { background:var(--card); border:2px solid var(--line); border-radius:var(--r); padding:12px 16px; margin-top:12px; white-space:pre-line; }
.bar { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:2px solid var(--line); }
.bar-in { max-width:1100px; margin:0 auto; padding:8px 16px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.bar progress { flex:1; min-width:120px; height:10px; accent-color:var(--accent); }
.card { background:var(--card); border:2px solid var(--line); border-radius:var(--r); padding:16px; margin:16px 0; box-shadow:0 6px 18px rgb(120 60 100 / .1); }
.card h2 { margin:0; font-size:1.2rem; }
.tags { display:flex; flex-wrap:wrap; gap:6px; margin:6px 0; }
.tag { font-size:.75rem; font-weight:700; padding:2px 8px; border-radius:999px; background:var(--soft); }
.pc { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:8px; margin:8px 0; }
.pc div { border-radius:14px; padding:8px 12px; background:var(--bg); }
.pc ul { margin:4px 0 0; padding-left:1.1em; }
.seg { display:inline-flex; flex-wrap:wrap; gap:6px; margin:8px 0; }
.seg button, .dev button { min-height:44px; padding:0 14px; border-radius:12px; border:2px solid var(--line); background:var(--card); color:var(--ink); font:inherit; cursor:pointer; }
.seg button[aria-pressed=true], .dev button[aria-pressed=true] { background:var(--accent); color:var(--on); border-color:var(--accent); }
.dev { display:inline-flex; gap:6px; margin-left:8px; }
.views { display:grid; gap:12px; }
.views.side { grid-template-columns:1fr 1fr; }
@media (max-width:800px) { .views.side { grid-template-columns:1fr; } }
.view h3 { margin:0 0 6px; font-size:.95rem; }
.frame { border:2px solid var(--line); border-radius:16px; overflow:hidden; background:#fff; margin:0 auto; width:100%; }
.frame.phone { max-width:390px; }
.frame iframe { display:block; width:100%; height:560px; border:0; background:transparent; }
.frame img { display:block; width:100%; height:auto; }
.frame .txt { padding:12px; color:#3a2e4a; white-space:pre-line; }
fieldset { border:0; padding:0; margin:12px 0 0; }
legend { font-weight:700; margin-bottom:6px; }
.choices { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:8px; }
.choices label { display:flex; gap:10px; align-items:flex-start; min-height:44px; padding:10px 12px; border:2px solid var(--line); border-radius:14px; cursor:pointer; }
.choices input { width:22px; height:22px; margin:2px 0 0; accent-color:var(--accent); flex:none; }
.choices label:has(input:checked) { border-color:var(--accent); background:var(--soft); }
.hint { display:block; margin-top:12px; font-weight:700; font-size:.95rem; }
textarea { width:100%; min-height:84px; margin-top:6px; padding:10px 12px; border-radius:14px; border:2px solid var(--line); background:var(--bg); color:var(--ink); font:inherit; resize:vertical; }
.btn { min-height:48px; padding:0 22px; border-radius:999px; border:2px solid var(--accent); background:var(--accent); color:var(--on); font:inherit; font-weight:700; cursor:pointer; }
.btn.ghost { background:transparent; color:var(--ink); border-color:var(--line); }
.btns { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
#out { min-height:220px; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.9rem; }
.st-si { color:var(--ok); } .st-mod { color:var(--mid); } .st-no { color:var(--no); }
.toast { position:fixed; left:50%; bottom:20px; transform:translateX(-50%); background:var(--ink); color:var(--bg); padding:10px 16px; border-radius:12px; }
@media (prefers-reduced-motion: reduce) { * { transition:none !important; animation:none !important; } }
</style>
</head>
<body>
<header>
  <p class="muted" id="meta"></p>
  <h1 id="title"></h1>
  <div class="ctx" id="ctx" hidden></div>
</header>
<div class="bar"><div class="bar-in">
  <span id="count" aria-live="polite"></span>
  <progress id="prog" max="1" value="0" aria-label="Proposte decise"></progress>
  <a href="#finale">Vai al prompt ↓</a>
</div></div>
<main id="list"></main>
<footer>
  <section class="card" id="finale">
    <h2>Prompt di risposta</h2>
    <p class="muted">Per ogni proposta scegli sì o no. Con «sì» puoi aggiungere migliorie; con «no» puoi dire cosa riprovare (senza indicazioni la proposta si scarta). Poi genera il prompt e incollalo a Claude.</p>
    <label for="general"><strong>Note generali</strong> <span class="muted">(facoltative)</span></label>
    <textarea id="general" placeholder="Indicazioni che valgono per tutte le proposte…"></textarea>
    <div class="btns"><button class="btn" id="gen" type="button">Genera il prompt</button></div>
    <label class="sr" for="out" hidden>Prompt</label>
    <textarea id="out" readonly hidden aria-label="Prompt generato"></textarea>
    <div class="btns" id="outBtns" hidden>
      <button class="btn" id="copy" type="button">Copia</button>
      <button class="btn ghost" id="share" type="button">Condividi</button>
      <button class="btn ghost" id="reset" type="button">Ricomincia</button>
    </div>
  </section>
</footer>
<script id="data" type="application/json">${data}</script>
<script>
(() => {
  const S = JSON.parse(document.getElementById("data").textContent);
  const KEY = "proposte:" + (S.id || S.titolo);
  const $ = s => document.querySelector(s);
  const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === "text") e.textContent = v; else if (k.startsWith("on")) e[k] = v; else e.setAttribute(k, v); } e.append(...kids.filter(Boolean)); return e; };
  let st = {}; try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} refresh(); };
  const one = id => (st[id] ||= { scelta: "", variante: "", nota: "" });

  $("#title").textContent = S.titolo;
  $("#meta").textContent = [S.app, S.creata].filter(Boolean).join(" · ");
  if (S.contesto) { $("#ctx").hidden = false; $("#ctx").textContent = S.contesto; }

  // Contenuto di un «prima»/«dopo»: html (in un iframe isolato con gli stili dell'app), immagine o testo.
  function frame(c, mode) {
    const box = el("div", { class: "frame" + (mode === "phone" ? " phone" : "") });
    if (!c) { box.append(el("div", { class: "txt", text: "—" })); return box; }
    if (c.img) box.append(el("img", { src: c.img, alt: c.alt || "" }));
    else if (c.html != null) {
      const f = el("iframe", { title: c.alt || "anteprima", loading: "lazy", sandbox: "allow-same-origin" });
      f.srcdoc = '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + (S.appCss || "") + (c.css || "") + "</style><body>" + c.html;
      if (c.altezza) f.style.height = c.altezza + "px";
      box.append(f);
    } else box.append(el("div", { class: "txt", text: c.testo || "" }));
    return box;
  }

  S.proposte.forEach((p, n) => {
    const s = one(p.id);
    const card = el("section", { class: "card", id: "p-" + p.id, "aria-labelledby": "h-" + p.id });
    card.append(el("p", { class: "muted", text: "Proposta " + (n + 1) + " di " + S.proposte.length }), el("h2", { id: "h-" + p.id, text: p.titolo }));
    const tags = el("div", { class: "tags" });
    for (const t of [...(p.regole || []), p.lavoro && "lavoro: " + p.lavoro].filter(Boolean)) tags.append(el("span", { class: "tag", text: t }));
    card.append(tags);
    if (p.descrizione) card.append(el("p", { text: p.descrizione }));
    if ((p.pro || []).length || (p.contro || []).length) {
      const list = arr => el("ul", {}, ...(arr || []).map(x => el("li", { text: x })));
      card.append(el("div", { class: "pc" }, el("div", {}, el("strong", { text: "Pro" }), list(p.pro)), el("div", {}, el("strong", { text: "Contro" }), list(p.contro))));
    }
    // Vista prima/dopo
    const variants = p.varianti || [];
    let view = matchMedia("(min-width: 801px)").matches && p.prima ? "side" : "dopo", dev = p.dispositivo || "phone";
    const views = el("div", { class: "views" });
    const draw = () => {
      const v = variants.find(x => x.id === s.variante) || variants[0];
      const after = v ? v.dopo : p.dopo;
      views.className = "views" + (view === "side" ? " side" : "");
      views.replaceChildren();
      if ((view === "prima" || view === "side") && p.prima) views.append(el("div", { class: "view" }, el("h3", { text: "Prima" }), frame(p.prima, dev)));
      if (view === "dopo" || view === "side" || !p.prima) views.append(el("div", { class: "view" }, el("h3", { text: "Dopo" + (v ? " · " + v.titolo : "") }), frame(after, dev)));
    };
    const tabs = el("div", { class: "seg", role: "group", "aria-label": "Vista" });
    const mk = (id, label, group, get, set) => { const b = el("button", { type: "button", "aria-pressed": String(get() === id), text: label }); b.onclick = () => { set(id); [...group.children].forEach(x => x.setAttribute("aria-pressed", String(x === b))); draw(); }; return b; };
    if (p.prima) for (const [id, label] of [["prima", "Prima"], ["dopo", "Dopo"], ["side", "Affiancate"]]) tabs.append(mk(id, label, tabs, () => view, x => { view = x; }));
    const devs = el("div", { class: "dev", role: "group", "aria-label": "Dispositivo" });
    for (const [id, label] of [["phone", "Telefono"], ["pc", "Computer"]]) devs.append(mk(id, label, devs, () => dev, x => { dev = x; }));
    card.append(el("div", {}, tabs, devs), views);
    // Scelta
    const name = "c-" + p.id, fs = el("fieldset", {}, el("legend", { text: "La tua scelta" }));
    const choices = el("div", { class: "choices" });
    const opt = (val, label, extra) => {
      const i = el("input", { type: "radio", name, value: val });
      i.checked = s.scelta === val && (!extra || s.variante === extra);
      i.onchange = () => { s.scelta = val; s.variante = extra || ""; save(); draw(); };
      return el("label", {}, i, el("span", { text: label }));
    };
    if (variants.length) variants.forEach(v => choices.append(opt("si", "Sì, variante «" + v.titolo + "»", v.id)));
    else choices.append(opt("si", "Sì"));
    choices.append(opt("no", "No"));
    fs.append(choices);
    // Il campo cambia senso con la scelta: migliorie se «sì», nuovo tentativo se «no» (vuoto = scarta).
    const HINT = {
      "": ["Indicazioni (facoltative)", "Scegli sì o no, poi aggiungi indicazioni se vuoi…"],
      si: ["Indicazioni per migliorarla (facoltative)", "Es. «più spazio sopra», «colore più tenue»…"],
      no: ["Cosa provare invece (facoltativo: se lo lasci vuoto la proposta si scarta)", "Es. «prova con una lista a schede»…"],
    };
    const lab = el("label", { for: "t-" + p.id, class: "hint" });
    const ta = el("textarea", { id: "t-" + p.id });
    const hint = () => { const [l, ph] = HINT[s.scelta] || HINT[""]; lab.textContent = l; ta.placeholder = ph; };
    ta.value = s.nota; ta.oninput = () => { s.nota = ta.value; save(); };
    choices.addEventListener("change", hint); hint();
    fs.append(lab, ta);
    card.append(fs);
    $("#list").append(card);
    draw();
  });

  const general = $("#general");
  general.value = st._generali || ""; general.oninput = () => { st._generali = general.value; save(); };
  function refresh() {
    const done = S.proposte.filter(p => st[p.id]?.scelta).length;
    $("#count").textContent = done + " di " + S.proposte.length + " decise";
    $("#prog").max = S.proposte.length; $("#prog").value = done;
  }
  refresh();

  function prompt() {
    const L = [];
    L.push("Risposte alle proposte «" + S.titolo + "»" + (S.app ? " per " + S.app : "") + (S.id ? " (" + S.id + ")" : "") + ".");
    L.push("Procedi con la skill «proposte» dal passo 7: SÌ = realizza (con le migliorie, se ci sono); RIPROVA = nuova proposta secondo le indicazioni; SCARTA e NON DECISA = non fare.", "");
    S.proposte.forEach((p, n) => {
      const s = st[p.id] || {}; const v = (p.varianti || []).find(x => x.id === s.variante);
      const nota = (s.nota || "").trim().replace(/\\n+/g, " / ");
      const esito = s.scelta === "si" ? "SÌ" : s.scelta === "no" ? (nota ? "RIPROVA" : "SCARTA") : "NON DECISA";
      let r = (n + 1) + ". [" + p.id + "] " + p.titolo + ": " + esito;
      if (v && s.scelta === "si") r += " — variante «" + v.titolo + "» (" + v.id + ")";
      if (nota && s.scelta) r += "\\n   " + (s.scelta === "si" ? "Migliorie: " : "Prova invece: ") + nota;
      L.push(r);
    });
    if (st._generali && st._generali.trim()) L.push("", "Note generali: " + st._generali.trim());
    return L.join("\\n");
  }
  const toast = t => { const d = el("div", { class: "toast", role: "status", text: t }); document.body.append(d); setTimeout(() => d.remove(), 2500); };
  $("#gen").onclick = () => {
    const out = $("#out"); out.value = prompt(); out.hidden = false; $("#outBtns").hidden = false; out.focus(); out.select();
    const miss = S.proposte.filter(p => !st[p.id]?.scelta).length;
    if (miss) toast(miss + " proposte non decise: nel prompt risultano «non fare»");
  };
  $("#copy").onclick = async () => {
    const out = $("#out");
    try { await navigator.clipboard.writeText(out.value); toast("Prompt copiato"); }
    catch { out.focus(); out.select(); try { document.execCommand("copy"); toast("Prompt copiato"); } catch { toast("Seleziona il testo e copialo"); } }
  };
  // Dove la condivisione di sistema non c'è o è bloccata (pagine pubblicate su claude.ai) si copia il testo.
  $("#share").onclick = async () => {
    try { if (!navigator.share) throw 0; await navigator.share({ title: S.titolo, text: $("#out").value }); }
    catch (e) { if (e?.name !== "AbortError") $("#copy").click(); }
  };
  // Conferma dentro la pagina (confirm() è bloccato in alcune viste): secondo tocco entro 4 s.
  let armed = 0;
  $("#reset").onclick = () => {
    if (Date.now() - armed > 4000) { armed = Date.now(); $("#reset").textContent = "Tocca di nuovo per cancellare tutto"; setTimeout(() => { $("#reset").textContent = "Ricomincia"; }, 4000); return; }
    st = {}; save(); location.reload();
  };
})();
</script>
</body>
</html>
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const val = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const file = args.find((a, i) => !a.startsWith("-") && !["-o", "--app"].includes(args[i - 1]));
  if (!file) { console.error("Uso: node tools/proposte.mjs <spec.json> [-o proposte.html] [--app <cartella app>]"); process.exit(1); }
  let spec;
  try { spec = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.error(`Non riesco a leggere ${file}: ${e.message}`); process.exit(1); }
  try {
    const html = creaPagina(spec, { appCss: stiliApp(val("--app")) });
    const out = val("-o") || path.join(path.dirname(file), "proposte.html");
    fs.writeFileSync(out, html);
    console.log(`Proposte: ${spec.proposte.length} → ${out} (${Math.round(html.length / 1024)} KB)`);
  } catch (e) { console.error(e.message); process.exit(1); }
}
