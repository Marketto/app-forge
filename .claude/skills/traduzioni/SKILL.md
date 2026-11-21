---
name: traduzioni
description: Aggiungere o cambiare testi visibili e portarli in tutte le 42 lingue obbligatorie (R08), compresi i testi legali.
---
# Traduzioni (R08)

1. Ogni testo visibile usa `t("area.chiave")`, anche `aria-label` e `title`. Frasi intere con segnaposto `{nome}`, niente pezzi concatenati.
2. Scrivi la chiave in `locales/it.json` e `locales/en.json` (fonte di verità: `en.json`).
3. Agente `traduttore` per le altre lingue. Elenco obbligatorio: `LINGUE` in `js/i18n.js` (lingue europee + russo, cinese, giapponese, coreano, arabo = 42). Crea i file mancanti copiando `en.json` e traducendo.
4. Testi legali: stessa cosa per `locales/legal/<lingua>.json` (stessa struttura dell'inglese).
5. Non leggere le altre lingue per intero: `grep -n` sulla chiave.
6. Controlli: `node tools/i18n-check.mjs --tutte` e `node tools/legal-check.mjs --tutte` → «OK».
