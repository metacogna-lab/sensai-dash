---
name: evaluate
description: Forces one Theory through an economic lens to produce a monetization vector in outcomes/economic_models. Use for the EVALUATE phase once a Theory exists.
---

**Engagement scope:** resolve the active engagement first — `ENG="operations/engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are deleted by the gate hook as context bleed.

This is the EVALUATE phase. Argument: a theory filename in `<eng>/outcomes/theories/`.

1. Verify the target theory file exists. If not, stop and tell the operator.
2. Read the theory's full content.
3. Invoke the Agent tool with `subagent_type: "evaluator"`, passing the theory content.
4. Write the evaluator's returned Markdown verbatim to
   `<eng>/outcomes/economic_models/econ--<slug>.md` using the Write tool (`<slug>` = kebab-cased
   model title). (The gate hook validates frontmatter, requires a non-empty `## Monetization Vector`
   section, and appends the `EVALUATE` log line automatically.)
5. If the hook blocks the write, read the reason, re-invoke the evaluator with that feedback
   (explicitly ask it to name a concrete mechanism), and rewrite.
6. Update `<eng>/INDEX.md`: the economic model with its monetization vector one-liner.
7. Read the last line of `<eng>/telemetry/execution.log` for the `WB-ID`, then commit:
   `git add -A && git commit -m "[EVALUATE] WB-<id>: <one-line summary of the monetization vector>"`.

Recommend `/stress-test` on the new model before it feeds `/synthesize` or `/broadcast`.
