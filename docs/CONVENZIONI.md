# Convenzioni: come applicare le regole R01–R20

Le regole sono **solo** in `.claude/skills/regole-app/SKILL.md`. Qui trovi, per ogni regola, dove è già fatta bene:
nel modello `template/pwa-statica` (punto di partenza di ogni app nuova) o in una delle 10 app esistenti.

| Regola | Nel modello | Esempio in un'app |
|---|---|---|
| R01 Mascotte kawaii animata | `js/mascot.js` (fonte unica), animazioni in `css/style.css` | Ottoteca `app/js/otto.js` (occhi che seguono), Schiaccia PDF `tools/mascot.mjs` |
| R02 Mascotte interattiva | `js/mascot-live.js`, frasi `mascot.ev.*` | Kapibo `cheer.js` |
| R03 Icone in font | `tools/icons/icons.mjs` → `npm run font` | Kapibo `tools/build-font.mjs`, Turnotto `tools/build-icons.py` |
| R04 Icona dell'app | `tools/icons.mjs` (sfondo calcolato) | Printopus `tools/mascot/takotta.py` |
| R05 Installabile | `js/install.js`, `manifest.webmanifest` | Kapibo (scheda «Installa») |
| R06 Offline e aggiornamenti | `sw.js`, `js/update.js`, `pages.yml` (versione nella cache) | Kapibo `sw.js` |
| R07 Versione e Condividi | piè di pagina, `js/share.js` | Kapibo (riga in alto) |
| R08 42 lingue | `js/i18n.js` (`LINGUE`), `tools/i18n-check.mjs --tutte` | Kapibo `locales/` (42), Turnotto e Schiaccia PDF (39) |
| R09 Accessibilità | `tools/ui-audit.mjs` (axe, WCAG 2.2 AA) | Turnotto `tools/ui-audit.mjs` |
| R10 Temi | `css/style.css`, `js/theme.js` (auto, chiaro, scuro, contrasto, daltonici) | — (nuovo) |
| R11 Responsive | `tools/ui-audit.mjs` (320–1920 px) | Turnotto |
| R12 Semplice | una scheda, un'azione principale | Hari Hari Puzzle |
| R13 Wizard | `js/tour.js` (focus + mascotte, novità per versione) | Kapibo `js/tour.js`, Lunibù `src/data/tour.js` |
| R14 Privacy e condizioni | `js/legal.js`, `locales/legal/`, `tools/legal-check.mjs` | Kapibo `js/legal.js` |
| R15 Statistiche anonime | `js/usage.js` (GoatCounter con consenso) | Hari Hari Puzzle `src/core/usage.js` |
| R16 Musica | `js/music.js` (WebAudio, interruttore) | Hari Hari Puzzle `src/core/fx.js`, Lunibù `src/lib/audio/` |
| R17 Background | `js/work.js` (Worker con avanzamento) | Schiaccia PDF (worker) |
| R18 Cloud | — (da portare) | Kapibo `js/sync/` (Dropbox, Google Drive), Mochi Spesa `js/dropbox.js` |
| R19 Codice | `js/logic/` + `tests/` | Hari `*-logic.js`, Printopus `src/core` |
| R20 Repo e consegna | `tools/privacy-check.mjs`, `pages.yml` | tutte |

## Note pratiche
- **Percorsi relativi**: l'app vive sotto `/<repo>/` su GitHub Pages.
- **Senza build** (predefinito): moduli ES, librerie copiate in `vendor/` e mai modificate. **Con build** solo se serve (Printopus: three.js + TypeScript; Lunibù: React): Vite + `vite-plugin-pwa`, `base: './'`.
- **App native** (SuriClean, Hoppy): il sito su Pages è la pagina di download; molte regole web (R05, R06, R11) si applicano solo al sito.
- **Dati**: `localStorage` per poco, IndexedDB per tanto (Ottoteca). Chiavi con prefisso `<id>:` per non mescolare le app sullo stesso dominio.
- **Richiamare una funzione da un'altra app** (R19): stesso dominio `marketto.github.io`, quindi un modulo pubblicato si può importare senza CORS (Kapibo usa il motore di Schiaccia PDF). Solo per moduli autonomi e stabili; altrimenti `porta-funzione`.
- **Scelte estetiche**: prima 2–4 proposte (schermate a 390 px), poi si implementa quella scelta.

## Lavoro con gli agenti
- `AGENTS.md` (letto da tutti gli agenti; `CLAUDE.md` lo importa con `@AGENTS.md`): breve, con router richiesta → skill → agente → modello/effort.
- Modelli economici per i lavori ripetitivi (haiku: test, rilascio), opus solo per architettura, revisione e logica difficile.
- **Risparmio token**: `grep -n` e lettura di sole righe utili; mai leggere `vendor/`, lingue diverse da it/en, file generati.
- **Chi scrive non verifica se stesso**: `collaudatore` e `revisore` lavorano con contesto nuovo.
- Prima i requisiti (`docs/REQUISITI.md`), poi il codice; lavoro in sospeso in `docs/TODO.md`.
