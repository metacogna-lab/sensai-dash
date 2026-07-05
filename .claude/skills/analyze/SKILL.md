---
name: analyze
description: Synthesizes one or more Nodes into a cross-referenced Theory in outcomes/theories, scored against the active research questions, and files unresolved contradictions into the quarantine queue for human review. Use for the ANALYZE phase once at least one Node exists.
---

**Engagement scope:** resolve the active engagement first — `ENG="operations/engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are deleted by the gate hook as context bleed.

This is the ANALYZE phase. Argument: one or more node filenames in `<eng>/research_body/02_nodes/`
(if none given, propose a set based on topical overlap and confirm with the operator).

1. **Gate:** verify `<eng>/goals/research_questions.md` exists. If it doesn't, stop and tell the
   operator to run `/question` first — do not synthesize a theory against an uncalibrated goal.
2. Read the research questions, the target node file(s), and — if it exists —
   `<eng>/research_body/corpus_map.md` (gives the analyst the cross-document entity map and the
   as-is baseline for its gap analysis).
3. Invoke the Agent tool with `subagent_type: "analyst"`, passing all of it.
4. Write the analyst's returned Markdown verbatim to
   `<eng>/outcomes/theories/theory--<slug>.md` using the Write tool (`<slug>` = kebab-cased theory
   title). (The gate hook validates the frontmatter and appends the `ANALYZE` log line automatically.)
5. If the hook blocks the write, read the reason, re-invoke the analyst with that feedback, rewrite.
6. **Quarantine Protocol (Fable Interaction III.C):** if the theory's `## Open Conflicts` section is
   non-empty, write each conflict to `<eng>/research_body/04_quarantine/conflict--<slug>.md`
   following `operations/templates/conflict.md` (`type: conflict`, `status: review-required`). These are
   human-in-the-loop review items — the pipeline never resolves them autonomously. (Each write is
   gated and logged as `QUARANTINE` automatically.)
7. Update `<eng>/INDEX.md`: the theory with its TL;DR and per-question coverage, plus any new
   quarantine entries in the review queue section.
8. Read the last line of `<eng>/telemetry/execution.log` for the `WB-ID`, then commit:
   `git add -A && git commit -m "[ANALYZE] WB-<id>: <one-line summary of the synthesized theory>"`.
