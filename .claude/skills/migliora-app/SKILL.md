---
name: migliora-app
description: Migliorare un'app già esistente di Marketto confrontandola con le regole comuni di app-forge, un miglioramento alla volta. Usala per «migliora questa app», «allinea Kapibo alle regole», «cosa manca a Turnotto?».
---
# Migliora un'app esistente

> **Percorsi**: `catalog/`, `docs/`, `tools/` sono nella radice di app-forge. Se lavori da un altro repo con il plugin, app-forge è in `${CLAUDE_PLUGIN_ROOT}`.

**Le regole dell'app vincono.** Prima leggi `CLAUDE.md` / `AGENTS.md` dell'app: quello che decide lì (stack, React, fonti, stile) vale più delle regole comuni. Non proporre di riscrivere l'app o di cambiare stack.

## 1. Fotografia (economica)
```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/controlla-app.mjs .        # da app-forge: node tools/controlla-app.mjs ../<app>
```
Il risultato è un controllo veloce sui file: ✅ ok, ⚠️ manca, ❔ da controllare a mano. Conferma ogni ⚠️ con `grep -n` mirati prima di proporlo: lo script può sbagliare.
Carica anche la skill `regole-app` (regole comuni) e, se serve, `docs/APP.md` (da dove copiare).

## 2. Proposta (aspetta la scelta)
Mostra al massimo **7 miglioramenti**, in quest'ordine di importanza:
1. privacy e sicurezza (dati sensibili, chiamate di rete con dati dell'utente);
2. funziona offline e si aggiorna (service worker, versione nella cache);
3. accessibilità (contrasto, 44 px, `aria-label`, `prefers-reduced-motion`);
4. lingue mancanti o chiavi non allineate;
5. test della logica e controlli automatici nel workflow;
6. tema scuro, colori da variabili, mascotte da una fonte;
7. tour/novità, LICENSE, guida per agenti, plugin attivo.

Per ognuno: cosa, perché in una riga, quanto lavoro (piccolo / medio / grande), da dove copiarlo se esiste già in un'altra app.
Poi fermati: il proprietario sceglie quali fare.

## 3. Un miglioramento alla volta
Per ognuno scelto:
1. se l'app ha `docs/REQUISITI.md`, prima aggiungi o aggiorna il requisito;
2. fai la modifica più piccola che risolve; se esiste già in un'altra app usa la skill `porta-funzione`;
3. testi nuovi → skill `traduzioni`;
4. skill `verifica` (o i test dell'app) e riporta il risultato;
5. un commit per miglioramento, messaggio in italiano.
Alla fine: skill `rilascio` se il proprietario vuole pubblicare.

## Da non fare
- Cambiare stack, struttura delle cartelle o nomi pubblici senza una richiesta esplicita.
- Modificare `vendor/`, file generati o le altre lingue a mano (usa `traduttore`).
- Toccare più di un miglioramento per commit.
