---
name: question
description: Deconstructs a stated strategic outcome into measurable, falsifiable research questions before any research corpus is processed. Use at the start of a new pipeline run, or when the operator gives a new strategic goal for an existing corpus.
---

**Engagement scope:** resolve the active engagement first — `ENG="operations/engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are quarantined (to `operations/.rejected/`) by the gate hook as context bleed.

This is the QUESTION phase. It must run before `/analyze` — the analyst refuses to synthesize a
theory without `<eng>/goals/research_questions.md` present.

1. Get the stated strategic outcome from the operator's message (ask if it wasn't given).
2. List the staged corpus: `<eng>/research_body/00_inbox/` and `<eng>/research_body/01_raw/` —
   the strategist needs the titles, not necessarily the full text.
3. Invoke the Agent tool with `subagent_type: "strategist"`. Give it the stated outcome and the list
   of staged titles as the prompt.
4. Write the strategist's returned Markdown verbatim to `<eng>/goals/research_questions.md` using
   the Write tool. (The PostToolUse gate hook checks the frontmatter automatically and appends the
   `QUESTION` line to `<eng>/telemetry/execution.log` — do not append it yourself.)
5. If the hook blocks the write (gate failure), read the reason, re-invoke the strategist with that
   feedback, and rewrite.
6. Update `<eng>/INDEX.md`: the run's TL;DR and the list of active questions.
7. Read the last line of `<eng>/telemetry/execution.log` for the assigned `WB-ID`, then commit:
   `git add -A && git commit -m "[QUESTION] WB-<id>: <one-line summary of the calibrated outcome>"`.
