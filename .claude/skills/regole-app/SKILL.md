---
name: regole-app
description: Regole comuni delle app di Marketto (R01–R20: mascotte, icone, installazione, lingue, accessibilità, temi, wizard, privacy, statistiche, musica, sync…). Caricala prima di creare, modificare o verificare un'app. Nelle app esistenti le regole del loro CLAUDE.md/AGENTS.md vincono.
---
# Regole comuni delle app di Marketto

> Dettagli ed esempi in `docs/CONVENZIONI.md` e `docs/APP.md` (`${CLAUDE_PLUGIN_ROOT}` se usi il plugin).
> Ogni regola ha un codice: `controlla-app.mjs` e la skill `verifica` usano gli stessi codici.
> **Chiedi** = domanda a scelta al proprietario prima di costruire (con AskUserQuestion se c'è). **Se serve** = solo quando l'app lo richiede.

## Mascotte e aspetto
- **R01 Mascotte (chiedi)** — «Vuoi una mascotte?» con 3 proposte di animale non ancora usato (`catalog/apps.json`; il coniglio doppio di Mochi Spesa e Hoppy è un'eccezione storica) + «nessuna». Stile kawaii giapponese anni '90/2000 (testa grande, occhioni lucidi con due riflessi, guance rosa, contorno morbido, colori pastello). Animazioni realistiche e leggere: respiro, battito di ciglia, occhi che seguono il dito/puntatore, salto di gioia, stati (`happy`, `think`, `wow`, `sleep`). Fonte unica `js/mascot.js`.
- **R02 Mascotte interattiva** — al tocco reagisce; dispensa frasi brevi di incoraggiamento e motivazione (più varianti per evento, in tutte le lingue), mai giudicanti. Con «riduci movimento» resta ferma ma continua a parlare.
- **R03 Icone in font** — icone dell'interfaccia in un font di icone (`fonts/*.woff2`, generato da SVG con `npm run font`), nello stile del tema e della mascotte (tratti tondi). Simboli standard e riconoscibili (condividi, impostazioni, chiudi, aiuto, installa…). Sempre `aria-hidden="true"` sull'icona e `aria-label` sul pulsante se non c'è testo.
- **R04 Icona dell'app** — mascotte o simbolo su sfondo pieno di un colore che ne esalta i colori (contrasto soggetto/sfondo ≥ 3:1), versione maskable, leggibile a 48 px.

## Installazione e aggiornamenti
- **R05 Installabile** — manifest completo, icone 192/512/maskable, pulsante «Installa» (dove il browser lo permette) e indicazioni per iPhone/iPad.
- **R06 Offline e aggiornamenti automatici** — service worker; versione in un posto solo (`js/version.js`) copiata nella cache al deploy; l'app controlla gli aggiornamenti da sola e passa alla nuova versione senza perdere dati, con un avviso breve.
- **R07 Versione e Condividi sempre visibili** — numero di versione sempre a schermo; pulsante Condividi con icona standard (`navigator.share`, altrimenti copia il link).

## Lingue
- **R08 Multilingua** — tutte le 42 lingue di `LINGUE` in `js/i18n.js` (lingue europee + russo, cinese, giapponese, coreano, arabo). Arabo da destra a sinistra. Ogni testo passa da `t("chiave")`, anche `aria-label`. `tools/i18n-check.mjs --tutte` deve passare prima del rilascio.

## Accessibilità, UX e layout
- **R09 Accessibilità** — WCAG 2.2 AA e buone pratiche di UI/UX: contrasto, bersagli ≥ 44 px, focus visibile, tastiera, `<dialog>` con titolo ed Esc, `prefers-reduced-motion`.
- **R10 Temi** — chiaro, scuro, **alto contrasto** e **per daltonici** (palette Okabe-Ito; l'informazione non passa mai solo dal colore). Predefinito: segue il sistema (`prefers-color-scheme`, `prefers-contrast`). Colori solo da variabili CSS.
- **R11 Responsive e allineamento** — da 320 a 1920 px: niente scorrimento orizzontale, niente elementi sovrapposti o fuori schermo, spaziature dai token, contenuti centrati con larghezza massima. `npm run ui` lo controlla in ogni tema.
- **R12 Semplice e intuitiva** — un'azione principale per schermata, al massimo 5 schede, testi brevi senza gergo, niente impostazioni inutili, valori predefiniti sensati.

## Guida, legale, statistiche
- **R13 Wizard** — al primo avvio mostra le parti dell'app con un riquadro di focus e una nuvoletta della mascotte con indicazioni brevi; dopo un aggiornamento solo le novità; una volta sola; pulsante «?» per rivederlo.
- **R14 Privacy e condizioni d'uso** — da accettare al primo avvio e a ogni nuova versione del testo. Scritte partendo dal modello (`locales/legal/`) e adattate a quello che fa davvero l'app (dati trattati, servizi esterni, cloud). Lo **scarico di responsabilità** sull'uso dell'app sul proprio dispositivo è sempre evidenziato e approvato con una casella a parte. Nessun indirizzo email personale: il contatto è la pagina delle segnalazioni su GitHub.
- **R15 Statistiche anonime** — conteggio d'uso anonimo con GoatCounter (senza cookie, nessun identificativo, solo eventi tipo «apertura»/«funzione usata»), attivo solo con il consenso, in coda se offline. Tutto il resto resta sul dispositivo.

## Funzioni facoltative
- **R16 Musica (chiedi)** — «Vuoi una musica di sottofondo a tema?» sì/no. Se sì: musica leggera a tema, spenta finché l'utente non la accende, pulsante sempre visibile per accenderla/spegnerla, scelta ricordata.
- **R17 Lavoro in background (se serve)** — se l'app elabora (file, OCR, calcoli lunghi): Web Worker, avanzamento visibile, interfaccia mai bloccata; il lavoro continua con l'app in background finché è aperta e avvisa se la si chiude a metà.
- **R18 Salvataggio e condivisione dati (chiedi, se ha senso)** — opzioni: solo sul dispositivo (sempre), più Dropbox, Google Drive o un provider personale con standard aperto (WebDAV). Sempre anche esporta/importa da file. Riusa la sync di Kapibo (`porta-funzione`).

## Codice e lavoro
- **R19 Codice strutturato e scalabile** — moduli piccoli con un compito ciascuno, logica pura in `js/logic/` con test `node --test`, UI separata. Se una funzione esiste già in un'altra app: **richiamala** dalla sua app pubblicata (stesso dominio `marketto.github.io`, come Kapibo con il motore di Schiaccia PDF) se è autonoma e stabile, altrimenti portala con `porta-funzione`.
- **R20 Privacy del repo e consegna** — niente server nostri, nessun dato personale nel repo, autore commit `Marketto <Marketto@users.noreply.github.com>`, `tools/privacy-check.mjs` verde; consegna = commit + push su `main` e controllo della versione online.

Quale skill e agente usare per ogni richiesta: tabella router in `AGENTS.md`.
