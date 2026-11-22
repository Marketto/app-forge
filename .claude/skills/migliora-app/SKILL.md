---
name: migliora-app
description: Migliorare un'app già esistente di Marketto confrontandola con le regole comuni R01–R20, un miglioramento alla volta. Usala per «migliora questa app», «allinea Kapibo alle regole», «cosa manca a Turnotto?».
---
# Migliora un'app esistente

> **Percorsi**: `tools/`, `template/`, `docs/` sono nella radice di app-forge (`${CLAUDE_PLUGIN_ROOT}` se usi il plugin).

**Le regole dell'app vincono.** Prima leggi `CLAUDE.md` / `AGENTS.md` dell'app: quello che decide lì (stack, React, fonti, stile) vale più delle regole comuni. Non proporre di riscrivere l'app o di cambiare stack.

## 1. Fotografia (economica)
```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/controlla-app.mjs .        # da app-forge: node tools/controlla-app.mjs ../<app>
```
✅ ok · ⚠️ manca · ❔ da controllare a mano · ➖ non serve. Conferma ogni ⚠️ con `grep -n` mirati prima di proporlo.
Carica la skill `regole-app` (R01–R20) e, se serve, `docs/APP.md` (da dove copiare).

## 2. Proposta (aspetta la scelta)
Al massimo **7 miglioramenti**, in quest'ordine di importanza:
1. privacy e sicurezza (R14, R20);
2. offline, aggiornamenti, installazione (R05, R06);
3. accessibilità, temi, layout (R09, R10, R11);
4. lingue (R08);
5. test e struttura del codice (R19);
6. mascotte, icone, versione e Condividi (R01–R04, R07);
7. wizard, statistiche, musica, background, cloud (R13, R15–R18).
Per ognuno: codice della regola, cosa, perché in una riga, lavoro (piccolo/medio/grande), da dove prenderlo: il modello `template/pwa-statica` (temi, wizard, legale, statistiche, font di icone, audit UI) o un'altra app. Le domande «chiedi» (mascotte, musica, cloud) falle qui, a scelta.
Poi fermati: il proprietario sceglie.

## 3. Un miglioramento alla volta
1. Se l'app ha `docs/REQUISITI.md`, prima aggiorna il requisito.
2. Se il miglioramento cambia l'interfaccia o aggiunge una funzione: prima la skill `proposte` (pagina prima/dopo da scegliere). Poi la modifica più piccola che risolve; se esiste già nel modello o in un'altra app usa `porta-funzione`.
3. Testi nuovi → skill `traduzioni`.
4. Skill `verifica` (o i test dell'app) e riporta il risultato.
5. Un commit per miglioramento, in italiano.
Alla fine: skill `rilascio` se il proprietario vuole pubblicare.

## Da non fare
Cambiare stack, struttura o nomi pubblici senza richiesta esplicita; modificare `vendor/` o file generati; più di un miglioramento per commit.
