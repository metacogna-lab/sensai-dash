---
status: active
active_engagement: isolation_demo
last_checkpoint: 2026-07-05
---

# Sensai Mission Control — Global Wiki Home

> **TL;DR:** Harness (v2.20) is built and verified, including per-engagement standalone git
> repos with automatic Work Block commits. Two engagements exist: `compilar` (has processed one
> demo corpus) and `isolation_demo` (a deliberate second tenant, created live to verify
> isolation — see its `INDEX.md`).

## Engagement Registry

| Engagement | Directive (one line) | Status | Wiki home |
| :--- | :--- | :--- | :--- |
| compilar | Transform raw research into computational models and economic value | Consumed one demo corpus | [../engagements/compilar/INDEX.md](../engagements/compilar/INDEX.md) |
| **isolation_demo** ← active | Verify per-engagement repo isolation (no research content) | Verification in progress | [../engagements/isolation_demo/INDEX.md](../engagements/isolation_demo/INDEX.md) |

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
