---
name: rilascio
description: Pubblicare una nuova versione di un'app su GitHub Pages e controllare che i telefoni la ricevano.
---
# Rilascio

1. Skill `verifica` tutta verde.
2. Aggiorna `APP_VERSION` in `js/version.js` (semver: correzione = terza cifra, funzione = seconda, cambio grosso = prima) e la voce in `CHANGELOG`.
3. Funzione nuova visibile → passo in `js/tour.js` con `v` = nuova versione.
4. Cambio di privacy o condizioni → aggiorna i testi legali e `POLICY_VERSION`.
5. Commit in italiano con autore `Marketto <Marketto@users.noreply.github.com>`; push su `main`.
6. Attendi il workflow `pages.yml` (`gh run watch` se disponibile) e controlla che `https://marketto.github.io/<repo>/sw.js` contenga la nuova versione.
7. Funzione nuova importante → in app-forge `npm run schermate -- <id>` e push (skill `catalogo`).
