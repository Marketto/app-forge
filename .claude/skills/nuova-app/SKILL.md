---
name: nuova-app
description: Crea una nuova app di Marketto dall'idea al primo deploy su GitHub Pages, con mascotte, i18n, tema, test e catalogo. Usala per «fammi un'app che…».
---

> **Percorsi**: `catalog/`, `docs/`, `tools/`, `template/` sono nella radice di app-forge. Se lavori da un altro repo con il plugin, app-forge è in `${CLAUDE_PLUGIN_ROOT}`.
# Nuova app

Prima carica la skill `regole-app`.

## 1. Piano (agente `architetto`, opus/high)
Passa l'idea all'agente `architetto`. Mostra il piano al proprietario e chiedi di scegliere **una** delle 3 mascotte.
Non andare avanti senza la scelta della mascotte e un nome per l'app.

## 2. Repo
Il proprietario crea su GitHub un repo **vuoto e pubblico** con il nome scelto (id in minuscolo con trattini).
Abilita Pages con «GitHub Actions» come sorgente (Settings → Pages).

## 3. Scheletro
```bash
npm run nuova-app -- --id <id> --nome "<Nome>" --mascotte <NomeMascotte> --animale <animale> \
  --colore "#rrggbb" --categoria <Categoria> --descrizione "<una riga>" --dest ../<id>
```
Da un altro repo (plugin): `node ${CLAUDE_PLUGIN_ROOT}/tools/nuova-app.mjs … --prova --dest .` (con `--prova` non tocca il catalogo, che va aggiornato da app-forge con la skill `catalogo`).

Lo script copia `template/pwa-statica`, sostituisce i segnaposto, rifiuta animali già usati e aggiunge l'app a `catalog/apps.json` con `stato: "in sviluppo"`.

## 4. Requisiti prima del codice
Copia i requisiti del piano in `<id>/docs/REQUISITI.md`. Ogni cambio futuro parte da lì.

## 5. Mascotte e icone
Skill `mascotte-e-icone`: disegna la mascotte in `js/mascot.js`, rigenera le icone.

## 6. Funzioni
Una funzione alla volta: logica pura in `js/logic/` con test in `tests/`, UI in `js/app.js`.
Riusa quello che c'è già (tabella di `docs/APP.md`): copia il file, non riscriverlo.
Testi nuovi → skill `traduzioni`.

## 7. Verifica e pubblicazione
Skill `verifica` (agente `collaudatore`), poi skill `rilascio`.

## 8. Catalogo
Quando l'app è online: skill `catalogo` (stato `attiva`, icona e schermata).
