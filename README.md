# app-forge ✿

Fabbrica agentica delle app di Marketto e catalogo pubblico.

👉 **Catalogo: https://marketto.github.io/app-forge/** — icone su telefono, schermate su desktop.

## Cosa c'è
- **Agenti e skill** (`CLAUDE.md`, `.claude/`) per creare nuove app con le regole delle app già fatte: PWA offline, senza server, mascotte kawaii, 39+ lingue, accessibili.
- **Modello di app** (`template/pwa-statica`): PWA senza build con mascotte, i18n, tema chiaro/scuro, service worker, test e deploy su Pages.
- **Catalogo** (`catalog/apps.json` → `_site/`): generato a ogni push; icone e schermate si aggiornano da sole ogni lunedì.

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
