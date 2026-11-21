// R16: musica di sottofondo a tema (facoltativa, CONFIG.music). Spenta finché l'utente non la accende;
// la scelta resta ricordata. Melodia dolce generata con WebAudio: nessun file da scaricare.
// Per una musica vera: metti un file in assets/music.mp3 e usa MUSIC_URL.
const KEY = "__ID__:music";
const MUSIC_URL = ""; // es. "assets/music.mp3"
let ctx, timer, audio, on = false;
const NOTES = [0, 4, 7, 12, 7, 4, 2, 5, 9, 12, 9, 5]; // arpeggio pentatonico, ritmo lento
export const wanted = () => { try { return localStorage.getItem(KEY) === "on"; } catch { return false; } };
export const playing = () => on;

function startSynth() {
  clearInterval(timer);
  ctx ||= new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume();
  const gain = ctx.createGain(); gain.gain.value = 0.05; gain.connect(ctx.destination);
  let n = 0;
  const tick = () => {
    const o = ctx.createOscillator(), g = ctx.createGain(), now = ctx.currentTime;
    o.type = "triangle"; o.frequency.value = 392 * 2 ** (NOTES[n++ % NOTES.length] / 12);
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(1, now + 0.05); g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    o.connect(g).connect(gain); o.start(now); o.stop(now + 1);
  };
  tick(); timer = setInterval(tick, 600);
}
export function setMusic(v) {
  on = !!v;
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
  if (MUSIC_URL) {
    audio ||= Object.assign(new Audio(MUSIC_URL), { loop: true, volume: 0.35 });
    on ? audio.play().catch(() => { on = false; }) : audio.pause();
  } else if (on) startSynth();
  else { clearInterval(timer); ctx?.suspend(); }
  return on;
}
// Pausa quando l'app non è visibile, ripresa al ritorno.
addEventListener("visibilitychange", () => {
  if (!on) return;
  if (document.hidden) { audio?.pause(); clearInterval(timer); ctx?.suspend(); }
  else setMusic(true);
});
