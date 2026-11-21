// R13: wizard. Al primo avvio tutti i passi, dopo un aggiornamento solo quelli nuovi (v = versione di arrivo).
// Ogni passo mette a fuoco un elemento (sel) con una nuvoletta della mascotte. Pulsante «?» per rivederlo.
// Funzione nuova visibile = un passo nuovo qui, con v = la versione che la porta (R13, skill rilascio).
import { t } from "./i18n.js";
import { reducedMotion } from "./ui.js";

export const STEPS = [
  { id: "welcome", v: "0.1.0" },
  { id: "mascot", v: "0.1.0", sel: "#mascot" },
  { id: "add", v: "0.1.0", sel: "#add" },
  { id: "tools", v: "0.1.0", sel: ".tools" },
  { id: "end", v: "0.1.0" },
];
const KEY = "__ID__:tourSeen";
export const cmp = (a, b) => { const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); return 0; };
/** Passi da mostrare: tutti se seen è vuoto, altrimenti solo seen < v ≤ current (con «novità» in testa). */
export function pick(seen, current, steps = STEPS) {
  if (!seen) return steps.filter(s => cmp(s.v, current) <= 0);
  const news = steps.filter(s => cmp(s.v, seen) > 0 && cmp(s.v, current) <= 0 && s.id !== "welcome" && s.id !== "end");
  return news.length ? [{ id: "news" }, ...news, { id: "end" }] : [];
}
export const seen = () => { try { return localStorage.getItem(KEY) || ""; } catch { return ""; } };
export const markSeen = v => { try { localStorage.setItem(KEY, v); } catch {} };

export function runTour(steps, { mascotSvg = "", onEnd } = {}) {
  if (!steps.length) return;
  const box = document.createElement("div");
  box.className = "tour"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "tourT");
  box.innerHTML = `<div class="tour-hole" aria-hidden="true"></div><div class="tour-card"><div class="tour-mascot" aria-hidden="true">${mascotSvg}</div>
    <h2 id="tourT"></h2><p id="tourP"></p><div class="tour-dots" aria-hidden="true"></div><p class="sr" id="tourN" aria-live="polite"></p>
    <div class="btns"><button type="button" class="btn ghost" data-t="skip"></button><button type="button" class="btn soft" data-t="prev"></button><button type="button" class="btn" data-t="next"></button></div></div>`;
  document.body.append(box);
  const hole = box.querySelector(".tour-hole"), card = box.querySelector(".tour-card"), $ = s => box.querySelector(s);
  let i = 0; const back = document.activeElement;

  async function show(dir = 1) {
    const s = steps[i], el = s.sel && document.querySelector(s.sel);
    if (s.sel && (!el || !el.getClientRects().length)) { const d = dir || 1; i += d; if (i < 0) { i = 0; return show(1); } return i >= steps.length ? end() : show(d); }
    $("#tourT").textContent = t(`tour.${s.id}.t`);
    $("#tourP").textContent = t(`tour.${s.id}.p`);
    $("#tourN").textContent = t("tour.step", { i: i + 1, n: steps.length });
    $(".tour-dots").innerHTML = steps.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("");
    $('[data-t="prev"]').hidden = i === 0;
    $('[data-t="skip"]').hidden = i === steps.length - 1;
    $('[data-t="next"]').textContent = t(i === steps.length - 1 ? "tour.done" : "tour.next");
    $('[data-t="prev"]').textContent = t("tour.prev");
    $('[data-t="skip"]').textContent = t("tour.skip");
    if (el) {
      el.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
      await new Promise(r => setTimeout(r, reducedMotion() ? 0 : 300));
      const r = el.getBoundingClientRect(), pad = 8;
      Object.assign(hole.style, { display: "block", left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
      const h = card.offsetHeight || 200, below = r.bottom + pad + 16 + h < innerHeight;
      card.style.top = below ? r.bottom + pad + 16 + "px" : Math.max(16, r.top - pad - 16 - h) + "px";
      box.classList.add("spot");
    } else { hole.style.display = "none"; card.style.top = ""; box.classList.remove("spot"); }
    card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop");
    $('[data-t="next"]').focus();
  }
  function end() { box.remove(); removeEventListener("keydown", key, true); removeEventListener("resize", re); back?.focus?.(); onEnd?.(); }
  function key(e) {
    if (e.key === "Escape") { e.preventDefault(); end(); }
    if (e.key === "Tab") { const f = [...card.querySelectorAll("button:not([hidden])")], a = f.indexOf(document.activeElement); e.preventDefault(); f[(a + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
  }
  const re = () => show(0);
  box.addEventListener("click", e => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    if (b.dataset.t === "skip") return end();
    if (b.dataset.t === "prev") { i = Math.max(0, i - 1); return show(-1); }
    if (++i >= steps.length) return end();
    show(1);
  });
  addEventListener("keydown", key, true); addEventListener("resize", re);
  show(1);
}
