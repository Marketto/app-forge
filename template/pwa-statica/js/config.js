// Scelte fatte alla creazione dell'app (tools/nuova-app.mjs le riscrive). Cambiale qui, non sparse nel codice.
export const CONFIG = {
  id: "__ID__",
  mascot: true,          // R01: mascotte sì/no
  music: false,          // R16: musica di sottofondo con interruttore
  goatcounter: "",       // R15: codice del sito GoatCounter (https://<codice>.goatcounter.com); vuoto = statistiche spente
  sync: [],              // R18: "dropbox", "gdrive", "webdav" (da portare da Kapibo con la skill porta-funzione)
  repo: "Marketto/__ID__",
};
