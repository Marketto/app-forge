---
name: porta-funzione
description: Copiare una funzione già fatta da un'app di Marketto a un'altra (es. il tour di Kapibo in Ottoteca, la sync Dropbox, l'export Excel di Turnotto), adattandola.
---
# Porta una funzione da un'app all'altra

> **Percorsi**: `docs/APP.md` e `catalog/apps.json` sono nella radice di app-forge (`${CLAUDE_PLUGIN_ROOT}` se usi il plugin).

1. **Trova l'origine** in `docs/APP.md` (tabella «Serve… / Copia da / File») o nel modello `template/pwa-statica` (temi, wizard, legale, statistiche, musica, Worker, font di icone, audit UI). Se non c'è, chiedi da quale app prenderla.
   **Richiamare o copiare? (R19)** Se il modulo è autonomo e stabile e l'app d'origine è su `marketto.github.io`, puoi importarlo dal suo indirizzo pubblicato (stesso dominio, nessun problema CORS; aggiungilo alla cache del service worker). Se va adattato, copialo.
2. **Leggi solo i file utili** dell'app di origine: clona con `git clone --depth 1 https://github.com/Marketto/<repo> /tmp/<repo>` e usa `grep -n` per trovare punti d'ingresso, dipendenze e testi (`t("…")`). Non leggere tutto il repo.
3. **Piano breve** (aspetta l'ok): file da copiare, cosa cambia (nomi, chiavi di storage, testi, mascotte, colori), dipendenze in `vendor/`, impatto sul service worker.
4. **Copia e adatta** nell'app di destinazione:
   - prefisso delle chiavi di storage dell'app di destinazione (mai condividere dati tra app);
   - testi con le chiavi e la mascotte dell'app di destinazione → skill `traduzioni`;
   - colori dalle variabili CSS della destinazione, niente colori dell'origine;
   - aggiungi i nuovi file alla cache del service worker;
   - logica pura con i suoi test (copia anche i test dell'origine, adattati).
5. **Verifica** con la skill `verifica`; passo nel tour/novità se la funzione è visibile.
6. **Commit** in italiano che cita l'origine: «Tour di benvenuto (da Kapibo)».
7. Se la funzione ora è in un'app in più, aggiungila alla riga giusta di `docs/APP.md` in app-forge.
