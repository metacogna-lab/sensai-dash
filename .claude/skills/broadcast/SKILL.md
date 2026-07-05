---
name: broadcast
description: Translates one mature Economic Model or Alignment document into external-facing copy in outcomes/05_broadcast. Use for the BROADCAST phase once a verified model or alignment doc exists.
---

**Engagement scope:** resolve the active engagement first — `ENG="operations/engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are deleted by the gate hook as context bleed.

This is the BROADCAST phase. Argument: a filename in `<eng>/outcomes/02_economic_models/` or
`<eng>/outcomes/04_alignment/`.

1. Verify the target file exists. Check `<eng>/outcomes/03_verification/` for its verification
   report: if it has a `FAIL` verdict, stop and tell the operator — failed material doesn't ship.
   If it was never stress-tested, recommend `/stress-test` first but proceed if the operator says so.
2. Read its full content.
3. Invoke the Agent tool with `subagent_type: "broadcaster"`, passing the content.
4. Write the broadcaster's returned Markdown verbatim to
   `<eng>/outcomes/05_broadcast/post--<slug>.md` using the Write tool. (The gate hook validates the
   frontmatter and appends the `BROADCAST` log line automatically.)
5. If the hook blocks the write, read the reason, re-invoke the broadcaster with that feedback, and
   rewrite.
6. Update `<eng>/INDEX.md`: the broadcast piece under outcomes.
7. Read the last line of `<eng>/telemetry/execution.log` for the `WB-ID`, then commit:
   `git add -A && git commit -m "[BROADCAST] WB-<id>: <one-line summary of what was published>"`.

Broadcast copy is written to disk only — actually publishing anywhere external is always a separate,
operator-approved action.
