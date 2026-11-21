---
name: mascotte-e-icone
description: Disegnare o cambiare la mascotte kawaii di un'app e rigenerare icone, favicon e immagini da una fonte unica.
---

> **Percorsi**: `catalog/`, `docs/`, `tools/`, `template/` sono nella radice di app-forge. Se lavori da un altro repo con il plugin, app-forge è in `${CLAUDE_PLUGIN_ROOT}`.
# Mascotte e icone

- **Animale nuovo**: controlla `catalog/apps.json` di app-forge; mai un animale già usato.
- **Fonte unica**: `js/mascot.js` esporta `mascotSVG({ mood, size })`. La pagina la usa direttamente; `tools/icons.mjs` la usa per icone e favicon. Mai ritoccare a mano SVG o PNG generati.
- **Stile**: testa grande, occhioni lucidi con due riflessi, guance rosa, contorno morbido scuro (non nero puro), pastello. Un accessorio riconoscibile (es. lo yuzu di Kapi). Leggibile a 48 px.
- **Stati**: almeno `happy`, `think`, `wow`, `sleep`. Animazioni brevi (≤ 600 ms), spente da `prefers-reduced-motion`.
- **Icone**: `node tools/icons.mjs` → `icons/icon.svg`, `icon-192.png`, `icon-512.png`, `maskable-512.png` (mascotte nel 80% centrale, sfondo pieno del colore principale).
- **Frasi**: in `locales/*.json` sotto `mascot.*`, più varianti separate da `|`, brevi, gentili, mai giudicanti.
- **Proposte prima**: per una mascotte nuova mostra 2–4 varianti affiancate (schermata a 390 px) e fai scegliere.
