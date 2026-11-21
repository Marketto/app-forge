---
name: traduzioni
description: Aggiungere o cambiare testi visibili e portarli in tutte le lingue dell'app.
---
# Traduzioni

1. Ogni testo visibile usa `t("area.chiave")`, anche `aria-label` e `title`. Frasi intere con segnaposto `{nome}`, niente pezzi concatenati.
2. Scrivi la chiave in `locales/it.json` e `locales/en.json` (fonte di verità: `en.json`).
3. Agente `traduttore` per tutte le altre lingue in `locales/`. Non leggere i file delle altre lingue per intero: `grep -n` sulla chiave.
4. `node tools/i18n-check.mjs` → deve dire «Traduzioni OK».
5. Nuova lingua: copia `en.json` in `<sigla>.json`, traduci, aggiungila a `LANGS` in `js/i18n.js`. RTL (`ar`, `he`, `fa`) imposta `dir="rtl"` da `LANGS`.
