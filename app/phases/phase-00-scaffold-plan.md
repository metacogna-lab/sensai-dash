# Phase 0 — Phase Docs & Error Protocol

**Goal:** Author the build plan as `phase-*.md` before writing code, and satisfy the error-logging
protocol from `agents/tasks/PRD-tasks.md §1`.

## Deliverables
- [x] `app/phases/README.md` + `phase-00…06`.
- [x] `agents/errors/` exists (error log target `agents/errors/[TIMESTAMP]_[TYPE].md`).

## Notes
- Ground truth verified on disk (corrects the stale PRD): telemetry is per-engagement at
  `engagements/<name>/telemetry/execution.log` (pipe-delimited `TIMESTAMP | PHASE | WORK_BLOCK |
  TARGET | STATUS`); tenants are `compilar` (1 node: `node--demo-corpus.md`) and `isolation_demo`;
  active pointer `operations/.active_engagement`.

**Done when:** all phase docs exist and `agents/errors/` is present.
