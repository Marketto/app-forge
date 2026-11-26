---
name: proposte
description: Prima di modifiche all'interfaccia o di progettare una funzione nuova - analisi, revisione e una pagina HTML con le proposte prima/dopo da scegliere e commentare (anche dal telefono), che genera il prompt di risposta. Usala per «cambia la schermata…», «nuova funzione…», «migliora la UI…».
---
# Proposte da scegliere

> **Percorsi**: `tools/proposte.mjs` è in app-forge (`${CLAUDE_PLUGIN_ROOT}` se usi il plugin; senza: `npx -y github:Marketto/app-forge proposte`).

Quando: modifiche visibili dell'interfaccia, funzioni nuove, scelte di stile o mascotte. Non per correzioni di una riga o bug evidenti.
Nessun codice dell'app si tocca finché non arriva il prompt di risposta.

## 1. Chiedi prima, con scelte (una sola domanda multipla)
Usa AskUserQuestion (o una lista numerata se non c'è):
1. **Obiettivo**: 2–4 letture possibili della richiesta + «Altro».
2. **Quante proposte**: 2 · 3 (consigliato) · 4.
3. **Varianti visive**: «solo dove la scelta è estetica» (consigliato) · «per ogni proposta» · «nessuna».
4. **Dove consultare la pagina**: «Pagina privata su claude.ai, apribile da telefono e PC» (consigliato, se c'è lo strumento Artifact) · «File HTML da aprire sul PC» · «GitHub Pages del repo (pubblica: chiunque abbia il link)».

## 2. Analisi
- Leggi `docs/REQUISITI.md`, le regole R01–R20 (skill `regole-app`) e solo i file toccati (`grep -n`).
- Con le varianti la pagina mostra pulsanti A/B/C per sfogliarle prima di scegliere.
- Fotografa lo stato attuale («prima»): HTML statico che riproduce la schermata con le classi vere dell'app, oppure una schermata ridotta (JPEG ≤ 150 KB come `data:` URL; `npm run ui -- --shots /tmp/s` nelle app dal modello).

## 3. Bozza delle proposte
Agente `architetto` per le funzioni, `ui-kawaii` per l'interfaccia. Per ogni proposta: titolo, descrizione in 2 righe, regole che tocca (es. `R11`), pro, contro, lavoro (piccolo/medio/grande), «dopo» (o varianti con il proprio «dopo»).
I «dopo» sono HTML **statico** (niente script) con le classi e i token dell'app: devono sembrare l'app vera, nei testi italiani definitivi.

## 4. Revisione
Agente `revisore` (opus, contesto nuovo) sulle proposte: fattibilità nel codice attuale, coerenza con le regole e tra le proposte, accessibilità (contrasto, 44 px), semplicità (R12). Correggi o togli le proposte deboli, poi aggiorna `contesto` con un riassunto dell'analisi e della revisione.

## 5. Pagina
Scrivi la spec in `docs/proposte/<AAAA-MM-GG>-<tema>.json`:
```json
{
  "id": "<app>-<AAAA-MM-GG>-<tema>", "titolo": "…", "app": "…",
  "contesto": "Obiettivo… Analisi… Revisione…",
  "css": "(facoltativo) CSS in più per i riquadri",
  "proposte": [
    { "id": "P1", "titolo": "…", "descrizione": "…", "regole": ["R11"], "lavoro": "piccolo",
      "pro": ["…"], "contro": ["…"], "dispositivo": "phone",
      "prima": { "html": "<main>…</main>" },
      "dopo": { "html": "…", "altezza": 560 },
      "varianti": [ { "id": "A", "titolo": "…", "dopo": { "html": "…" } } ] }
  ]
}
```
«prima»/«dopo» accettano `html` (+ `css`, `altezza`), `img` (URL o `data:`) con `alt`, oppure `testo`.
```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/proposte.mjs docs/proposte/<file>.json --app . -o docs/proposte/<file>.html
```
`--app .` incorpora gli stili e il font di icone dell'app. Aprila a 390 e 1280 px (Playwright o browser): nessun errore, riquadri leggibili.

## 6. Pubblica e aspetta
Secondo la scelta del punto 1:
- **Artifact** (privato, telefono e PC): pubblica il file HTML con lo strumento Artifact; dai il link.
- **File**: invialo (SendUserFile) o indica il percorso.
- **GitHub Pages**: copia l'HTML in `proposte/` e fai push (pubblico!); link `https://marketto.github.io/<repo>/proposte/<file>.html`. Nel modello `pages.yml` pubblica la cartella `proposte/`.
Scrivi in una riga: «Per ogni proposta sì o no (con indicazioni se vuoi), poi premi Genera il prompt e incollamelo». Poi **fermati**.

## 7. Con il prompt di risposta
Ogni proposta arriva con uno di questi esiti:
- **SÌ** (con la variante scelta): realizzala; le «Migliorie», se ci sono, sono indicazioni da applicare.
- **RIPROVA** (era «no» con indicazioni): non realizzarla; prepara una nuova proposta secondo «Prova invece» e rifai i passi 3–6 solo per queste, in una nuova pagina (`…-v2`).
- **SCARTA** (era «no» senza indicazioni) e **NON DECISA**: non fare nulla.
Le «Note generali» valgono per tutte.

1. Segna l'esito nella spec (`"esito": "si|riprova|scarta"`, `"nota"`) e fai commit insieme al lavoro: resta la storia delle decisioni.
2. Per ogni «SÌ»: requisito in `docs/REQUISITI.md`, codice, testi (`traduzioni`), passo nel wizard se è una funzione visibile (R13), `verifica`. Un commit per proposta.
3. Se ci sono «RIPROVA», pubblica la nuova pagina insieme al resoconto di ciò che hai realizzato e fermati di nuovo.
