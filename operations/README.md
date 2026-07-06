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
home) is isolated per tenant under `engagements/<name>/` (repo root — a sibling of `.claude/` and
`operations/`, not nested inside either). Exactly one engagement is active at a time, named by the
`operations/.active_engagement` pointer:

- `/init-engagement <name>` — scaffold a new isolated engagement, give it its **own standalone git
  repository** (`git -C engagements/<name> init`), and switch to it. This repo has
  separate history from the harness repo, is gitignored from it (`engagements/*` in the
  root `.gitignore`), and is where all of that engagement's Work Block commits land.
- `/switch <name>` — change the active engagement (primes context from its `INDEX.md`).
- **Context-bleed enforcement is mechanical, not honor-system:** the gate hook derives the owning
  engagement from every gated write path and quarantines (to that engagement's own `.rejected/`) +
  blocks any write that targets a non-active engagement, and the engagement segment is sanitized
  against path traversal (`..`).
- **Every Work Block is committed automatically, into the owning engagement's own repo** — not the
  harness repo, and not by a skill remembering to run `git commit`. See "Logging & Work Blocks"
  below.

All pipeline commands below operate on the active engagement; `<eng>` means
`engagements/$(cat operations/.active_engagement)`.

## How to leverage the platform

**The golden path for a new research run:**

0. **`/bootstrap`, always first in a fresh checkout or after any Claude Code/dependency upgrade.**
   It self-tests the enforcement hook (not just "does the file exist" — it writes a deliberately
   invalid artifact and confirms the gate actually blocks it) before you trust it with real work.
   Then pick the tenant: `/switch <name>` (or `/init-engagement <name>` for a new domain). Never
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
- Trust the gates. If a write gets rejected and quarantined, the output was malformed — re-run the
  phase; never hand-edit an artifact into passing shape (there's a sanctioned override for the rare
  legitimate case — see `operations/guides/01_EDITING.md`).
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
(`TIMESTAMP | PHASE | WB-ID | TARGET | STATUS | COST` where STATUS ∈
SUCCESS/EDIT/GATED/FAIL/GATED-OVERRIDE — EDIT marks a revision of an existing artifact so it
doesn't inflate the SUCCESS count — and COST is a reserved column, `-` until token accounting lands),
written by `.claude/scripts/append_log.sh` — never by hand. The Write-tool hook and `/extract`'s
Bash path both call this same script, which is also where the commit happens: **one skill
invocation = one Work Block = one automatic commit `[PHASE] WB-<id>: <target> (<status>)`, made
inside the owning engagement's own repository.** Regular by construction — no skill needs to
remember a `git commit` step, and none do; see `operations/guides/02_MAINTENANCE.md` if a commit
ever seems to be missing (append_log.sh warns loudly rather than failing silently).

See [SKILL.md](SKILL.md) for the standard any new phase must follow, [guides/00_INDEX.md](guides/00_INDEX.md)
for how to edit, maintain, and get strong outputs from this harness, and the root `CLAUDE.md` for
how this fits the whole repository.
