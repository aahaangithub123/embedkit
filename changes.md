# EmbedKit — Master Change Log

## Architecture Invariants
- Static deploy: no backend, no auth, localStorage persistence.
- AI touches natural-language input ONLY. All filtering/math is deterministic code.
- Money stored as integer priceCents. No float money math.
- Component data = static JSON in /data, merged by loader.ts.

## Decision Log
| Date | Day | Decision / Change | Files |
|------|-----|-------------------|-------|
| 2026-06-23 | 1 | Project scaffolded, folder skeleton created | (init) |
| 2026-06-23 | 1 | Component schema locked (PowerState, BusInterface, PassiveCircuit, Component) | lib/data/schema.ts |
| 2026-06-23 | 1 | AI config stub added; provider swap point established (Gemini default, Groq/OpenRouter/Ollama documented) | config/ai.config.ts |
| 2026-06-23 | 1 | Day 1 audit: tsc clean, env secured, scaffold + deploy deferred to Backlog | day-1.md |
