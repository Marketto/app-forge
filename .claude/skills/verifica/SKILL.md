---
name: verifica
description: Controlli da fare prima di ogni commit o per rispondere a «funziona ancora?».
---
# Verifica

In una app creata dal modello:
```bash
node --test tests/*.test.mjs          # logica
node tools/i18n-check.mjs   # traduzioni
node tools/privacy-check.mjs # dati sensibili
```
Poi prova a mano: `python3 -m http.server 8000` e apri a 390 px e a 1280 px, tema chiaro e scuro.
Controlla: nessun errore in console, pulsanti ≥ 44 px, funziona offline dopo il primo caricamento.

In app-forge: `npm test` (test strumenti + build catalogo + privacy).

Riporta solo cosa fallisce. Se un controllo non si può eseguire, dillo.
