# App esistenti: da dove copiare

Quando serve una soluzione già fatta, prendila da qui invece di riscriverla. Molte sono già nel modello `template/pwa-statica` (vedi la tabella per regola in `docs/CONVENZIONI.md`): partire da lì è la scelta più semplice.

| Serve… | Copia da | File |
|---|---|---|
| Service worker con versione e moduli pesanti | Kapibo | `sw.js`, `.github/workflows/pages.yml` |
| Consenso privacy/condizioni con versione | Kapibo | `js/legal.js`, `locales/legal/` |
| Tour di benvenuto e novità per versione | Kapibo, Lunibù | `js/tour.js`, `src/data/tour.js` |
| Controllo dati sensibili | Kapibo, Lunibù | `tools/privacy-check.mjs`, `npm run check:secrets` |
| Controllo traduzioni in 39 lingue | Turnotto, Schiaccia PDF | `tools/i18n-check.mjs`, `tools/check-i18n.mjs` |
| Font di icone da SVG | Turnotto, Kapibo, Ottoteca | `npm run icons`, `tools/build-icons.py` |
| Mascotte da una fonte unica | Schiaccia PDF, Printopus | `tools/mascot.mjs`, `tools/mascot/takotta.py` |
| Mascotte interattiva | Ottoteca | `app/js/otto.js` |
| OCR e PDF nel browser | Schiaccia PDF (Kapibo lo riusa dallo stesso dominio) | `motore.js`, `vendor/` |
| Sincronizzazione Dropbox / Google Drive | Kapibo, Mochi Spesa | `js/sync/` (Kapibo), `js/dropbox.js` (Mochi) |
| Lazy load di moduli | Hari Hari Puzzle | `src/games/catalog.js` |
| Export Excel | Turnotto | sezione `EXCEL` di `app/app.js` |
| Agente AI dentro l'app (Claude API) | Printopus | `src/agent/`, `src/agent/config.ts` |
| Contenuti con fonti verificate | Lunibù | `content/`, agente `evidence-verifier` |
| Musica e suoni WebAudio | Hari Hari Puzzle, Lunibù | `src/core/fx.js`, `src/lib/audio/` |
| Build Android (TWA/APK) | Hari Hari Puzzle | skill `android-release` |
| App desktop native + release | SuriClean, Hoppy | `release.yml` |
| Statistiche anonime con consenso | Hari Hari Puzzle | `src/core/usage.js` (GoatCounter) |

## Mascotte già usate
riccio (Hari), capibara (Kapi), coniglio (Mochi, Hoppy), lontra (Otto di Ottoteca), gufo (Otto di Turnotto),
polpo (Takotta), suricata (Suri), luna (Lunibù), pallina schiacciata (Schiaccia PDF).
L'elenco aggiornato è sempre `catalog/apps.json`.
