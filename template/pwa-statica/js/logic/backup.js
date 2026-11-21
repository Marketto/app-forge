// R18: esporta e importa i dati da file (copia di sicurezza, passaggio a un altro dispositivo). Logica pura.
export function makeBackup(appId, version, state, now = new Date()) {
  return JSON.stringify({ app: appId, version, at: now.toISOString(), data: state }, null, 2);
}
/** Legge un file di backup. Lancia un errore se non è di quest'app o non è valido. */
export function readBackup(text, appId) {
  let b;
  try { b = JSON.parse(text); } catch { throw new Error("bad-json"); }
  if (!b || b.app !== appId || typeof b.data !== "object" || b.data === null) throw new Error("bad-app");
  if (!Array.isArray(b.data.items) || !b.data.items.every(i => i && typeof i.id === "string" && typeof i.text === "string")) throw new Error("bad-data");
  return b.data;
}
