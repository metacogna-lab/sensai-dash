# Guides Index

Four guides, read in this order the first time; after that, jump to whichever axis you need.
These are system-layer documentation — they describe how to work *on* the harness, not how to
run a pipeline (that's [HOW_TO.md](../../HOW_TO.md), the operator manual).

| # | Guide | Answers |
|---|---|---|
| 01 | [EDITING.md](01_EDITING.md) | "I want to change a skill/agent/template/hook — how do I do it safely?" |
| 02 | [MAINTENANCE.md](02_MAINTENANCE.md) | "How do I know the harness is still healthy? What breaks quietly?" |
| 03 | [OUTPUT_QUALITY.md](03_OUTPUT_QUALITY.md) | "My artifacts pass the gates but are they actually good?" |
| 04 | [PROMPT_TUNING.md](04_PROMPT_TUNING.md) | "How do I improve an agent's prompt without breaking its contract?" |

## Why these four, and not more

Editability, maintenance, and output strength are the three axes the `/autoplan` review (see
[the task ledger's review report](../../agents/%23Sensai%20Pipeline%20Tasks%20v2.10.md)) judged
the harness on. Prompt tuning is split out from editing because it's the one edit category with
its own failure mode (a prompt that "reads fine" but silently changes agent behavior) and its own
verification method (before/after artifact diffs, not gate passes).

## Relationship to other docs

- [CLAUDE.md](../../CLAUDE.md) — repo map, supersession history. Read once, rarely again.
- [HOW_TO.md](../../HOW_TO.md) — operator manual: what to type, what to do when it stops.
- [operations/README.md](../README.md) — architecture + I/O contract table (the reference, not a
  walkthrough).
- [operations/SKILL.md](../SKILL.md) — the 4-point registration contract for new phases; `01_EDITING.md`
  assumes you've read it and adds the *safety* rules around using it.

If you're editing something and can't find the rule that applies, that's a gap in these guides —
add it rather than working around it.
