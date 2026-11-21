---
name: rilascio
description: Pubblicare una nuova versione di un'app su GitHub Pages e controllare che i telefoni la ricevano (R06, R13, R14, R20).
---
# Rilascio

1. Skill `verifica` tutta verde (`npm test` e `npm run check`).
2. Aggiorna `APP_VERSION` in `js/version.js` (correzione = terza cifra, funzione = seconda, cambio grosso = prima) e la voce in `CHANGELOG.md`.
3. Funzione nuova visibile → passo in `js/tour.js` con `v` = nuova versione (R13).
4. Cambio di dati trattati, servizi o condizioni → aggiorna `locales/legal/*` e `POLICY_VERSION` in `js/legal.js`: gli utenti riaccettano (R14).
5. Commit in italiano con autore `Marketto <Marketto@users.noreply.github.com>`; push su `main` (R20).
6. Attendi `pages.yml` (`gh run watch` se disponibile): blocca se mancano lingue o testi legali.
7. Controlla che `https://marketto.github.io/<repo>/sw.js` abbia la nuova versione (R06).
8. Funzione nuova importante → in app-forge `npm run schermate -- <id>` e push (skill `catalogo`).
