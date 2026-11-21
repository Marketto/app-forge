# Modi d'uso di app-forge

| # | Modalità | Per chi / quando | Serve |
|---|---|---|---|
| 1 | [Claude Code in app-forge](#1-claude-code-in-app-forge) | creare app e aggiornare il catalogo | clone del repo |
| 2 | [Plugin da un altro repo](#2-plugin-da-un-altro-repo) | lavorare su un'app con le regole comuni | Claude Code |
| 3 | [Plugin automatico nelle app](#3-plugin-automatico-nelle-app) | chi apre un repo di un'app | niente: è già configurato |
| 4 | [Claude Code sul web (cloud)](#4-claude-code-sul-web-cloud) | lavorare dal browser o dal telefono | claude.ai/code |
| 5 | [GitHub Actions: «@claude»](#5-github-actions-claude) | chiedere lavoro da una issue | un secret nel repo |
| 6 | [Riga di comando](#6-riga-di-comando) | creare un'app senza clonare, script | Node 20+ |
| 7 | [Altri agenti AI](#7-altri-agenti-ai) | Codex, Cursor, Copilot, Gemini | niente |
| 8 | [Server MCP](#8-server-mcp) | qualsiasi client MCP (Claude Desktop, Cursor, VS Code, Codex) | Node 20+ |

Cosa può fare ogni modalità:

| | Nuova app | Regole e agenti | Aggiorna catalogo |
|---|---|---|---|
| 1 Claude Code in app-forge | ✅ | ✅ | ✅ |
| 2–3 Plugin | ✅ (nella cartella corrente) | ✅ | ❌ |
| 4 Cloud | ✅ | ✅ | ✅ se la sessione ha app-forge |
| 5 GitHub Actions | ✅ (apre una PR) | ✅ | ✅ nel repo app-forge |
| 6 Riga di comando | ✅ | solo `regole` | ❌ (solo dentro app-forge) |
| 7 Altri agenti | ✅ | ✅ (leggendo i file) | ✅ |
| 8 MCP | ✅ (`nuova_app`) | regole e tabelle | ❌ |

Il catalogo si aggiorna solo dal repo app-forge, perché è l'unico posto con `catalog/apps.json` vero: plugin, `npx` e MCP lavorano su una copia.

---

## 1. Claude Code in app-forge
```bash
git clone https://github.com/Marketto/app-forge && cd app-forge
claude
```
Chiedi «fammi un'app che…» (skill `nuova-app`) o «aggiungi Volpe Note al catalogo» (skill `catalogo`).
All'avvio un hook installa le dipendenze di sviluppo; il server MCP del repo (`.mcp.json`) è già attivo.

## 2. Plugin da un altro repo
```
/plugin marketplace add Marketto/app-forge
/plugin install app-forge@app-forge
```
Da Claude Code 2.1.275 basta `/plugin install app-forge --marketplace Marketto/app-forge`.
Ottieni, con il prefisso `app-forge:`, le skill `regole-app`, `nuova-app`, `mascotte-e-icone`, `traduzioni`, `verifica`, `rilascio`, `catalogo`,
gli agenti `architetto`, `ui-kawaii`, `traduttore`, `collaudatore`, `rilascio`, `router` e gli strumenti MCP (modalità 8).
Esempi: «usa app-forge:nuova-app per un'app che…», «applica app-forge:regole-app a questo repo».
Aggiornare: `/plugin marketplace update app-forge`.

## 3. Plugin automatico nelle app
Ogni app creata da `nuova-app` ha già in `.claude/settings.json`:
```json
{
  "extraKnownMarketplaces": { "app-forge": { "source": { "source": "github", "repo": "Marketto/app-forge" } } },
  "enabledPlugins": { "app-forge@app-forge": true }
}
```
Chi apre il repo con Claude Code si vede proporre il plugin. Per un'app già esistente, copia questo blocco nel suo `.claude/settings.json`.

## 4. Claude Code sul web (cloud)
Da https://claude.ai/code (anche dal telefono):
- **Lavoro su app-forge**: scegli il repo app-forge. Il file `.claude/settings.json` del repo vale anche nel cloud (hook, MCP, permessi).
- **Lavoro su un'app**: scegli il repo dell'app; il blocco della modalità 3 propone il plugin. In alternativa aggiungi app-forge alla stessa sessione: Claude legge le sue skill e può anche aggiornare il catalogo.
- **Nuova app**: crea prima su GitHub il repo vuoto, poi aggiungi alla sessione app-forge e il nuovo repo.

## 5. GitHub Actions: «@claude»
In app-forge e in ogni app creata c'è `.github/workflows/claude.yml`.
1. Una volta: nel repo, Settings → Secrets → Actions, aggiungi `CLAUDE_CODE_OAUTH_TOKEN` (generalo con `claude setup-token`) oppure `ANTHROPIC_API_KEY`. Serve anche l'app GitHub di Claude: `/install-github-app` da Claude Code.
2. Scrivi in una issue o in un commento: «@claude aggiungi la lingua giapponese», «@claude fammi un'app che…».
Claude lavora con gli agenti e le skill del repo e apre una PR.

## 6. Riga di comando
Senza clonare (Node 20+):
```bash
npx github:Marketto/app-forge nuova-app --id volpe-note --nome "Volpe Note" \
  --mascotte Kitsu --animale volpe --colore "#ffd6a5" --descrizione "Note veloci offline."
npx github:Marketto/app-forge mascotte   # animali già usati
npx github:Marketto/app-forge app        # app del catalogo
npx github:Marketto/app-forge regole     # regole comuni
```
L'app viene creata nella cartella corrente. Dentro app-forge: `npm run nuova-app -- …` (aggiunge anche al catalogo), `npm run catalogo`, `npm run schermate`.

Con Claude senza interfaccia (script, CI):
```bash
claude -p "usa app-forge:nuova-app per un'app che tiene il diario delle piante"   # con il plugin installato
claude -p --plugin-dir /percorso/app-forge "…"                                       # senza installarlo
```

## 7. Altri agenti AI
Le regole e la tabella router stanno in `AGENTS.md` (anche nelle app create). Lo leggono:
- **Codex, Cursor, Copilot (agente), Jules, Aider e altri**: `AGENTS.md` direttamente;
- **Gemini CLI**: `GEMINI.md`, che importa `AGENTS.md`;
- **Copilot nell'editor**: `.github/copilot-instructions.md`, che rimanda ad `AGENTS.md`;
- **Claude Code**: `CLAUDE.md`, che importa `AGENTS.md` e aggiunge le cose solo sue.

Skill e agenti sono file Markdown in `.claude/`: gli altri agenti li leggono e li seguono quando la tabella li indica.
Per gli strumenti (nuova app, mascotte usate) collegali al server MCP (modalità 8).

## 8. Server MCP
Strumenti: `elenco_app`, `mascotte_usate`, `regole`, `da_dove_copiare`, `nuova_app`. Prompt: `crea_app` (idea → piano → scheletro).
Comando del server: `npx -y github:Marketto/app-forge mcp`.

**Claude Code**
```bash
claude mcp add app-forge -- npx -y github:Marketto/app-forge mcp
```
(Già incluso nel plugin e nel `.mcp.json` di app-forge.)

**Claude Desktop** (`claude_desktop_config.json`), **Cursor** (`.cursor/mcp.json`)
```json
{ "mcpServers": { "app-forge": { "command": "npx", "args": ["-y", "github:Marketto/app-forge", "mcp"] } } }
```

**VS Code** (`.vscode/mcp.json`)
```json
{ "servers": { "app-forge": { "type": "stdio", "command": "npx", "args": ["-y", "github:Marketto/app-forge", "mcp"] } } }
```

**Codex** (`~/.codex/config.toml`)
```toml
[mcp_servers.app-forge]
command = "npx"
args = ["-y", "github:Marketto/app-forge", "mcp"]
```
