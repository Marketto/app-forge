---
name: catalogo
description: Aggiungere, aggiornare o nascondere un'app nel catalogo GitHub Pages di app-forge e rigenerare icone e schermate.
---
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
