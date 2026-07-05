# Sensai Compilar

> Operator manual — what to type, what happens, how to respond when the pipeline stops:
> [HOW_TO.md](../HOW_TO.md) (repo root).

Sensai Compilar is an agentic research-and-development pipeline, orchestrated by Claude Code, that
takes raw research (PDFs, papers, transcripts, notes) and ruthlessly distills it into verified
strategic answers, deployable product specs, and economic models. It is a one-way valve: research
is fuel, not the deliverable.

It is also an **LLM wiki**: every artifact is a small, typed Markdown page with frontmatter and
`[[wikilinks]]`, indexed from home pages. [INDEX.md](INDEX.md) is the global home (engagement
registry); each engagement has its own `INDEX.md`. Agents navigate index-first — skim the index,
drill into linked pages — instead of re-reading the corpus.

## Engagement workspaces

The harness provides isolated engagement workspaces (PRD v1.00's "multi-tenancy", relabeled per review U3 until real tenancy — T1 — lands): **system logic** (`.claude/` agents/skills/hooks +
`operations/templates/`) is global; **engagement state** (goals, corpus, outcomes, telemetry, wiki
home) is isolated per tenant under `operations/engagements/<name>/`. Exactly one engagement is active
at a time, named by the `operations/.active_engagement` pointer:

- `/init-engagement <name>` — scaffold a new isolated engagement and switch to it.
- `/switch <name>` — change the active engagement (primes context from its `INDEX.md`).
- **Context-bleed enforcement is mechanical, not honor-system:** the gate hook derives the owning
  engagement from every gated write path and deletes + blocks any write that targets a non-active
  engagement, and the engagement segment is sanitized against path traversal (`..`).

All pipeline commands below operate on the active engagement; `<eng>` means
`operations/engagements/$(cat operations/.active_engagement)`.

## How to leverage the platform

**The golden path for a new research run:**

0. **Pick the tenant.** `/switch <name>` (or `/init-engagement <name>` for a new domain). Never
   mix domains in one engagement — isolation is the point.
1. **Stage sources.** Drop PDFs/binaries into `<eng>/research_body/00_inbox/`, plain text into
   `<eng>/research_body/01_raw/`.
2. **`/question "<your strategic outcome>"`** — the single highest-leverage step. A fable-tier
   strategist converts your goal into falsifiable research questions and hard constraints
   (`<eng>/goals/research_questions.md`). Everything downstream is filtered through them; a sharper
   outcome statement buys you a sharper entire run.
3. **`/extract <file|all>`** then **`/consume <file>`** per source — PDFs become text, text becomes
   typed Nodes. Cheap (haiku) and parallelizable: batch-consume the whole corpus before analyzing.
4. **`/index`** — builds `<eng>/research_body/corpus_map.md`: the cross-document entity map and the
   documented **as-is baseline**. Run it after every meaningful batch of consumes; the analyst's
   gap analysis is only as good as this map.
5. **`/analyze <nodes...>`** — synthesizes Theories against the research questions.
   Contradictions the analyst cannot resolve are filed to `<eng>/research_body/04_quarantine/` — **that
   queue is yours, not the pipeline's**: review conflicts, record a resolution, archive them. A
   growing quarantine queue is the #1 sign your run needs human input.
6. **`/evaluate <theory>`** — an opus-tier evaluator forces each theory to a concrete monetization
   vector, product spec, or IP model. "Could be valuable" gets rejected by the gate.
7. **`/stress-test <artifact>`** — the self-audit. Every claim is classified
   grounded/extrapolated/unsupported against the corpus and constraints, with a hard
   PASS/PASS-WITH-NOTES/FAIL verdict. Stress-test theories and models *before* building on them —
   FAIL material is inadmissible downstream.
8. **`/synthesize`** — compiles verified theories + models + verdicts into the run's primary
   deliverable: the strategic alignment document (`<eng>/outcomes/04_alignment/`), with step-by-step
   execution detail cross-referenced to sources and quarantined conflicts carried as open risks.
   Stress-test it too, then **`/broadcast`** it into external-facing copy.

**Keeping the system honest (run these on a rhythm):**

- `/daily-summary` — end each working session with it: audits today's Work Blocks against goals,
  returns 3 hard questions about drift.
- `/longitudinal [window]` — weekly or per-milestone: conversion funnel (raw→nodes→theories→models),
  question-coverage trajectory, conflict burn-down, recurring drift. This is where you catch
  "consuming a lot, evaluating nothing" before it costs a month.
- `/bootstrap` — any time the environment changes; verifies the whole harness.

**Leverage rules of thumb:**

- Don't skip `/question`. Analysis against a vague goal is the failure mode this system exists to
  prevent (the analyst literally refuses).
- Trust the gates. If a write gets rejected and deleted, the output was malformed — re-run the
  phase; never hand-edit an artifact into passing shape.
- Watch `INDEX.md`, not the directories. Skills keep it current; it is the system's working memory.
- The quarantine queue and FAIL verdicts are the only two places the pipeline *stops and waits for
  you* — service them promptly and the rest runs autonomously.

## Pipeline & I/O Contract

Every phase reads from exactly one layer and writes to exactly one layer. The gate hook enforces
the schema (from `templates/`) on every write and logs the Work Block.

| Phase | Command | Agent (model) | Reads | Writes | Gate (beyond type/status/body) |
|---|---|---|---|---|---|
| QUESTION | `/question` | strategist (fable) | stated outcome + staged titles | `<eng>/goals/research_questions.md` | — |
| EXTRACT | `/extract` | — (`pdftotext`, Read fallback) | `<eng>/research_body/00_inbox/` | `<eng>/research_body/01_raw/*.txt` (source → `03_archive/`) | non-empty prose (manual; Bash path logs via `append_log.sh`) |
| CONSUME | `/consume` | consumer (haiku) | `<eng>/research_body/01_raw/` | `<eng>/research_body/02_nodes/node--<slug>.md` (raw → `03_archive/`) | — |
| INDEX | `/index` | indexer (sonnet) | all of `02_nodes/` | `<eng>/research_body/corpus_map.md` (overwrite; git keeps history) | `## Baseline (As-Is)` |
| ANALYZE | `/analyze` | analyst (sonnet) | `02_nodes/` + `corpus_map.md` + research questions | `<eng>/outcomes/01_theories/theory--<slug>.md` | — |
| QUARANTINE | (via `/analyze`) | — | theory `## Open Conflicts` | `<eng>/research_body/04_quarantine/conflict--<slug>.md` | human-resolved only |
| EVALUATE | `/evaluate` | evaluator (opus) | `<eng>/outcomes/01_theories/` | `<eng>/outcomes/02_economic_models/econ--<slug>.md` | `## Monetization Vector` |
| VERIFY | `/stress-test` | verifier (opus) | one artifact + its `source:` chain + constraints | `<eng>/outcomes/03_verification/verify--<stem>.md` | `## Verdict` |
| SYNTHESIZE | `/synthesize` | synthesist (fable) | verified theories/models + quarantine + corpus map | `<eng>/outcomes/04_alignment/alignment--<slug>--<date>.md` | `## Execution Detail` |
| BROADCAST | `/broadcast` | broadcaster (haiku) | verified `economic_models/` or `alignment/` | `<eng>/outcomes/05_broadcast/post--<slug>.md` | no FAIL-verdict inputs |
| LONGITUDINAL | `/longitudinal` | historian (sonnet) | `<eng>/telemetry/execution.log` + dated artifacts | `<eng>/outcomes/longitudinal/long--<window>--<date>.md` | grounded numbers only |
| AUDIT | `/daily-summary` | auditor (sonnet) | today's log + `<eng>/goals/` | `<eng>/goals/audits/summary_<date>.md` | — |

Model routing is native: each agent's `model:` frontmatter in `.claude/agents/` fixes its tier — no
API keys, no router scripts.

## Logging & Work Blocks

Every gated write appends one dense line to `<eng>/telemetry/execution.log`
(`TIMESTAMP | PHASE | WB-ID | TARGET | STATUS` where STATUS ∈ SUCCESS/GATED/FAIL), written by the
hook — never by hand (sole exception: `/extract`, whose Bash-created files the Write hook can't
see). One skill invocation = one Work Block = one git commit `[PHASE] WB-<id>: <summary>`.

See [SKILL.md](SKILL.md) for the standard any new phase must follow, and the root `CLAUDE.md` for
how this fits the whole repository.
