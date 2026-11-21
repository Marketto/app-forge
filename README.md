# app-forge ✿

Fabbrica agentica delle app di Marketto: crea app nuove, migliora quelle esistenti e tiene il catalogo pubblico.

👉 **Catalogo: https://marketto.github.io/app-forge/** — icone su telefono, schermate su desktop.

## Cosa c'è
- **Agenti e skill** (`AGENTS.md`, `.claude/`): anche come plugin di Claude Code, server MCP e riga di comando per creare nuove app con le regole delle app già fatte: regole R01–R20: mascotte kawaii animata, icone in font, installabile, 42 lingue, temi chiaro/scuro/alto contrasto/daltonici, wizard, privacy con scarico di responsabilità, statistiche anonime.
- **Modello di app** (`template/pwa-statica`): PWA senza build che rispetta già le regole; `pages.yml` non pubblica senza 42 lingue e testi legali adattati.
- **Catalogo** (`catalog/apps.json` → `_site/`): generato a ogni push; icone e schermate si aggiornano da sole ogni lunedì.

## Modi d'uso
Guida completa: [`docs/MODALITA.md`](docs/MODALITA.md).

| Modalità | In breve |
|---|---|
| Claude Code in app-forge | `git clone` + `claude`, poi «fammi un'app che…» |
| Plugin da un altro repo | `/plugin marketplace add Marketto/app-forge` e `/plugin install app-forge@app-forge` |
| Plugin automatico nelle app | già attivo in `.claude/settings.json` di ogni app creata |
| Claude Code sul web | su claude.ai/code scegli app-forge (e il repo dell'app) |
| Riga di comando | `npx github:Marketto/app-forge nuova-app …` |
| Altri agenti AI | `AGENTS.md` per Codex, Cursor, Copilot, Gemini |
| Server MCP | `npx -y github:Marketto/app-forge mcp` in qualsiasi client MCP |

Il catalogo si aggiorna solo dal repo app-forge: plugin, `npx` e MCP lavorano su una copia.

## Migliorare un'app esistente
Nel repo dell'app: `npx github:Marketto/app-forge attiva-plugin` (una volta), poi in Claude Code «usa app-forge:migliora-app».
Claude controlla cosa manca, propone al massimo 7 miglioramenti e li fa uno alla volta dopo la tua scelta. Le regole dell'app vincono su quelle comuni.
Per prendere una funzione da un'altra app: «usa app-forge:porta-funzione: il tour di Kapibo qui». Dettagli in [`docs/MODALITA.md`](docs/MODALITA.md#migliorare-unapp-esistente).

## Revisionare un progetto
**Prompt** (funziona ovunque, anche dal telefono o dal web, senza installare niente):
```
Revisiona questo progetto seguendo https://raw.githubusercontent.com/Marketto/app-forge/main/.claude/skills/revisione/SKILL.md
```
**Comando** (sul computer, con Claude Code installato):
```bash
npx -y github:Marketto/app-forge revisione
```
**Con il plugin attivo**: «revisiona il progetto» oppure `/app-forge:revisione`.

Claude fa 2 giri con un revisore indipendente (opus): coerenza, struttura, ottimizzazione, errori e, per le app, regole R01–R20. Applica e testa le correzioni sicure, fa un commit per giro (senza push) e ti lascia le decisioni.

## Attivare il plugin
| Dove | Come |
|---|---|
| **Per te, in tutti i progetti** (Claude Code sul computer: terminale, app desktop, editor) | `/plugin marketplace add Marketto/app-forge` e poi `/plugin install app-forge@app-forge`. Aggiornare: `/plugin marketplace update app-forge` |
| **In un repo** (vale per chi lo apre) | `npx -y github:Marketto/app-forge attiva-plugin` nella cartella del repo, poi commit e push di `.claude/settings.json` |
| **App create da app-forge** | già attivo |

`/plugin` **non esiste nell'app Claude sul telefono né nelle sessioni cloud** (risponde «isn't available in this environment»). Lì usa i prompt di questo README. Controllo: in Claude Code sul computer `/plugin` deve elencare `app-forge`.

## Creare una nuova app
Con Claude Code in questa cartella: «fammi un'app che…». Parte la skill `nuova-app`.
A mano:
```bash
npm run nuova-app -- --id volpe-note --nome "Volpe Note" --mascotte Kitsu --animale volpe \
  --colore "#ffd6a5" --categoria Casa --descrizione "Note veloci offline." --dest ../volpe-note
```

## Catalogo
```bash
npm install && npx playwright install chromium   # una volta
npm run schermate            # icone e schermate dalle app online
npm run serve                # http://localhost:8080
```

## App nel catalogo
Hari Hari Puzzle · Kapibo · Mochi Spesa · Ottoteca · Schiaccia PDF · Turnotto · Lunibù · Printopus · SuriClean · Hoppy
