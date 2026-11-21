# __NOME__ — guida per agenti

PWA statica, senza build e senza server, pubblicata su GitHub Pages da `main`. Mascotte: **__MASCOTTE__** (__ANIMALE__).
Lingua di lavoro: italiano semplice. Tono conciso. Creata con [app-forge](https://github.com/Marketto/app-forge): le regole comuni sono in `docs/CONVENZIONI.md` di quel repo.

## Regole d'oro
1. **Dati solo sul dispositivo.** Nessuna chiamata di rete con dati dell'utente. Nessun dato personale nel repo; autore commit `Marketto <Marketto@users.noreply.github.com>`.
2. **Senza build.** Moduli ES in `js/`, librerie in `vendor/` (mai modificate). Niente npm nel sito: solo strumenti in `tools/`.
3. **Logica pura** in `js/logic/` con test in `tests/`; `js/app.js` fa solo interfaccia.
4. **Ogni testo** passa da `t("chiave")`, in tutte le lingue di `locales/`. `node tools/i18n-check.mjs` deve passare.
5. **Colori solo da variabili** in `css/style.css`, tema chiaro e scuro. AA, bersagli ≥ 44 px, `aria-label`, `prefers-reduced-motion`, prova a 390 px.
6. **Mascotte da una fonte**: `js/mascot.js` → `npm run icons`. Mai ritoccare a mano le icone.
7. **Prima i requisiti** (`docs/REQUISITI.md`), poi il codice. Lavoro in sospeso in `docs/TODO.md`.
8. **Versione** solo in `js/version.js`; `pages.yml` la copia nella cache del service worker.
9. **Consegna = commit + push su `main`**, poi controlla che `sw.js` online abbia la nuova versione.

## Router
| Se la richiesta parla di… | Skill | Agente | Modello · effort |
|---|---|---|---|
| dati, architettura, sicurezza, funzione complessa | — | `architetto` | opus · high |
| mascotte, icone, stile, animazioni | `mascotte-e-icone` | `ui-kawaii` | sonnet · medium |
| testi, lingue | `traduzioni` | `traduttore` | sonnet · low |
| «funziona?», prima del commit | `verifica` | `collaudatore` | haiku · low |
| versione, pubblicazione | `rilascio` | `rilascio` | haiku · low |
| richiesta ambigua | — | `router` | haiku · low |

Una riga o un controllo noto: fallo direttamente.

## Mappa
```
index.html             shell
css/style.css          token di design e componenti
js/app.js              interfaccia
js/logic/              logica pura (testata)
js/i18n.js             t(), lingue (LANGS)
js/mascot.js           mascotte: unica fonte
js/store.js            salvataggio locale
js/version.js          versione
sw.js                  cache offline
locales/               testi
tools/                 i18n-check, privacy-check, icons
tests/                 node --test
```

## Comandi
```bash
npm test          # logica + traduzioni + privacy
npm run serve     # http://localhost:8000
npm run icons     # icone dalla mascotte
```
