# Convenzioni comuni

Regole ricavate da 10 app: Hari Hari Puzzle, Kapibo, Mochi Spesa, Ottoteca, Schiaccia PDF, Turnotto, Lunibù, Printopus, SuriClean, Hoppy.
Per ogni regola: cosa fare e dove trovare un esempio vero.

## 1. Architettura
- **PWA statica su GitHub Pages**, servita da `main` con `.github/workflows/pages.yml`. Percorsi sempre relativi (l'app vive sotto `/<repo>/`).
- **Senza build** (Kapibo, Turnotto, Schiaccia PDF, Ottoteca, Hari): `index.html` + `js/` + `css/`, librerie copiate in `vendor/` e mai modificate.
- **Con build** solo se serve (Printopus: three.js + TypeScript; Lunibù: React + contenuti generati). Vite + `vite-plugin-pwa`, `base: './'`.
- **App native** (SuriClean, Hoppy): il sito su Pages è la pagina di download; le app escono da `release.yml` con i tag.
- **Offline first**: service worker con cache che cambia nome a ogni versione; «rete prima» per l'app, «cache prima» per librerie pesanti (esempio: `Kapibo/sw.js`).
- **Lazy load**: moduli grandi caricati solo quando servono (Hari: `src/games/catalog.js`; Schiaccia: `compila.js`, `modifica.js`).
- **Logica pura separata dalla UI**, testabile con `node --test` (Hari: `*-logic.js`; Printopus: `src/core`).
- **Dati**: `localStorage` per poco, IndexedDB per tanto (Ottoteca). Sincronizzazione facoltativa con il cloud dell'utente (Dropbox / Google Drive), mai un server nostro. Chiavi pubbliche dei servizi solo nel sito pubblicato, iniettate da `pages.yml` con `vars.*` (Kapibo).

## 2. Mascotte e stile
- Ogni app ha **una mascotte animale kawaii** con nome, che commenta le azioni con frasi brevi, gentili, mai giudicanti (Kapibo `cheer.js`).
- **Animale mai già usato**: controlla `catalog/apps.json` (`mascotte.animale`).
- **Una sola fonte** per la mascotte (`tools/mascot.mjs` o `.py`): da lì escono SVG in pagina, icone 192/512/maskable, favicon. Mai ritoccare a mano i file generati.
- Mascotte interattiva quando ha senso (Ottoteca: occhi che seguono il puntatore, tocco = reazione) e con stati (`happy`, `think`, `sleep`, `wow`).
- Stile: forme tonde (raggio 20–28 px), ombre morbide, pastello, tema chiaro + scuro (`[data-theme]` o `prefers-color-scheme`). Colori **solo da variabili CSS**.
- Icone UI: font di icone generato da SVG (Kapibo, Turnotto, Ottoteca) o SVG inline; emoji solo nei testi.
- **Scelte estetiche: prima le proposte.** Per mascotte, colori o stile nuovi mostra 2–4 proposte (schermate a 390 px) e implementa solo quella scelta (Schiaccia PDF).

## 3. Testi e lingue
- Ogni testo visibile passa da `t("chiave")`. Fonte di verità `en.json` (o `it.json`), tutte le altre lingue allineate, stessi segnaposto `{nome}`.
- 39–43 lingue, RTL per `ar`. Controllo automatico `tools/i18n-check.mjs` nel workflow.
- Frasi intere con segnaposto, niente stringhe composte a pezzi (Printopus).

## 4. Accessibilità
- Contrasto AA (testo ≥ 4.5:1), bersagli ≥ 44 px, `aria-label` sui pulsanti a icona, `<dialog>` con `aria-labelledby` ed Esc.
- `prefers-reduced-motion` spegne le animazioni. Animazioni di feedback ≤ 600 ms.
- Layout provato a 390 px di larghezza. Controllo axe con Playwright dove c'è (Ottoteca, Turnotto).

## 5. Privacy e legale
- Repo pubblici: **nessun dato personale** (email, nomi, importi, IBAN, chiavi, file d'esempio). Esempi e test con dati inventati, creati al volo.
- `tools/privacy-check.mjs` nel workflow e prima del commit.
- Primo avvio: consenso a condizioni d'uso e privacy, con versione (`POLICY_VERSION`): se cambia, si riaccetta (Kapibo).
- Disclaimer chiaro dove serve (Lunibù: non è un dispositivo medico).

## 6. Versioni e rilascio
- Semver a tre cifre, in un posto solo, mostrata nell'app.
- Versione copiata nel nome cache del service worker al deploy, così i telefoni si aggiornano da soli.
- Funzione nuova → passo nel tour di benvenuto/novità con la versione (`tour.js`, `news`).
- Commit e push su `main`, autore `Marketto <Marketto@users.noreply.github.com>`. Poi attendi il deploy e controlla che `sw.js` online abbia la nuova versione.

## 7. Lavoro con gli agenti
- `CLAUDE.md` corto con **regole d'oro + tabella router** (richiesta → skill → agente → modello/effort).
- Agenti economici per lavori ripetitivi (haiku: test, rilascio), costosi solo per architettura e logica difficile (opus).
- **Risparmio token**: mappa del codice in `docs/` (file → funzioni), `grep -n` e lettura di sole righe utili; mai leggere `vendor/`, lingue diverse da it/en, file generati.
- **Chi scrive non verifica se stesso** (Lunibù: `evidence-verifier`). Ogni task si chiude con la skill `verifica`.
- Prima la documentazione, poi il codice: requisito in `docs/REQUISITI.md`, poi implementazione (Schiaccia PDF).
- Lavoro in sospeso in `docs/TODO.md`.
