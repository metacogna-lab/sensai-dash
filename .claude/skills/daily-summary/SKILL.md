---
name: daily-summary
description: Audits today's Work Blocks in the telemetry ledger against <eng>/goals to detect drift — research velocity that isn't converging on economic value. Use for the AUDIT phase, typically once per session or once per day.
---

**Engagement scope:** resolve the active engagement first — `ENG="operations/engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are quarantined (to `operations/.rejected/`) by the gate hook as context bleed.

This is the AUDIT phase (`/daily-summary`). It judges *today's process*; for trends across days use
`/longitudinal`.

1. Filter `<eng>/telemetry/execution.log` to today's date (`grep "$(date +%Y-%m-%d)"`).
2. Read `<eng>/goals/primary_directive.md`, `<eng>/goals/active_milestones.md`, and
   `<eng>/goals/research_questions.md` (if present).
3. Invoke the Agent tool with `subagent_type: "auditor"`, passing today's filtered log lines and the
   goals content.
4. Write the auditor's returned Markdown verbatim to
   `<eng>/goals/audits/summary_<YYYY-MM-DD>.md` using the Write tool. (The gate hook validates the
   frontmatter and appends the `AUDIT` log line automatically.)
5. Update `<eng>/INDEX.md`: latest audit verdict in the status section.
6. Read the last line of `<eng>/telemetry/execution.log` for the `WB-ID`, then commit:
   `git add -A && git commit -m "[AUDIT] WB-<id>: <one-line verdict — on-track or drifting>"`.
7. Surface the audit's 3 hard questions to the operator directly in your response — don't make them
   open the file to see them.
