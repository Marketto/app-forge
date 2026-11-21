# app-forge ✿

Fabbrica agentica delle app di Marketto e catalogo pubblico.

👉 **Catalogo: https://marketto.github.io/app-forge/** — icone su telefono, schermate su desktop.

## Cosa c'è
- **Agenti e skill** (`CLAUDE.md`, `.claude/`, anche come plugin di Claude Code) per creare nuove app con le regole delle app già fatte: PWA offline, senza server, mascotte kawaii, 39+ lingue, accessibili.
- **Modello di app** (`template/pwa-statica`): PWA senza build con mascotte, i18n, tema chiaro/scuro, service worker, test e deploy su Pages.
- **Catalogo** (`catalog/apps.json` → `_site/`): generato a ogni push; icone e schermate si aggiornano da sole ogni lunedì.

## Usarlo da un altro repo (plugin di Claude Code)
app-forge è anche un plugin: agenti e skill funzionano in qualsiasi repo.

**Installazione, una volta sola** (in Claude Code):
```
/plugin marketplace add Marketto/app-forge
/plugin install app-forge@app-forge
```
Con Claude Code 2.1.275 o successivo basta un comando: `/plugin install app-forge --marketplace Marketto/app-forge`.

**Per proporlo in automatico a chi apre un repo**, aggiungi a `.claude/settings.json` di quel repo:
```json
{
  "extraKnownMarketplaces": {
    "app-forge": { "source": { "source": "github", "repo": "Marketto/app-forge" } }
  },
  "enabledPlugins": { "app-forge@app-forge": true }
}
```

**Cosa ottieni** (con il prefisso `app-forge:`):
| Tipo | Nomi |
|---|---|
| Skill | `regole-app`, `nuova-app`, `mascotte-e-icone`, `traduzioni`, `verifica`, `rilascio`, `catalogo` |
| Agenti | `architetto`, `ui-kawaii`, `traduttore`, `collaudatore`, `rilascio`, `router` |

Esempi di richieste: «usa app-forge e fammi un'app che…», «applica le regole di app-forge a questo repo», «controlla questa app con app-forge:verifica».

**Aggiornare il plugin**: `/plugin marketplace update app-forge`. Quando cambi agenti o skill, alza `version` in `.claude-plugin/plugin.json`.

**Limiti**
- Il plugin è una copia: da un altro repo non può aggiungere app al catalogo. Per il catalogo apri una sessione su app-forge (skill `catalogo`).
- Il `CLAUDE.md` di app-forge non viene caricato dal plugin: le regole sono nella skill `regole-app`.
- Nelle sessioni cloud di Claude puoi anche, in alternativa, aggiungere app-forge alla sessione insieme al tuo repo.

## Creare una nuova app
Con Claude Code in questa cartella: «fammi un'app che…». Parte la skill `nuova-app`.
Da un altro repo con il plugin: «usa app-forge:nuova-app per un'app che…».
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
