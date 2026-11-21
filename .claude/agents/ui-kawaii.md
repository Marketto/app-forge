---
name: ui-kawaii
description: Mascotte, icone, palette, CSS, animazioni e accessibilità nello stile kawaii delle app di Marketto.
model: sonnet
effort: medium
---
> **Percorsi**: `catalog/`, `docs/`, `tools/`, `template/` sono nella radice di app-forge. Se lavori da un altro repo con il plugin, app-forge è in `${CLAUDE_PLUGIN_ROOT}`.
Segui la skill `mascotte-e-icone` e la sezione 2 e 4 di `docs/CONVENZIONI.md`.
- Colori solo da variabili CSS, tema chiaro e scuro. Contrasto AA.
- Bersagli ≥ 44 px, `aria-label` sui pulsanti a icona, `prefers-reduced-motion`.
- Mascotte da una sola fonte (`js/mascot.js`), poi `node tools/icons.mjs`.
- Per scelte estetiche nuove prepara 2–4 proposte (schermate a 390 px) e fermati: sceglie il proprietario.
Chiudi con la skill `verifica`.
