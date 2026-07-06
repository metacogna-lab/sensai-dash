# Sensai Mission Control — AGENTS.md

This is a **Claude Code-native pipeline harness**, not a conventional codebase. No build, lint, typecheck, or codegen scripts exist. The "code" is agent/skill markdown + bash hook scripts. See `CLAUDE.md` for the full architectural map.

## Commands (skills)

All commands are `/` skills. The operator runs these in Claude Code at the repo root.

| Command | Phase | Model | Writes to |
|---|---|---|---|
| `/bootstrap` | — | — | self-test harness |
| `/init-engagement <name>` | — | — | new engagement workspace |
| `/switch <name>` | — | — | changes active pointer |
| `/question "<outcome>"` | QUESTION | strategist (fable) | `<eng>/goals/research_questions.md` |
| `/extract <file\|all>` | EXTRACT | — (pdftotext) | `<eng>/research_body/01_raw/` |
| `/consume <file>` | CONSUME | consumer (haiku) | `<eng>/research_body/02_nodes/` |
| `/index` | INDEX | indexer (sonnet) | `<eng>/research_body/corpus_map.md` |
| `/analyze <nodes...>` | ANALYZE | analyst (sonnet) | `<eng>/outcomes/01_theories/` |
| `/resolve-conflict <file>` | QUARANTINE | — (operator HITL) | `<eng>/research_body/04_quarantine/` → `03_archive/` |
| `/evaluate <theory>` | EVALUATE | evaluator (opus) | `<eng>/outcomes/02_economic_models/` |
| `/stress-test <artifact>` | VERIFY | verifier (opus) | `<eng>/outcomes/03_verification/` |
| `/synthesize` | SYNTHESIZE | synthesist (fable) | `<eng>/outcomes/04_alignment/` |
| `/broadcast <artifact>` | BROADCAST | broadcaster (haiku) | `<eng>/outcomes/05_broadcast/` |
| `/daily-summary` | AUDIT | auditor (sonnet) | `<eng>/goals/audits/` |
| `/longitudinal` | LONGITUDINAL | historian (sonnet) | `<eng>/outcomes/longitudinal/` |

`<eng>` resolves to `engagements/$(cat operations/.active_engagement)`.

## Two git repos, two commit disciplines

- **This repo** (harness — `.claude/`, `operations/` system files): explicit operator consent required for commits.
- **Each engagement** (`engagements/<name>/`): auto-commits every Work Block via `append_log.sh`. Separate `.git`, separate history, gitignored from harness repo. Do NOT confuse the two.

## Gating (hooks)

Every Write/Edit targeting an engagement dir is validated by `post_write_gate.sh` → `gate.sh`:
- Checks frontmatter (`type:`, `status:`) and non-empty body
- Checks type-specific required sections: `## Monetization Vector` (econ model), `## Baseline (As-Is)` (corpus map), `## Verdict` (verification), `## Execution Detail` (alignment)
- Rejects (quarantines to `.rejected/` in target engagement) on failure — never deletes
- On pass: appends ledger line + auto-commits to engagement's own repo
- **Retry cap:** 2 rewrite attempts per gate failure, then stop and inspect template/agent mismatch

## Testing

Hook-layer regression suite in `tests/` (31 bats cases):
```
brew install bats-core   # once
bats tests/
```

Tests `gate.sh`, `append_log.sh`, and `post_write_gate.sh` — the enforcement layer. No other test suites exist.

## Critical gotchas

- **Bash-created files** (e.g. `/extract` via pdftotext) are invisible to the Write hook. These paths must gate+log themselves via `append_log.sh` explicitly, called LAST after all file changes.
- **`/question` must run before `/analyze`** — the analyst refuses without `research_questions.md`.
- **Quarantine queue** (`research_body/04_quarantine/`) and **FAIL verdicts** from `/stress-test` are the only pipeline stops. Service them before continuing.
- **No-op index reminder:** a gated write that succeeds but leaves INDEX.md stale (≥5 min) gets a non-blocking reminder — update INDEX.md as part of every Work Block.
- **Engagement isolation is mechanical:** the hook checks path prefix against active engagement and quarantines context bleed writes.
