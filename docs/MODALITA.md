# Modi d'uso di app-forge

| # | Modalità | Per chi / quando | Serve |
|---|---|---|---|
| 1 | [Claude Code in app-forge](#1-claude-code-in-app-forge) | creare app e aggiornare il catalogo | clone del repo |
| 2 | [Plugin da un altro repo](#2-plugin-da-un-altro-repo) | lavorare su un'app con le regole comuni | Claude Code |
| 3 | [Plugin automatico nelle app](#3-plugin-automatico-nelle-app) | chi apre un repo di un'app | niente: è già configurato |
| 4 | [Claude Code sul web (cloud)](#4-claude-code-sul-web-cloud) | lavorare dal browser o dal telefono | claude.ai/code |
| 5 | [Riga di comando](#5-riga-di-comando) | creare un'app senza clonare, script | Node 20+ |
| 6 | [Altri agenti AI](#6-altri-agenti-ai) | Codex, Cursor, Copilot, Gemini | niente |
| 7 | [Server MCP](#7-server-mcp) | qualsiasi client MCP (Claude Desktop, Cursor, VS Code, Codex) | Node 20+ |

Cosa può fare ogni modalità:

| | Nuova app | Migliora app esistente | Regole e agenti | Aggiorna catalogo |
|---|---|---|---|---|
| 1 Claude Code in app-forge | ✅ | ✅ (`../<app>`) | ✅ | ✅ |
| 2–3 Plugin | ✅ (nella cartella corrente) | ✅ | ✅ | ❌ |
| 4 Cloud | ✅ | ✅ (aggiungi il repo dell'app) | ✅ | ✅ se la sessione ha app-forge |
| 5 Riga di comando | ✅ | solo il controllo | solo `regole` | ❌ (solo dentro app-forge) |
| 6 Altri agenti | ✅ | ✅ | ✅ (leggendo i file) | ✅ |
| 7 MCP | ✅ (`nuova_app`) | ✅ (`controlla_app`, prompt `migliora_app`) | regole e tabelle | ❌ |

## Migliorare un'app esistente
Nel repo dell'app (Kapibo, Turnotto…):
1. una volta: `npx github:Marketto/app-forge attiva-plugin` e fai commit di `.claude/settings.json`;
2. apri Claude Code e chiedi «usa app-forge:migliora-app» oppure «cosa manca a quest'app?»;
3. Claude lancia il controllo, ti propone al massimo 7 miglioramenti in ordine di importanza e aspetta che scegli;
4. poi ne fa uno alla volta, con test e un commit ciascuno.

Per prendere una funzione da un'altra app: «usa app-forge:porta-funzione: il tour di Kapibo qui».
Solo il controllo, senza AI: `npx github:Marketto/app-forge controlla`.

## Revisione di un progetto (qualsiasi repo)
Nella cartella del progetto:
```bash
npx -y github:Marketto/app-forge revisione
```
Apre Claude Code con il modello opus e il plugin caricato al volo, e lancia la skill `revisione`: 2 giri di un revisore indipendente, correzioni sicure applicate e testate, decisioni lasciate a te. Con il plugin già installato basta `claude --model opus "/app-forge:revisione"`.
Le regole scritte nel `CLAUDE.md`/`AGENTS.md` dell'app vincono sempre su quelle comuni.

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
Ottieni, con il prefisso `app-forge:`, le skill `regole-app`, `nuova-app`, `migliora-app`, `porta-funzione`, `revisione`, `mascotte-e-icone`, `traduzioni`, `verifica`, `rilascio`, `catalogo`,
gli agenti `architetto`, `revisore`, `ui-kawaii`, `traduttore`, `collaudatore`, `rilascio`, `router` e gli strumenti MCP (modalità 7).
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
Chi apre il repo con Claude Code si vede proporre il plugin. Per un'app già esistente: `npx github:Marketto/app-forge attiva-plugin` nel suo repo (aggiunge questo blocco senza toccare il resto).

## 4. Claude Code sul web (cloud)
Da https://claude.ai/code (anche dal telefono):
- **Lavoro su app-forge**: scegli il repo app-forge. Il file `.claude/settings.json` del repo vale anche nel cloud (hook, MCP, permessi).
- **Lavoro su un'app**: scegli il repo dell'app; il blocco della modalità 3 propone il plugin. In alternativa aggiungi app-forge alla stessa sessione: Claude legge le sue skill e può anche aggiornare il catalogo.
- **Nuova app**: crea prima su GitHub il repo vuoto, poi aggiungi alla sessione app-forge e il nuovo repo.

## 5. Riga di comando
Senza clonare (Node 20+):
```bash
npx github:Marketto/app-forge nuova-app --id volpe-note --nome "Volpe Note" \
  --mascotte Kitsu --animale volpe --colore "#ffd6a5" --descrizione "Note veloci offline."
npx github:Marketto/app-forge mascotte   # animali già usati
npx github:Marketto/app-forge app        # app del catalogo
npx github:Marketto/app-forge regole     # regole comuni
npx github:Marketto/app-forge controlla  # cosa manca all'app nella cartella corrente
npx github:Marketto/app-forge attiva-plugin  # attiva il plugin nel repo corrente
npx github:Marketto/app-forge revisione  # revisione in 2 giri con Claude Code (opus)
```
L'app viene creata nella cartella corrente. Dentro app-forge: `npm run nuova-app -- …` (aggiunge anche al catalogo), `npm run catalogo`, `npm run schermate`.

Con Claude senza interfaccia (script, CI):
```bash
claude -p "usa app-forge:nuova-app per un'app che tiene il diario delle piante"   # con il plugin installato
claude -p --plugin-dir /percorso/app-forge "…"                                       # senza installarlo
```

## 6. Altri agenti AI
Le regole e la tabella router stanno in `AGENTS.md` (anche nelle app create). Lo leggono:
- **Codex, Cursor, Copilot (agente), Jules, Aider e altri**: `AGENTS.md` direttamente;
- **Gemini CLI**: `GEMINI.md`, che importa `AGENTS.md`;
- **Copilot nell'editor**: `.github/copilot-instructions.md`, che rimanda ad `AGENTS.md`;
- **Claude Code**: `CLAUDE.md`, che importa `AGENTS.md` e aggiunge le cose solo sue.

Skill e agenti sono file Markdown in `.claude/`: gli altri agenti li leggono e li seguono quando la tabella li indica.
Per gli strumenti (nuova app, mascotte usate) collegali al server MCP (modalità 7).

## 7. Server MCP
Strumenti: `elenco_app`, `mascotte_usate`, `regole`, `da_dove_copiare`, `nuova_app`, `controlla_app`, `attiva_plugin`. Prompt: `crea_app` (idea → piano → scheletro), `migliora_app` (controllo → proposte → modifiche).
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
