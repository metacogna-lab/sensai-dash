# HOW TO: Running the Sensai Compilar Pipeline

A practical operator guide. Architecture lives in [operations/README.md](operations/README.md); this
is the "what do I type, what happens, what do I do when it stops" manual. Everything here runs
inside Claude Code opened at this repo's root.

## The idea in one paragraph

You drop raw research (PDFs, notes, transcripts) into an **engagement** (an isolated workspace),
state the outcome you want, and drive the material through gated phases: calibrate questions →
extract → consume into nodes → map the corpus → synthesize theories → force economic evaluation →
stress-test → compile the strategic alignment document. Hooks validate every artifact's schema
mechanically and keep a per-engagement Work Block ledger. The pipeline stops and waits for *you*
at exactly the points that need human judgment.

## Command quick reference

| Command | What it does | Needs |
|---|---|---|
| `/bootstrap` | Verify the whole harness (run first in any fresh checkout) | — |
| `/init-engagement <name>` | Scaffold a new isolated workspace and switch to it | snake_case name |
| `/switch <name>` | Change which engagement all commands operate on | existing engagement |
| `/question "<outcome>"` | Turn your goal into falsifiable research questions | staged corpus titles |
| `/extract <file\|all>` | PDF/binary in `00_inbox/` → plain text in `01_raw/` | inbox file |
| `/consume <file>` | One raw text file → a structured Node | raw file |
| `/index` | Rebuild the corpus map + as-is baseline from all nodes | ≥1 node |
| `/analyze <nodes...>` | Nodes → a Theory, scored against your questions | questions + nodes |
| `/evaluate <theory>` | Theory → concrete economic model / monetization vector | a theory |
| `/stress-test <artifact>` | Adversarial verdict: PASS / PASS-WITH-NOTES / FAIL | any outcome artifact |
| `/synthesize` | Verified material → the strategic alignment document | ≥1 verified artifact |
| `/broadcast <artifact>` | Verified model/alignment → external-facing copy | verified input |
| `/daily-summary` | Audit today's Work Blocks against goals (3 hard questions) | — |
| `/longitudinal [window]` | Trends: conversion funnel, conflict burn-down, drift | ≥2 days of history |

## First-time setup

1. Open Claude Code at the repo root and run **`/bootstrap`**. It verifies directories, the
   hook scripts, templates, the engagement layout, and `pdftotext` (install via
   `brew install poppler` if missing — without it `/extract` falls back to slower Read-tool
   transcription).
2. Make sure git has at least one commit. The ledger, corpus-map history, and every recovery
   path in this system assume commits exist. (Also check `.gitignore`: if `telemetry/` is
   ignored, your Work Block ledger will never be committed — decide deliberately.)
3. Check the wiki home: [operations/INDEX.md](operations/INDEX.md) shows the engagement registry and
   which one is active. Each engagement's own `INDEX.md` is its live dashboard — the Run Status
   table's **Blockers column literally tells you what to do next**.

## A full run, step by step

Using the default `compilar` engagement (or `/init-engagement my_domain` for a fresh one):

1. **Stage sources.** PDFs → `operations/engagements/compilar/research_body/00_inbox/`; plain text
   → `.../01_raw/`.
2. **`/question "Decide whether X is viable as a product by Q4"`** — the highest-leverage step.
   A fable-tier strategist turns this into 3-7 falsifiable questions plus hard constraints. Be
   concrete about what "done" means; vague outcomes produce vague runs. Everything downstream is
   filtered through this file (`<eng>/goals/research_questions.md`).
3. **`/extract all`**, then **`/consume <file>`** per raw file. Each consume produces one Node
   (`node--<slug>.md`), archives the raw file, logs a Work Block, and updates the INDEX.
   Re-consuming the same source overwrites its node — safe to re-run.
4. **`/index`** after each meaningful batch of consumes. This builds `corpus_map.md`: the
   cross-document entity map and the **as-is baseline** the analyst diffs against. Skipping it
   starves the gap analysis.
5. **`/analyze node--a node--b ...`** — produces a Theory answering each research question as
   supported / contradicted / insufficient-evidence. Contradictions it cannot resolve are filed
   to `research_body/04_quarantine/` for **you** (see "When the pipeline stops" below).
6. **`/evaluate theory--<slug>`** — an opus-tier evaluator forces a concrete monetization
   vector, product spec, or IP model. Honest "no viable vector" beats an invented one.
7. **`/stress-test econ--<slug>`** — every load-bearing claim gets classified
   grounded / extrapolated / unsupported, with a hard verdict. **Do this before building on any
   artifact.** FAIL material is inadmissible downstream.
8. **`/synthesize`** — compiles verified theories + models + verdicts into the run's deliverable:
   `outcomes/alignment/alignment--<slug>--<date>.md`, with execution detail cross-referenced to
   sources and unresolved conflicts carried as open risks. Stress-test it too, then
   **`/broadcast`** it — and read broadcast copy yourself before anything leaves the machine.

**Rhythm:** end each session with `/daily-summary` (answers "did today move toward value?");
run `/longitudinal` weekly (answers "is the *system* drifting?" — e.g. lots of consuming, no
evaluating).

## What the gates do (and what a rejection looks like)

Every artifact write is checked by a hook against its schema in `operations/templates/` —
frontmatter (`type:`, `status:`), non-empty body, and required sections (an economic model
without `## Monetization Vector` is rejected; a verification without `## Verdict`, a corpus map
without `## Baseline (As-Is)`, an alignment doc without `## Execution Detail` likewise). On
rejection the file is deleted, the reason is printed, and a `GATED` line is logged — the skill
then re-invokes its agent with the reason and rewrites. You'll see this happen; it's the system
working. Note the gates validate **structure, not truth** — truth-checking is `/stress-test`'s
job, and yours.

The hook also enforces **engagement isolation**: a pipeline write aimed at any engagement other
than the active one is deleted and blocked ("context bleed"). If that surprises you, you probably
forgot to `/switch`.

## When the pipeline stops for you (by design)

| Stop point | Where | What you do |
|---|---|---|
| Quarantined conflict | `research_body/04_quarantine/conflict--*.md` | Read both claims, decide, fill `resolution:`, set `status: resolved`, move to `03_archive/` |
| FAIL verdict | `outcomes/verification/verify--*.md` | Read `## Required Repairs`, re-run the producing phase with that feedback |
| Gate rejection ×2 | chat output | If a rewrite fails twice, stop retrying — check the template vs the agent's output yourself |
| Broadcast sign-off | `outcomes/broadcast/` | Nothing publishes itself; external posting is always your manual act |

A growing quarantine queue is the #1 sign a run needs your input. Service it before consuming
more corpus.

## Multi-engagement work

One engagement per distinct domain/client — never mix. `/switch <name>` changes the active
pointer and primes context from that engagement's INDEX.md; all state (goals, corpus, outcomes,
ledger) is per-engagement. System logic (skills, agents, hooks, templates) is shared. Don't run
two Claude Code sessions against the same checkout with different engagements active — the
pointer is global per checkout.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "No active engagement" | pointer file missing | `/switch <name>` or `/init-engagement <name>` |
| "Context bleed blocked ... File deleted" | write aimed at non-active engagement | `/switch <that-engagement>` and re-run the phase |
| "Gate failed ... file deleted" | artifact missing schema field/section | read the reason; compare `operations/templates/<type>.md`; re-run the phase |
| `/analyze` refuses to run | no `research_questions.md` | run `/question` first — this is deliberate |
| `/extract` produced garbage | scanned/image PDF | the skill falls back to Read-tool transcription; or OCR the PDF externally first |
| Ledger looks wrong/missing | `telemetry/` gitignored, or file hand-edited | ledger is hook-written only; restore from git if committed |

## Sharp edges (know before a long run)

- **Commit discipline is yours.** Work Blocks want one commit each, but commits require your
  consent — decide a standing policy up front or expect prompts. Until the repo has commits,
  a deleted artifact is gone.
- **Hand-editing artifacts** outside Claude Code bypasses the gates *and* the ledger/INDEX
  bookkeeping. If you must (e.g. resolving a quarantine conflict), log it yourself:
  `.claude/scripts/append_log.sh <PHASE> <file> SUCCESS` and update the engagement INDEX.
- **Big corpora:** the corpus map re-reads all nodes each `/index`; beyond ~100 nodes expect
  slow, expensive runs (chunked/vector recall is on the roadmap). Batch-consume, then index once.
- **PASS ≠ true.** A PASS verdict means "consistent with the corpus as extracted." The corpus
  itself is your responsibility.

## Extending the pipeline

New phase = agent + skill + gate arm + template, registered in all four places plus the README
I/O table and INDEX run-status row. The full standard is [operations/SKILL.md](operations/SKILL.md).
