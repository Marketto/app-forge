# app-forge — guida per agenti (Claude, Codex, Cursor, Copilot, Gemini…)

Fabbrica delle app di Marketto. Serve a due cose:
1. **Creare una nuova app** con le stesse regole delle app già fatte (skill `nuova-app`).
2. **Tenere aggiornato il catalogo** su GitHub Pages: https://marketto.github.io/app-forge/ (skill `catalogo`).

Lingua di lavoro: italiano semplice. Tono conciso. Identificatori del codice in inglese.

## Regole d'oro (valgono per ogni app creata da qui)
Ricavate dalle app esistenti: dettagli e motivazioni in `docs/CONVENZIONI.md`.

1. **Niente server, dati sul dispositivo.** PWA statica su GitHub Pages, offline first (service worker). Nessuna chiamata di rete con dati dell'utente. Unica telemetria ammessa: GoatCounter anonimo, facoltativo, con consenso.
2. **Senza build quando si può.** Vanilla JS, librerie copiate in `vendor/`. React + Vite solo se l'app lo richiede davvero (decide `architetto`).
3. **Una mascotte kawaii, animale nuovo.** Mai un animale già usato (elenco in `catalog/apps.json`, campo `mascotte.animale`). Una sola fonte SVG (`js/mascot.js`), icone generate da lì.
4. **Ogni testo passa da `t("chiave")`.** Fonte `locales/it.json` + `en.json`, poi tutte le lingue (39 come Turnotto/Schiaccia PDF). `tools/i18n-check.mjs` deve passare.
5. **Token di design**: colori solo da variabili CSS, tema chiaro + scuro. Accessibilità AA, bersagli ≥ 44 px, `aria-label` sui pulsanti a icona, `prefers-reduced-motion`, layout provato a 390 px.
6. **Logica separata dalla UI** e testata con `node --test` (senza browser).
7. **Nessun dato personale nel repo** (repo pubblici): niente email, chiavi, token, IBAN, file d'esempio del proprietario. Autore commit `Marketto <Marketto@users.noreply.github.com>`. `tools/privacy-check.mjs` blocca.
8. **Versione in un posto solo** (`js/version.js`), copiata nel nome della cache del service worker al deploy: così i telefoni si aggiornano.
9. **Funzione nuova = passo nel tour/novità** per chi aggiorna.
10. **Consegna = commit + push su `main`**, poi attendi il deploy e controlla la versione online. Non mandare file in chat.

## Router — da richiesta a skill/agente

| Se la richiesta parla di… | Skill | Agente | Modello · effort |
|---|---|---|---|
| nuova app, idea, «fammi un'app che…» | `nuova-app` | `architetto` (piano) → poi gli altri | opus · high |
| mascotte, icone, palette, stile kawaii | `mascotte-e-icone` | `ui-kawaii` | sonnet · medium |
| testi, traduzioni, nuova lingua | `traduzioni` | `traduttore` | sonnet · low |
| test, «funziona?», controllo prima del push | `verifica` | `collaudatore` | haiku · low |
| versione, pubblicazione, deploy | `rilascio` | `rilascio` | haiku · low |
| aggiungere/aggiornare un'app nel catalogo, schermate | `catalogo` | — | haiku · low |
| richiesta ambigua o su più aree | — | `router` | haiku · low |

Skill in `.claude/skills/<nome>/SKILL.md`, agenti in `.claude/agents/<nome>.md`.
**Agenti diversi da Claude Code**: le skill e gli agenti sono normali file Markdown. Quando la tabella indica una skill, leggi quel file e seguilo; quando indica un agente, segui le istruzioni del suo file (ignora i campi `model`/`effort`).
Una riga di modifica o un controllo noto: fallo direttamente, senza agenti.

## Mappa
```
catalog/apps.json        elenco delle app (fonte unica del catalogo e delle mascotte usate)
site/                    stile, favicon, icons/<id>.png, screenshots/<id>.jpg
tools/build-catalog.mjs  genera _site/ (pagina del catalogo), nessuna dipendenza
tools/screenshots.mjs    aggiorna icone e schermate aprendo le app online (Playwright)
tools/nuova-app.mjs      crea una nuova app dal modello in template/pwa-statica
tools/privacy-check.mjs  blocca dati sensibili
tools/cli.mjs            riga di comando (npx github:Marketto/app-forge …)
tools/mcp-server.mjs     server MCP (strumenti per qualsiasi client)
template/pwa-statica/    modello di app: PWA senza build con mascotte, i18n, tema, test, deploy
docs/                    CONVENZIONI (regole comuni), APP (da dove copiare), MODALITA (tutti i modi d'uso)
.github/workflows/       pages.yml (catalogo), schermate.yml (ogni lunedì), claude.yml (@claude nelle issue)
.claude-plugin/          plugin e marketplace di Claude Code
```

## Comandi
```bash
npm test                                   # test degli strumenti + build catalogo + privacy
npm run catalogo                           # rigenera _site/
npm run serve                              # catalogo su http://localhost:8080
npm run schermate [-- <id>]                # icone e schermate dalle app online
npm run nuova-app -- --id x --nome "X" --mascotte Nome --animale volpe --colore "#ffd6a5" --categoria Casa
```
