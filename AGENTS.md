# app-forge — guida per agenti (Claude, Codex, Cursor, Copilot, Gemini…)

Fabbrica delle app di Marketto. Serve a quattro cose:
1. **Creare una nuova app** con le stesse regole delle app già fatte (skill `nuova-app`).
2. **Migliorare le app esistenti** con le stesse regole (skill `migliora-app`, `porta-funzione`).
3. **Revisionare un progetto** in 2 giri con un revisore indipendente (skill `revisione`).
4. **Tenere aggiornato il catalogo** su GitHub Pages: https://marketto.github.io/app-forge/ (skill `catalogo`).

Lingua di lavoro: italiano semplice. Tono conciso. Identificatori del codice in inglese.

## Regole (R01–R20)
**Fonte unica: `.claude/skills/regole-app/SKILL.md`. Leggila sempre prima di creare, modificare o verificare un'app.** Dettagli ed esempi in `docs/CONVENZIONI.md`.
In breve:
- **Chiedi prima di costruire** (domande a scelta): mascotte sì/no e quale (R01), musica sì/no (R16), salvataggio cloud se ha senso (R18).
- **Aspetto**: mascotte kawaii anni '90/2000 animata e interattiva con frasi motivazionali (R01–R02), icone in font con simboli standard (R03), icona app su sfondo che esalta la mascotte (R04).
- **Sempre**: installabile (R05), offline con aggiornamenti automatici (R06), versione e Condividi visibili (R07), 42 lingue (R08), WCAG AA (R09), temi chiaro/scuro/alto contrasto/daltonici (R10), responsive e allineata (R11), semplice (R12), wizard con focus (R13), privacy e condizioni con scarico di responsabilità (R14), statistiche anonime con consenso (R15).
- **Se serve**: lavoro in background (R17).
- **Codice e lavoro**: moduli piccoli e testati, riuso delle funzioni di altre app (R19); niente server né dati personali nel repo, consegna con push (R20).

## Router — da richiesta a skill/agente

| Se la richiesta parla di… | Skill | Agente | Modello · effort |
|---|---|---|---|
| nuova app, idea, «fammi un'app che…» | `nuova-app` | `architetto` (piano) → poi gli altri | opus · high |
| migliorare un'app esistente, «cosa manca a…», allinearla alle regole | `migliora-app` | `architetto` solo per cambi grossi | sonnet · medium |
| portare una funzione da un'app a un'altra | `porta-funzione` | — | sonnet · medium |
| mascotte, icone, palette, stile kawaii | `mascotte-e-icone` | `ui-kawaii` | sonnet · medium |
| testi, traduzioni, nuova lingua | `traduzioni` | `traduttore` | sonnet · low |
| test, «funziona?», controllo prima del push | `verifica` | `collaudatore` | haiku · low |
| versione, pubblicazione, deploy | `rilascio` | `rilascio` | haiku · low |
| aggiungere/aggiornare un'app nel catalogo, schermate | `catalogo` | — | haiku · low |
| revisione del progetto, «controlla che sia tutto coerente» | `revisione` | `revisore` (2 giri) | opus · high |
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
tools/controlla-app.mjs  controllo veloce di un'app rispetto a R01–R20
tools/attiva-plugin.mjs  attiva il plugin in un repo esistente
tools/cli.mjs            riga di comando (npx github:Marketto/app-forge …)
tools/mcp-server.mjs     server MCP (strumenti per qualsiasi client)
template/pwa-statica/    modello di app che rispetta R01–R20 (temi, wizard, legale, statistiche, font di icone, audit UI)
docs/                    CONVENZIONI (regole comuni), APP (da dove copiare), MODALITA (tutti i modi d'uso)
.github/workflows/       pages.yml (catalogo), schermate.yml (ogni lunedì)
.claude-plugin/          plugin e marketplace di Claude Code
```

## Comandi
```bash
npm test                                   # test degli strumenti + build catalogo + privacy
npm run catalogo                           # rigenera _site/
npm run serve                              # catalogo su http://localhost:8080
npm run schermate [-- <id>]                # icone e schermate dalle app online
node tools/controlla-app.mjs ../<app>      # cosa manca a un'app esistente
node tools/attiva-plugin.mjs ../<app>      # attiva il plugin in quel repo
npm run nuova-app -- --id x --nome "X" --mascotte Nome --animale volpe --colore "#ffd6a5" --categoria Casa
```
