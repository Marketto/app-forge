---
name: revisione
description: Revisione completa di un progetto (coerenza, struttura, ottimizzazione, errori, regole R01–R20) con un revisore indipendente di alto livello, in 2 giri con correzioni. Usala per «revisiona il progetto», «controlla che sia tutto coerente».
---
# Revisione in 2 giri

> **Percorsi**: `tools/controlla-app.mjs` e le regole sono in app-forge (`${CLAUDE_PLUGIN_ROOT}` se usi il plugin).
> Le regole del progetto (il suo CLAUDE.md/AGENTS.md) vincono su quelle comuni.

## Prima
- `git status`: se ci sono modifiche non salvate, chiedi se includerle.
- Annota i comandi di test del progetto e lanciali una volta (base di partenza).

## Giro 1 e giro 2 (stesso procedimento)
1. Lancia l'agente **`revisore`** (modello opus, contesto nuovo). Al giro 2 passagli anche l'elenco delle correzioni del giro 1, chiedendo di controllarle e di cercare ciò che è sfuggito.
2. **Verifica ogni punto** leggendo il codice: scarta i falsi allarmi (scrivi perché).
3. **Applica** i punti verificati e «sicuri»: errori, incoerenze, documentazione, duplicazioni, ottimizzazioni senza effetti visibili. Una modifica piccola per punto.
4. Punti «chiedere» (cambiano comportamento visibile, struttura o scelte): **non applicarli**, mettili in elenco per il proprietario.
5. Rilancia i test: se qualcosa si rompe, correggi o annulla quella modifica.
6. Un commit per giro: «Revisione giro N: …». Push solo se le regole del progetto lo prevedono o se il proprietario lo chiede.

## Alla fine
Riepilogo breve:
- tabella: trovati / corretti / scartati (falsi allarmi) / da decidere, per giro;
- le decisioni per il proprietario, ognuna in una riga con la tua raccomandazione (usa AskUserQuestion se c'è);
- risultato dei test prima e dopo.
