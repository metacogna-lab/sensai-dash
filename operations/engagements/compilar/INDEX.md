---
status: active
engagement: compilar
current_focus: Awaiting first corpus and stated strategic outcome
last_checkpoint: 2026-07-05
---

# Engagement: compilar — Wiki Home

> **TL;DR:** No research ingested yet. Start by dropping sources into `research_body/00_inbox/`
> (PDFs) or `research_body/01_raw/` (text) and running `/question` with your stated strategic
> outcome. (Make sure this engagement is active: `/switch compilar`.)

This file is the engagement's index-first entry point: skim it, then drill into linked artifacts.
Every pipeline skill updates the relevant section here as part of its Work Block — if an artifact
isn't listed here, it effectively doesn't exist for downstream agents. All paths are relative to
this engagement's folder.

## Run Status

| Phase | Command | Agent (model) | Queue | Done | Blockers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| QUESTION | `/question` | strategist (fable) | — | 0 | Awaiting stated outcome |
| EXTRACT | `/extract` | — (pdftotext) | 0 inbox | 0 | None |
| CONSUME | `/consume` | consumer (haiku) | 0 raw | 0 | None |
| INDEX | `/index` | indexer (sonnet) | — | 0 | Needs nodes |
| ANALYZE | `/analyze` | analyst (sonnet) | 0 nodes | 0 | Needs `goals/research_questions.md` |
| EVALUATE | `/evaluate` | evaluator (opus) | 0 | 0 | Needs a theory |
| VERIFY | `/stress-test` | verifier (opus) | 0 | 0 | Needs an artifact |
| SYNTHESIZE | `/synthesize` | synthesist (fable) | — | 0 | Needs verified material |
| BROADCAST | `/broadcast` | broadcaster (haiku) | 0 | 0 | Needs verified model |
| LONGITUDINAL | `/longitudinal` | historian (sonnet) | — | 0 | Needs ≥2 days of history |
| AUDIT | `/daily-summary` | auditor (sonnet) | — | 0 | None |

Latest audit: none yet. Latest longitudinal report: none yet.

## Goals
- [Primary directive](goals/primary_directive.md)
- [Active milestones](goals/active_milestones.md)
- Research questions: **not yet calibrated** — run `/question`

## Corpus (research_body/)
- Inbox (binary, pre-extraction): empty
- Raw (text, pre-consumption): empty
- Nodes: none yet
- Corpus map / baseline: **not yet built** — run `/index` after consuming
- **Quarantine queue (human review required):** empty

## Outcomes
- Theories: none yet
- Economic models: none yet
- Verifications: none yet
- **Alignment (run deliverable):** none yet
- Broadcast: none yet
- Longitudinal reports: none yet

## Telemetry
- Work Block ledger: [telemetry/execution.log](telemetry/execution.log) (flat text, append-only —
  written by the gate hook, not by hand)
