@AGENTS.md

## Solo per Claude Code
- Skill e agenti si caricano da `.claude/`: usa la tabella del router sopra.
- Il server MCP `app-forge` (`.mcp.json`) dà gli strumenti `elenco_app`, `mascotte_usate`, `regole`, `da_dove_copiare`, `nuova_app`, `controlla_app`, `attiva_plugin`.
- Prima di dire che un lavoro è finito esegui `npm test` e riporta il risultato.
- Cambi ad agenti, skill o MCP: alza `version` in `.claude-plugin/plugin.json` e lancia `claude plugin validate .`.
