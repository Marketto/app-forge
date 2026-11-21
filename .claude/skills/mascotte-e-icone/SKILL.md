---
name: mascotte-e-icone
description: Disegnare o cambiare la mascotte kawaii (stile giapponese anni '90/2000, animata e interattiva), le icone dell'interfaccia in font e l'icona dell'app. Regole R01–R04.
---
# Mascotte e icone

> **Percorsi**: `catalog/apps.json` è nella radice di app-forge (`${CLAUDE_PLUGIN_ROOT}` se usi il plugin).

## Mascotte (R01–R02)
- **Chiedi prima**: mostra 2–4 proposte affiancate (schermata a 390 px) e fai scegliere. Animale mai già usato (`catalog/apps.json`).
- **Stile kawaii giapponese anni '90/2000**: testa grande e corpo piccolo, occhioni lucidi con due riflessi, guance rosa, contorno morbido scuro (non nero puro), pastello, un accessorio riconoscibile. Leggibile a 48 px.
- **Fonte unica** `js/mascot.js`: `mascotSVG({ mood, size })`, funzione pura. Mantieni i gruppi `m-body` (respiro), `m-eyes` (ciglia) e `m-pupils` (occhi che seguono): `js/mascot-live.js` e il CSS li animano.
- **Stati**: almeno `happy`, `think`, `wow`, `sleep`. Animazioni realistiche e leggere (respiro lento, battito di ciglia, salto con schiacciamento), ≤ 600 ms per le reazioni, spente da «riduci movimento».
- **Frasi** in `locales/*.json` sotto `mascot.ev.*`: più varianti separate da `|`, brevi, gentili, motivazionali, mai giudicanti. Al tocco: `mascot.ev.cheer`.

## Icone dell'interfaccia (R03)
- In font: disegna i simboli in `tools/icons/icons.mjs` (SVG 24×24, tratti tondi da 2, stile della mascotte) e lancia `npm run font` → `fonts/app-icons.woff2` + `css/icons.css`.
- Simboli standard: condividi (tre nodi), impostazioni (ingranaggio), chiudi (X), aiuto (?), installa (freccia giù nel vassoio), cestino, più… Non inventare metafore.
- In pagina: `<i class="ic ic-share" aria-hidden="true"></i>` dentro un pulsante con `aria-label` (o testo visibile).

## Icona dell'app (R04)
- `npm run icons` → `icons/icon.svg`, `icon-192.png`, `icon-512.png`, `maskable-512.png`.
- Sfondo pieno che esalta i colori della mascotte: calcolato da `tools/icons.mjs` (contrasto ≥ 3:1 col corpo) oppure scelto in `COLORS.iconBg`. Controlla il risultato a 48 px su sfondo chiaro e scuro.
- Mai ritoccare a mano SVG o PNG generati.
