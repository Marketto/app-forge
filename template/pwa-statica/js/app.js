import { APP_VERSION } from "./version.js";
import { t, setLang, preferred, LANGS } from "./i18n.js";
import { mascotSVG } from "./mascot.js";
import { load, save } from "./store.js";
import { addItem, removeItem } from "./logic/items.js";

let state = load();
const $ = s => document.querySelector(s);

function say(event, mood = "happy") {
  $("#bubble").textContent = t(`mascot.ev.${event}`);
  const m = $("#mascot");
  m.innerHTML = mascotSVG({ mood });
  m.classList.remove("pop"); void m.offsetWidth; m.classList.add("pop");
}

function render() {
  const ul = $("#list");
  ul.replaceChildren(...state.items.map(i => {
    const li = document.createElement("li");
    const span = document.createElement("span"); span.textContent = i.text;
    const del = document.createElement("button");
    del.type = "button"; del.textContent = "✕"; del.setAttribute("aria-label", t("home.remove", { item: i.text }));
    del.onclick = () => { state = removeItem(state, i.id); save(state); render(); say("removed", "think"); };
    li.append(span, del);
    return li;
  }));
  $("#count").textContent = t("home.count", { n: state.items.length });
}

async function start() {
  $("#ver").textContent = "v" + APP_VERSION;
  $("#logo").innerHTML = mascotSVG({ size: 36 });
  const sel = $("#lang");
  for (const [code, v] of Object.entries(LANGS)) sel.add(new Option(typeof v === "string" ? v : v.name, code));
  await setLang(preferred());
  sel.value = document.documentElement.lang;
  sel.onchange = async () => { await setLang(sel.value); render(); say("hello"); };

  const root = document.documentElement;
  try { const th = localStorage.getItem("__ID__:theme"); if (th) root.dataset.theme = th; } catch {}
  $("#theme").onclick = () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("__ID__:theme", root.dataset.theme); } catch {}
  };

  $("#add").onsubmit = e => {
    e.preventDefault();
    const before = state.items.length;
    state = addItem(state, $("#item").value);
    if (state.items.length > before) { save(state); $("#item").value = ""; render(); say("added"); }
  };
  render();
  say("hello");

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
}
start();
