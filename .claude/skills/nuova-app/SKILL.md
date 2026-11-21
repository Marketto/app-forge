---
name: nuova-app
description: Crea una nuova app di Marketto dall'idea al primo deploy su GitHub Pages, rispettando le regole R01–R20 (mascotte, 42 lingue, temi, wizard, privacy…). Usala per «fammi un'app che…».
---
# Nuova app

> **Percorsi**: `catalog/`, `docs/`, `tools/`, `template/` sono nella radice di app-forge. Da un altro repo con il plugin: `${CLAUDE_PLUGIN_ROOT}`.

Prima carica la skill `regole-app`: ogni passo qui sotto cita le sue regole.

## 1. Piano (agente `architetto`, opus/high)
Passa l'idea all'agente `architetto`: restituisce piano, 3 mascotte e le domande da fare.

## 2. Domande a scelta (una sola volta, tutte insieme)
Usa AskUserQuestion (o una lista numerata se non c'è). Non andare avanti senza risposte.
1. **Nome dell'app** (2–3 proposte dal piano).
2. **Mascotte (R01)**: le 3 proposte dell'architetto + «Nessuna mascotte».
3. **Musica di sottofondo (R16)**: «No» / «Sì, a tema, con pulsante per accenderla e spegnerla».
4. **Salvataggio dati (R18)**, solo se ha senso per l'app: «Solo sul dispositivo» / «+ Dropbox» / «+ Google Drive» / «+ provider personale (WebDAV)» (scelta multipla).
5. **Statistiche anonime (R15)**: codice GoatCounter, oppure «dopo» (restano spente finché non c'è).

## 3. Repo
Il proprietario crea su GitHub un repo **vuoto e pubblico** con l'id scelto (minuscole e trattini) e abilita Pages con «GitHub Actions» (Settings → Pages).

## 4. Scheletro
```bash
npm run nuova-app -- --id <id> --nome "<Nome>" --mascotte <Nome> --animale <animale> --colore "#rrggbb" \
  --categoria <Categoria> --descrizione "<una riga>" --dest ../<id> \
  [--senza-mascotte] [--musica] [--sync dropbox,gdrive,webdav] [--goatcounter <codice>]
```
Da un altro repo (plugin): `node ${CLAUDE_PLUGIN_ROOT}/tools/nuova-app.mjs … --dest .` (non tocca il catalogo: aggiornalo poi da app-forge con la skill `catalogo`).
Il modello ha già: icone in font (R03), installazione (R05), offline e aggiornamenti (R06), versione e Condividi (R07), temi chiaro/scuro/alto contrasto/daltonici (R10), wizard (R13), consenso con scarico di responsabilità (R14), statistiche con consenso (R15), musica facoltativa (R16), Worker (R17), audit dell'interfaccia (R09–R11). Le scelte vanno in `js/config.js`.

## 5. Prima dei contenuti
- Requisiti del piano in `docs/REQUISITI.md` (ogni cambio futuro parte da lì).
- Mascotte vera in `js/mascot.js` e icone (skill `mascotte-e-icone`, R01, R04).
- Privacy e condizioni adattate a quello che fa l'app in `locales/legal/` (R14): dati trattati, servizi esterni, cloud scelto. Togli le parti tra [parentesi].

## 6. Funzioni
Una alla volta: logica pura in `js/logic/` con test, interfaccia in moduli piccoli (R19). Se esiste già in un'altra app: richiamala o portala (`porta-funzione`). Funzione visibile = passo nel wizard (`js/tour.js`, R13). Elaborazioni pesanti in un Worker con `js/work.js` (R17). Testi nuovi → skill `traduzioni`.

## 7. Verifica e pubblicazione
Skill `verifica` (tutte le regole, `npm run check`), poi skill `rilascio`. `pages.yml` non pubblica senza le 42 lingue e i testi legali adattati.

## 8. Catalogo
Quando l'app è online: skill `catalogo` (stato `attiva`, icona e schermata).
