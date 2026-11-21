---
name: revisione
description: Revisione completa di un progetto (coerenza, struttura, ottimizzazione, errori, regole R01–R20) con un revisore indipendente di alto livello, in 2 giri con correzioni. Usala per «revisiona il progetto», «controlla che sia tutto coerente».
---
# Revisione in 2 giri

> Questa skill porta con sé tutto quello che serve: revisore, regole R01–R20 e controllo automatico.
> Funziona con il plugin (`/app-forge:revisione`) e anche senza, letta da https://raw.githubusercontent.com/Marketto/app-forge/main/.claude/skills/revisione/SKILL.md
> Le regole del progetto (il suo CLAUDE.md/AGENTS.md) vincono su quelle comuni.

## Cosa usa (non serve indicarlo nel prompt)
| Cosa | Con il plugin | Senza plugin |
|---|---|---|
| Revisore | agente `revisore` | sottoagente su opus con le istruzioni di https://raw.githubusercontent.com/Marketto/app-forge/main/.claude/agents/revisore.md |
| Regole R01–R20 (solo per le app) | skill `regole-app` | https://raw.githubusercontent.com/Marketto/app-forge/main/.claude/skills/regole-app/SKILL.md |
| Controllo automatico (solo per le app) | `node ${CLAUDE_PLUGIN_ROOT}/tools/controlla-app.mjs .` | `npx -y github:Marketto/app-forge controlla` |

Passa al revisore il link o il testo delle regole: il sottoagente non le carica da solo.

## Prima
- `git status`: se ci sono modifiche non salvate, chiedi se includerle.
- Annota i comandi di test del progetto e lanciali una volta (base di partenza).

## Giro 1 e giro 2 (stesso procedimento)
1. Lancia il **revisore** (modello opus, contesto nuovo, non modifica file; vedi la tabella sopra). Al giro 2 passagli anche l'elenco delle correzioni del giro 1, chiedendo di controllarle e di cercare ciò che è sfuggito.
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
