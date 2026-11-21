// Avvio dell'app: lingue, tema, mascotte, consenso, wizard, strumenti. La logica vive in js/logic/.
import { APP_VERSION } from "./version.js";
import { CONFIG } from "./config.js";
import { t, setLang, preferred, LINGUE, lang } from "./i18n.js";
import { getTheme, setTheme } from "./theme.js";
import { mascotSVG } from "./mascot.js";
import { mountMascot } from "./mascot-live.js";
import { toast } from "./ui.js";
import { share } from "./share.js";
import { setupInstall } from "./install.js";
import { setupUpdates } from "./update.js";
import { STEPS, pick, seen, markSeen, runTour } from "./tour.js";
import { gate, showLegal } from "./legal.js";
import * as usage from "./usage.js";
import { setMusic, wanted, playing } from "./music.js";
import { load, save } from "./store.js";
import { addItem, removeItem } from "./logic/items.js";
import { makeBackup, readBackup } from "./logic/backup.js";

const $ = s => document.querySelector(s);
let state = load();
let mascot = { say: (ev) => toast(t(`mascot.ev.${ev}`)) }; // senza mascotte i messaggi diventano avvisi

function render() {
  $("#list").replaceChildren(...state.items.map(i => {
    const li = document.createElement("li");
    const span = Object.assign(document.createElement("span"), { textContent: i.text });
    const del = document.createElement("button");
    del.type = "button"; del.className = "icon-btn"; del.setAttribute("aria-label", t("home.remove", { item: i.text }));
    del.innerHTML = '<i class="ic ic-trash" aria-hidden="true"></i>';
    del.onclick = () => { state = removeItem(state, i.id); save(state); render(); mascot.say("removed", "think"); };
    li.append(span, del);
    return li;
  }));
  $("#count").textContent = t("home.count", { n: state.items.length });
}

function setupSettings() {
  const dlg = $("#settings"), sel = $("#lang");
  for (const [code, v] of Object.entries(LINGUE)) sel.add(new Option(v.name, code));
  sel.value = lang();
  sel.onchange = async () => { await setLang(sel.value); render(); mascot.say("hello"); };
  const current = getTheme();
  dlg.querySelectorAll('input[name="theme"]').forEach(r => { r.checked = r.value === current; r.onchange = () => setTheme(r.value); });
  $("#statsRow").hidden = !usage.available();
  $("#stats").checked = usage.consent() === true;
  $("#stats").onchange = e => usage.setConsent(e.target.checked);
  $("#settingsBtn").onclick = () => dlg.showModal();
  $("#tourAgain").onclick = () => { dlg.close(); tour(STEPS); };
  // R18: esporta/importa da file
  $("#exportBtn").onclick = () => {
    const url = URL.createObjectURL(new Blob([makeBackup(CONFIG.id, APP_VERSION, state)], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: `${CONFIG.id}-${new Date().toISOString().slice(0, 10)}.json` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    usage.track("export");
  };
  $("#importBtn").onclick = () => $("#importFile").click();
  $("#importFile").onchange = async e => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    try { state = readBackup(await f.text(), CONFIG.id); save(state); render(); dlg.close(); mascot.say("imported", "wow"); usage.track("import"); }
    catch { toast(t("backup.bad")); }
  };
}

const tour = steps => runTour(steps, { mascotSvg: CONFIG.mascot ? mascotSVG({ size: 64 }) : "", onEnd: () => markSeen(APP_VERSION) });

async function start() {
  await setLang(preferred());
  setTheme(getTheme());
  $("#ver").textContent = t("ui.version", { v: APP_VERSION });

  if (CONFIG.mascot) {
    $("#logo").innerHTML = mascotSVG({ size: 44 });
    mascot = mountMascot($("#mascot"), $("#bubble"));
    $("#logo").onclick = () => mascot.say("cheer");
  } else {
    $(".hero").hidden = true;
    $("#logo").innerHTML = '<img src="icons/icon.svg" alt="" width="44" height="44">';
  }

  setupSettings();
  $("#share").onclick = async () => { if ((await share()) === "shared") usage.track("share"); };
  $("#help").onclick = () => tour(STEPS);
  $("#legalBtn").onclick = showLegal;
  setupInstall($("#install"), () => mascot.say("installed", "wow"));
  if (CONFIG.music) {
    const btn = $("#music");
    const paint = () => { btn.setAttribute("aria-pressed", String(playing())); btn.firstElementChild.className = `ic ic-${playing() ? "music" : "music-off"}`; };
    btn.hidden = false; btn.onclick = () => { setMusic(!playing()); paint(); }; paint();
    // I browser chiedono un tocco prima dell'audio: riaccende la musica al primo tocco, tranne sul suo pulsante.
    if (wanted()) addEventListener("pointerdown", e => { if (!btn.contains(e.target) && !playing()) { setMusic(true); paint(); } }, { once: true });
  }

  $("#add").onsubmit = e => {
    e.preventDefault();
    const before = state.items.length;
    state = addItem(state, $("#item").value);
    if (state.items.length > before) { save(state); $("#item").value = ""; render(); mascot.say("added"); usage.track("add"); }
    else mascot.say("empty", "think");
  };
  render();

  const ok = await gate({ mascotSvg: CONFIG.mascot ? mascotSVG({ size: 72 }) : "", askStats: usage.available() && usage.consent() === null });
  if (ok && usage.available()) usage.setConsent(ok.stats);
  usage.track("open");
  tour(pick(seen(), APP_VERSION));
  mascot.say("hello");
  setupUpdates();
}
start();
