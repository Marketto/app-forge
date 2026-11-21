# app-forge ✿

Fabbrica agentica delle app di Marketto: crea app nuove, migliora quelle esistenti e tiene il catalogo pubblico.

👉 **Catalogo: https://marketto.github.io/app-forge/** — icone su telefono, schermate su desktop.

## Cosa c'è
- **Agenti e skill** (`AGENTS.md`, `.claude/`): anche come plugin di Claude Code, server MCP e riga di comando per creare nuove app con le regole delle app già fatte: PWA offline, senza server, mascotte kawaii, 39+ lingue, accessibili.
- **Modello di app** (`template/pwa-statica`): PWA senza build con mascotte, i18n, tema chiaro/scuro, service worker, test e deploy su Pages.
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
