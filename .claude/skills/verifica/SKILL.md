---
name: verifica
description: Verifica che un'app rispetti tutte le regole R01–R20 (test, lingue, legali, accessibilità, temi, layout, privacy) prima di ogni commit o per «funziona ancora?».
---
# Verifica

> **Percorsi**: `tools/controlla-app.mjs` è in app-forge (`${CLAUDE_PLUGIN_ROOT}` se usi il plugin).

## 1. Controlli automatici
In un'app creata dal modello:
```bash
npm test          # logica, struttura lingue e legali, privacy
npm run check     # 42 lingue, legali adattati, UI: 5 larghezze × 4 temi con axe (R08–R11, R14)
node ${CLAUDE_PLUGIN_ROOT}/tools/controlla-app.mjs .   # regole R01–R20 sui file
```
In app-forge: `npm test`. In un'app più vecchia usa i suoi comandi (vedi il suo CLAUDE.md) più `controlla-app`.

## 2. Controlli a mano (quelli che lo script segna ❔)
Apri l'app (`npm run serve`) a 390 px e 1280 px:
- **R12** un'azione principale per schermata, testi brevi, si capisce senza spiegazioni;
- **R01–R02** la mascotte respira, sbatte le ciglia, segue il dito, al tocco salta e incoraggia;
- **R13** il wizard parte al primo avvio, mette a fuoco le parti giuste, si riapre con «?»;
- **R14** il consenso si vede al primo avvio e lo scarico di responsabilità è evidenziato;
- **R05–R06** si installa; dopo un nuovo deploy l'app si aggiorna da sola;
- **R18** esporta/importa funzionano (e si annullano); **R16–R17** se scelte: musica con interruttore, Worker per i lavori lunghi.

## 3. Risultato
Riporta solo cosa fallisce, con il codice della regola e file:riga. Se un controllo non si può eseguire (manca il browser, manca una dipendenza), dillo invece di dire che è tutto ok.
