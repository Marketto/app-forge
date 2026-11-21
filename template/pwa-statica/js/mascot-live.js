// R01–R02: mascotte viva e interattiva. Respira, sbatte le ciglia (CSS), segue il dito con gli occhi,
// salta e incoraggia al tocco, si addormenta se non succede niente. Con «riduci movimento» resta ferma ma parla.
import { mascotSVG } from "./mascot.js";
import { t } from "./i18n.js";
import { reducedMotion } from "./ui.js";

export function mountMascot(el, bubble) {
  let mood = "happy", sleepTimer;
  const draw = m => { mood = m; el.innerHTML = mascotSVG({ mood: m }); };
  const jump = () => { if (reducedMotion()) return; el.classList.remove("jump"); void el.offsetWidth; el.classList.add("jump"); };
  const wake = () => { clearTimeout(sleepTimer); if (mood === "sleep") draw("happy"); sleepTimer = setTimeout(() => { draw("sleep"); bubble.textContent = t("mascot.ev.sleep"); }, 90_000); };

  /** Fa parlare la mascotte: event è una chiave mascot.ev.* (più varianti separate da «|»). */
  function say(event, m = "happy") { draw(m); bubble.textContent = t(`mascot.ev.${event}`); jump(); wake(); }

  // Occhi che seguono puntatore e dito (al massimo 2,5 unità, senza scatti).
  let raf = 0;
  addEventListener("pointermove", e => {
    if (reducedMotion() || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const p = el.querySelector(".m-pupils"); if (!p) return;
      const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.52);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(2.5, d / 60);
      p.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
    });
  }, { passive: true });

  const tap = () => say("cheer", Math.random() < 0.3 ? "wow" : "happy");
  el.addEventListener("click", tap);
  el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); } });
  addEventListener("pointerdown", wake, { passive: true });
  draw("happy"); wake();
  return { say, draw };
}
