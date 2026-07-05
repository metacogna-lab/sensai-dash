---
name: synthesize
description: Macro-synthesis — compiles the run's theories, economic models, and verification verdicts into the unified strategic alignment document (the run's primary deliverable) in outcomes/04_alignment. Use for the SYNTHESIZE phase, once at least one verified theory/economic model exists.
---

**Engagement scope:** resolve the active engagement first — `ENG="operations/engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are deleted by the gate hook as context bleed.

This is the SYNTHESIZE phase (Fable Interaction V.A + V.B). No argument needed — it operates on the
run's verified output set; optionally the operator names which theories/models to include.

1. **Gate:** verify `<eng>/goals/research_questions.md` exists and at least one theory or economic
   model has a verification report. If nothing has been through `/stress-test`, stop and say so —
   the alignment document is built from verified material only.
2. Gather inputs: research questions, all theories, all economic models, all verification reports
   (noting verdicts), `<eng>/research_body/corpus_map.md`, and any files in
   `<eng>/research_body/04_quarantine/` (unresolved conflicts ride along as open risks).
3. Invoke the Agent tool with `subagent_type: "synthesist"`, passing all of it.
4. Write the synthesist's returned Markdown verbatim to
   `<eng>/outcomes/04_alignment/alignment--<outcome-slug>--<YYYY-MM-DD>.md` using the Write tool.
   (The gate hook validates `type: alignment` and the `## Execution Detail` section, and appends
   the `SYNTHESIZE` log line.)
5. If the hook blocks the write, re-invoke the synthesist with the reason and rewrite.
6. Recommend (don't auto-run) `/stress-test` on the new alignment document — the deliverable itself
   gets the self-audit before it ships via `/broadcast`.
7. Update `<eng>/INDEX.md` (alignment doc is the run's headline artifact — link it at the top).
8. Read the last line of `<eng>/telemetry/execution.log` for the `WB-ID`, then commit:
   `git add -A && git commit -m "[SYNTHESIZE] WB-<id>: alignment doc for <outcome-slug>"`.
