---
status: active
active_engagement: compilar
last_checkpoint: 2026-07-05
---

# Sensai Compilar — Global Wiki Home

> **TL;DR:** Multi-tenant harness (v2.20) is built and verified. One engagement exists
> (`compilar`, active, empty). Pipeline commands always operate on the active engagement only.

## Engagement Registry

| Engagement | Directive (one line) | Status | Wiki home |
| :--- | :--- | :--- | :--- |
| **compilar** ← active | Transform raw research into computational models and economic value | Awaiting first corpus | [engagements/compilar/INDEX.md](engagements/compilar/INDEX.md) |

- Switch tenants with `/switch <name>`; create one with `/init-engagement <name>`.
- The active pointer lives in [.active_engagement](.active_engagement); the gate hook quarantines
  (to `.rejected/`) any pipeline write that targets a non-active engagement (context-bleed
  enforcement).

## System layer (shared across engagements)

- Templates (Progressive Disclosure schemas): [templates/](templates/)
- Subagents and skills: `.claude/agents/`, `.claude/skills/` (see root `CLAUDE.md` for the map)
- Standards: [README.md](README.md) (how to leverage the platform), [SKILL.md](SKILL.md)
  (how to add a phase)
- **Guides** (editing, maintaining, and getting strong outputs from this harness):
  [guides/00_INDEX.md](guides/00_INDEX.md)

Per-engagement state — goals, corpus, outcomes, telemetry — lives entirely inside each
engagement's folder and its own `INDEX.md`.
