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
├── skills/               # 14 skills = the /commands: bootstrap switch init-engagement question
│                         #   extract consume index analyze evaluate stress-test synthesize
│                         #   broadcast longitudinal daily-summary
├── scripts/              # hook implementations: post_write_gate.sh gate.sh append_log.sh
│                         #   check_committed.sh
└── settings.json         # wires PostToolUse(Write|Edit) gate + Stop reminder
operations/                  # THE WIKI + engagement-workspace pipeline state (start at operations/INDEX.md)
├── INDEX.md              # GLOBAL wiki home: engagement registry, active marker
├── README.md             # architecture + "how to leverage the platform" + I/O contract table
├── SKILL.md              # standard for adding new phases (4 registration points)
├── templates/            # Progressive Disclosure schemas (global system logic)
├── .active_engagement    # pointer: which tenant the pipeline operates on
└── engagements/          # ISOLATED tenant state — one folder per engagement
    └── compilar/         # (default engagement; more via /init-engagement)
        ├── INDEX.md      # engagement wiki home: run status, artifact index
        ├── goals/        # primary_directive, active_milestones, research_questions, audits/
        ├── research_body/# 00_inbox → 01_raw → 02_nodes → 03_archive; 04_quarantine (HITL
        │                 #   conflict queue); corpus_map.md
        ├── outcomes/     # theories/ economic_models/ verification/ alignment/ broadcast/
        │                 #   longitudinal/
        └── telemetry/    # execution.log — flat append-only Work Block ledger (per tenant)
agents/                   # (repo root) ACTIVE design inputs: PRD, Hooks spec, task ledger
└── archive/              # consumed/processed design drafts (historical record)
```

## Operating protocol

- **Multi-tenancy (PRD v1.00):** every pipeline command operates on exactly one engagement — the
  one named in `operations/.active_engagement`. `/switch <name>` changes it; `/init-engagement <name>`
  scaffolds a new one. The gate hook mechanically deletes + blocks any gated write whose path
  targets a different engagement (context bleed) or has a malformed engagement segment (path
  traversal). Skills resolve `<eng> = operations/engagements/$(cat operations/.active_engagement)` first.
- **Work Blocks:** one skill invocation = one logged ledger line (in the active engagement's
  `telemetry/execution.log`) = one commit `[PHASE] WB-<id>: <summary>`. Valid phases: INIT,
  QUESTION, EXTRACT, CONSUME, INDEX, ANALYZE, QUARANTINE, EVALUATE, VERIFY, SYNTHESIZE, BROADCAST,
  LONGITUDINAL, AUDIT. A hook block is the `[FAIL]` signal from the PRD's stdout protocol: do NOT
  commit, read the reason, self-correct, retry.
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
- **Commits require operator consent** (global git-workflow rules). The Stop hook *reminds* about
  uncommitted Work Blocks; it must never be made blocking, or it deadlocks against the
  consent rule.
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
