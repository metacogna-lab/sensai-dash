---
name: longitudinal
description: Longitudinal analysis of the pipeline over a time window — question coverage trajectory, conflict burn-down, conversion funnel, drift trends — from execution.log and dated artifacts. Use for the LONGITUDINAL phase, typically weekly or after a milestone.
---

**Engagement scope:** resolve the active engagement first — `ENG="operations/engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are deleted by the gate hook as context bleed.

This is the LONGITUDINAL phase. Argument: a time window ("7d", "since WB-020", "all"); default "7d".

1. Slice `<eng>/telemetry/execution.log` to the window. If the window holds fewer than ~2 days or
   ~5 Work Blocks of history, tell the operator there isn't enough signal yet and stop — don't
   manufacture a trend from one data point.
2. Gather the window's dated artifacts: nodes, theories, economic models, verifications,
   quarantine files (inflow and resolved/archived), audits, and — for baseline evolution —
   `git log --follow -p <eng>/research_body/corpus_map.md` snapshots if the map changed in-window.
3. Invoke the Agent tool with `subagent_type: "historian"`, passing the window, the log slice, and
   the artifact set.
4. Write the historian's returned Markdown verbatim to
   `<eng>/outcomes/longitudinal/long--<window-label>--<YYYY-MM-DD>.md` using the Write tool. (The
   gate hook validates `type: longitudinal` and appends the `LONGITUDINAL` log line.)
5. If the hook blocks the write, re-invoke the historian with the reason and rewrite.
6. Update `<eng>/INDEX.md` (latest longitudinal report + its headline finding).
7. Read the last line of `<eng>/telemetry/execution.log` for the `WB-ID`, then commit:
   `git add -A && git commit -m "[LONGITUDINAL] WB-<id>: <headline trend finding>"`.
8. Surface the funnel numbers and the single most actionable trend to the operator directly in your
   response.
