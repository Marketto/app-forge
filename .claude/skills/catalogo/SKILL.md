---
name: catalogo
description: Aggiungere, aggiornare o nascondere un'app nel catalogo GitHub Pages di app-forge e rigenerare icone e schermate.
---

> **Percorsi**: `catalog/`, `docs/`, `tools/`, `template/` sono nella radice di app-forge. Se lavori da un altro repo con il plugin, app-forge è in `${CLAUDE_PLUGIN_ROOT}`.
# Catalogo

Fonte unica: `catalog/apps.json`. Campi:
`id` (= nome del repo), `nome`, `repo`, `url`, `descrizione` (una riga, max ~80 caratteri), `categoria`,
`mascotte {nome, animale}`, `piattaforme`, `stack`, `colore`, `stato` (`attiva` | `prova` | `in sviluppo` | `nascosta`).
Facoltativi: `iconaManuale: true` (icona messa a mano in `site/icons/`, es. app native senza manifest),
`screenshot: { passi: ["testo da cliccare", …], generico: false }` per superare benvenuti e consensi.

1. Modifica `catalog/apps.json`.
2. `npm run schermate -- <id>` → `site/icons/<id>.png` (dal manifest dell'app) e `site/screenshots/<id>.jpg` (1280×800).
   Guarda la schermata: se c'è ancora un dialogo, aggiungi i `passi` e ripeti.
3. `npm test`, poi commit e push: `pages.yml` pubblica il catalogo.
Le schermate si aggiornano anche da sole ogni lunedì (`schermate.yml`).

La pagina ha la mascotte di app-forge, **Forgino il leone** (fonte unica `site/mascot.mjs`: pagina e favicon), la versione presa da `.claude-plugin/plugin.json`, Condividi e la striscia «Cos'è app-forge» con le modalità d'uso (array `MODI` in `tools/build-catalog.mjs`). Cambi visibili: prima la skill `proposte`.
