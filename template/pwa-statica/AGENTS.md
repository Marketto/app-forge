# __NOME__ — guida per agenti (Claude, Codex, Cursor, Copilot, Gemini…)

PWA statica, senza build e senza server, pubblicata su GitHub Pages da `main`. Mascotte: **__MASCOTTE__** (__ANIMALE__).
Lingua di lavoro: italiano semplice. Tono conciso. Identificatori del codice in inglese.
Creata con [app-forge](https://github.com/Marketto/app-forge).

## Regole
**Regole comuni R01–R20: `.claude/skills/regole-app/SKILL.md` — leggile prima di ogni modifica.** Le regole scritte qui sotto vincono su quelle comuni.
Specifiche di quest'app:
1. Scelte fatte alla creazione (mascotte, musica, cloud, statistiche) in `js/config.js`: cambiale lì.
2. Prima i requisiti (`docs/REQUISITI.md`), poi il codice. Lavoro in sospeso in `docs/TODO.md`.
3. Consegna = `npm test` + `npm run check` verdi, commit e push su `main` (skill `rilascio`).

## Router
| Se la richiesta parla di… | Skill | Agente | Modello · effort |
|---|---|---|---|
| dati, architettura, sicurezza, funzione complessa | — | `architetto` | opus · high |
| mascotte, icone, stile, animazioni | `mascotte-e-icone` | `ui-kawaii` | sonnet · medium |
| testi, lingue | `traduzioni` | `traduttore` | sonnet · low |
| «funziona?», prima del commit | `verifica` | `collaudatore` | haiku · low |
| versione, pubblicazione | `rilascio` | `rilascio` | haiku · low |
| revisione completa | `revisione` (plugin app-forge) | `revisore` | opus · high |
| richiesta ambigua | — | `router` | haiku · low |

Skill in `.claude/skills/<nome>/SKILL.md`, agenti in `.claude/agents/<nome>.md`. Agenti diversi da Claude Code: leggi quei file e seguili (ignora `model`/`effort`).
Una riga o un controllo noto: fallo direttamente.

## Mappa
```
index.html             shell: barra (Installa, Condividi, Musica, ?, Impostazioni), contenuto, piè con versione
css/style.css          token e temi (chiaro, scuro, alto contrasto, daltonici), componenti, animazioni
css/icons.css          GENERATO da npm run font (non toccare)
js/app.js              avvio e collegamenti dell'interfaccia
js/config.js           scelte dell'app (R01, R15, R16, R18)
js/logic/              logica pura, testata (items, backup = esporta/importa)
js/i18n.js             t(), LINGUE (le 42 obbligatorie)
js/mascot.js           mascotte: unica fonte (funzione pura)
js/mascot-live.js      mascotte viva: occhi, tocco, frasi, sonno
js/theme.js            temi        js/share.js   Condividi       js/install.js  Installa
js/update.js           aggiornamenti automatici             js/tour.js     wizard (passi con versione)
js/legal.js            consenso + scarico di responsabilità js/usage.js    statistiche anonime
js/music.js            musica facoltativa                    js/work.js     Worker per lavori lunghi
js/store.js            salvataggio locale                    js/version.js  versione
sw.js                  cache offline
locales/, locales/legal/   testi e testi legali (42 lingue)
CHANGELOG.md           novità per versione
tools/                 i18n-check, legal-check, privacy-check, ui-audit, icons, build-font, colors
tests/                 node --test
```

## Comandi
```bash
npm test          # logica, lingue, legali, privacy
npm run check     # 42 lingue, legali adattati, UI in 5 larghezze × 4 temi (axe)
npm run serve     # http://localhost:8000
npm run icons     # icone dalla mascotte          npm run font   # font di icone
```
