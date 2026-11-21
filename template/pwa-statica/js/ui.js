// Piccoli aiuti di interfaccia condivisi.
let timer;
/** Avviso breve in basso. action = { label, run } facoltativa. */
export function toast(text, action) {
  const el = document.getElementById("toast");
  el.replaceChildren(Object.assign(document.createElement("span"), { textContent: text }));
  if (action) { const b = document.createElement("button"); b.type = "button"; b.textContent = action.label; b.onclick = () => { el.hidden = true; action.run(); }; el.append(b); }
  el.hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => { el.hidden = true; }, action ? 12000 : 3500);
}
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
