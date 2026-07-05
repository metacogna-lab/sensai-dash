# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`sensai-finder` is the home of **Sensai Compilar**, an agentic research-and-development pipeline
crossed with an LLM wiki: raw sources (PDFs, papers, transcripts) are driven through gated phases —
question calibration → extraction → node consumption → corpus indexing → theory synthesis →
economic evaluation → verification → macro-synthesis — into verified strategic deliverables. There
is no build/lint/test toolchain; the "code" is Claude Code native configuration plus a strict
directory contract enforced by hooks.

## Map

```
CLAUDE.md                 ← you are here (harness manual)
.claude/                  # SYSTEM LOGIC (global, shared by all engagements)
├── agents/               # 10 pipeline subagents, model-routed via frontmatter
│                         #   strategist(fable) consumer(haiku) indexer(sonnet) analyst(sonnet)
│                         #   evaluator(opus) verifier(opus) synthesist(fable) broadcaster(haiku)
│                         #   historian(sonnet) auditor(sonnet)
├── skills/               # 16 skills = the /commands: bootstrap switch init-engagement question
│                         #   extract consume index analyze evaluate stress-test verify synthesize
│                         #   broadcast longitudinal daily-summary audit
├── scripts/              # hook implementations: post_write_gate.sh gate.sh append_log.sh
│                         #   check_committed.sh
└── settings.json         # wires PostToolUse(Write|Edit) gate + Stop reminder
operations/                  # THE WIKI + engagement-workspace SYSTEM files (start at operations/INDEX.md)
├── INDEX.md              # GLOBAL wiki home: engagement registry, active marker
├── README.md             # architecture + "how to leverage the platform" + I/O contract table
├── SKILL.md              # standard for adding new phases (4 registration points)
├── guides/               # editing/maintenance/output-quality/prompt-tuning guides
├── templates/            # Progressive Disclosure schemas (global system logic)
└── .active_engagement    # pointer: which tenant the pipeline operates on
engagements/              # ISOLATED tenant state — root-level sibling of .claude/ and
│                         #   operations/, NOT nested in either; gitignored from THIS repo
├── README.md             # (the one tracked file here — explains why the rest is invisible)
└── compilar/             # (default engagement; more via /init-engagement) — its OWN git repo
    ├── .git/             # standalone repository — separate history from the harness repo
    ├── .gitignore        # ignores .rejected/ (quarantine scratch, not a Work Block product)
    ├── INDEX.md          # engagement wiki home: run status, artifact index
    ├── goals/            # primary_directive, active_milestones, research_questions, audits/
    ├── research_body/    # 00_inbox → 01_raw → 02_nodes → 03_archive; 04_quarantine (HITL
    │                     #   conflict queue); corpus_map.md
    ├── outcomes/         # 01_theories/ 02_economic_models/ 03_verification/ 04_alignment/
    │                     #   05_broadcast/ (numbered = pipeline order) + longitudinal/ (unprefixed,
    │                     #   cross-cutting — reads the others rather than sitting in their chain)
    └── telemetry/        # execution.log — flat append-only Work Block ledger (per tenant)
agents/                   # (repo root) ACTIVE design inputs: PRD, Hooks spec, task ledger
└── archive/              # consumed/processed design drafts (historical record)
```

**Two git repos, two trust boundaries.** This repo (the harness — `.claude/`, `operations/`
system files, `agents/`, `tests/`) requires operator consent to commit, same as any dev repo. Each
engagement under `engagements/<name>/` (repo root — a sibling of `.claude/` and `operations/`, not
nested in either) is a **separate, standalone repository** that the harness commits to
automatically, once per Work Block — that automation is infrastructure the operator explicitly
asked for, distinct from a session committing the operator's own working repo without asking.
Never confuse the two: don't `cd` into an engagement expecting harness-repo state, and don't
expect the harness repo's `git log` to show engagement activity — it's gitignored by design
(`engagements/*` in the root `.gitignore`).

## Operating protocol

- **Multi-tenancy (PRD v1.00):** every pipeline command operates on exactly one engagement — the
  one named in `operations/.active_engagement`. `/switch <name>` changes it; `/init-engagement <name>`
  scaffolds a new one. The gate hook mechanically quarantines + blocks any gated write whose path
  targets a different engagement (context bleed) or has a malformed engagement segment (path
  traversal). Skills resolve `<eng> = engagements/$(cat operations/.active_engagement)` first.
- **Work Blocks:** one skill invocation = one logged ledger line (in the active engagement's
  `telemetry/execution.log`) = one commit `[PHASE] WB-<id>: <target> (<status>)`, made
  automatically by `append_log.sh` inside that engagement's own repo — regular by construction,
  not by a skill remembering to run `git commit`. Valid phases: INIT, QUESTION, EXTRACT, CONSUME,
  INDEX, ANALYZE, QUARANTINE, EVALUATE, VERIFY, SYNTHESIZE, BROADCAST, LONGITUDINAL, AUDIT. A hook
  block is the `[FAIL]` signal from the PRD's stdout protocol: do NOT commit, read the reason,
  self-correct, retry (capped at two attempts — see `operations/SKILL.md`).
- **Gating is enforced by hooks, not memory.** The `PostToolUse` hook validates every Write/Edit
  landing in a gated directory against its template (frontmatter `type:`/`status:`, required
  sections like `## Monetization Vector`, `## Verdict`, `## Baseline (As-Is)`, `## Execution
  Detail`), deletes and blocks on failure, and appends the ledger line on success — never re-append
  a line the hook already wrote. Sole exception: Bash-created files (the `/extract` path) are
  invisible to the hook; that skill gates and logs explicitly via `append_log.sh`.
- **Wiki discipline:** navigate index-first from `operations/INDEX.md`; artifacts use deterministic
  slug filenames (`node--<slug>.md`) with timestamps in frontmatter, and cross-reference via
  `[[wikilinks]]`. Every skill updates `INDEX.md` inside its Work Block.
- **Human-in-the-loop points:** `research_body/04_quarantine/` (contradictions the analyst refuses
  to resolve) and FAIL verdicts from `/stress-test`. The pipeline stops and waits there by design.
- **Harness commits require operator consent** (global git-workflow rules) — this repo, not an
  engagement's. **Engagement commits are automatic** by design (see above); the Stop hook still
  only *reminds*, never blocks, for both — dirty engagement state after a Work Block usually means
  an un-logged hand-edit, not a policy question.
- New phases follow `operations/SKILL.md`: agent + skill + gate arm/template + README/INDEX rows.

## The `agents/` folder (repo root)

Active design inputs (`#Sensai PRD v1.00.md`, `#Sensai Hooks.md`), consumed drafts in `agents/archive/`
(`Fable Interaction...md` and the older `#Sensai *.md` iterations), and the active task ledger
(`#Sensai Pipeline Tasks v2.10.md`, which maps the Fable Interaction methodology to the
implementation). Drafts are iterative and contradictory — later supersedes earlier. Final
decisions live in `.claude/` + `operations/`; notable supersessions: bespoke `cli_wrapper.sh` command
router → native skills; `router.sh`/`api_wrapper.py` + `ANTHROPIC_API_KEY` → native subagents with
`model:` frontmatter; per-task files under `agents/tasks/` → flat per-engagement `telemetry/execution.log`;
`session.md` → `INDEX.md` wiki homes; the Hooks spec's `/init` → `/init-engagement` (built-in
collision); lowercase `claude.md` → `CLAUDE.md`.
