---
name: regole-app
description: Regole comuni delle app di Marketto (PWA offline, mascotte kawaii, i18n, accessibilità, privacy, rilascio). Caricala prima di creare o modificare un'app. Nelle app esistenti le regole del loro CLAUDE.md/AGENTS.md vincono.
---
# Regole comuni delle app di Marketto

> Dettagli ed esempi: `docs/CONVENZIONI.md` e `docs/APP.md` nella radice di app-forge (`${CLAUDE_PLUGIN_ROOT}` se usi il plugin).

1. **Niente server, dati sul dispositivo.** PWA statica su GitHub Pages, offline first. Nessuna chiamata di rete con dati dell'utente. Unica telemetria: GoatCounter anonimo, facoltativo, con consenso.
2. **Senza build quando si può.** Vanilla JS, librerie in `vendor/`. React + Vite solo se serve davvero.
3. **Mascotte kawaii, animale nuovo** (elenco in `catalog/apps.json`). Una sola fonte SVG (`js/mascot.js`), icone generate da lì.
4. **Ogni testo passa da `t("chiave")`**, in tutte le lingue di `locales/`. `tools/i18n-check.mjs` deve passare.
5. **Colori solo da variabili CSS**, tema chiaro + scuro. AA, bersagli ≥ 44 px, `aria-label`, `prefers-reduced-motion`, prova a 390 px.
6. **Logica separata dalla UI**, testata con `node --test`.
7. **Nessun dato personale nel repo.** Autore commit `Marketto <Marketto@users.noreply.github.com>`. `tools/privacy-check.mjs` blocca.
8. **Versione in un posto solo** (`js/version.js`), copiata nella cache del service worker al deploy.
9. **Funzione nuova = passo nel tour/novità.**
10. **Consegna = commit + push su `main`**, poi controlla la versione online.

Router: nuova app → `nuova-app` + agente `architetto`; app esistente → `migliora-app`; funzione da un'altra app → `porta-funzione`; stile → `mascotte-e-icone` + `ui-kawaii`; testi → `traduzioni` + `traduttore`; controlli → `verifica` + `collaudatore`; pubblicazione → `rilascio`.
