---
name: index
description: Builds or regenerates the corpus-level semantic map and as-is baseline (research_body/corpus_map.md) from all current Nodes. Use for the INDEX phase — after a batch of /consume work and before /analyze, or whenever the node set has changed materially.
---

**Engagement scope:** resolve the active engagement first — `ENG="engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are quarantined (to `operations/.rejected/`) by the gate hook as context bleed.

This is the INDEX phase (Fable Interaction I.B Semantic Indexing + I.C Baseline Establishment).
No argument — it always operates on the full node set.

1. List `<eng>/research_body/02_nodes/*.md`. If empty, stop: there is nothing to index yet.
2. Read all nodes (or, for a large corpus, their frontmatter + TL;DR + Entities sections).
3. Invoke the Agent tool with `subagent_type: "indexer"`, passing the node contents and filenames.
4. Write the indexer's returned Markdown verbatim to `<eng>/research_body/corpus_map.md` using
   the Write tool — this **overwrites** the previous map by design; git history preserves prior
   snapshots for `/longitudinal`. (The PostToolUse gate hook validates `type: corpus_map` and the
   `## Baseline (As-Is)` section, and appends the `INDEX` log line automatically.)
5. If the hook blocks the write, read the reason, re-invoke the indexer with that feedback, rewrite.
6. Update `<eng>/INDEX.md`: corpus map timestamp and the baseline TL;DR.
7. The gate hook (via `.claude/scripts/append_log.sh`) already committed this Work Block automatically inside the engagement's own repo — do not run `git add`/`git commit` yourself. Read the last line of `<eng>/telemetry/execution.log` for the `WB-ID` if you need it for your report to the operator.
