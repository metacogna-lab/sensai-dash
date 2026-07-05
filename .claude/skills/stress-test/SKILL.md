---
name: stress-test
description: Systemic self-audit — stress-tests one output artifact (theory, economic model, or alignment doc) against the source Nodes, corpus map, and calibrated constraints, producing a PASS / PASS-WITH-NOTES / FAIL verdict in outcomes/03_verification. Use for the VERIFY phase, before an artifact is treated as final or fed to /synthesize or /broadcast.
---

**Engagement scope:** resolve the active engagement first — `ENG="engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are quarantined (to `operations/.rejected/`) by the gate hook as context bleed.

This is the VERIFY phase (Fable Interaction V.C). Argument: an artifact filename from
`<eng>/outcomes/01_theories/`, `<eng>/outcomes/02_economic_models/`, or `<eng>/outcomes/04_alignment/`.

1. Verify the artifact exists. Assemble its evidence base: the nodes named in its `source:`
   frontmatter chain (follow `source:` recursively — econ model → theory → nodes),
   `<eng>/research_body/corpus_map.md` if present, `<eng>/goals/research_questions.md`, and the
   original archived raw source(s) for those nodes from `<eng>/research_body/03_archive/`
   (each node's `source:` frontmatter names the raw filename it was archived under) — the
   verifier needs these to spot-check claims against the pre-extraction text, not just the node.
2. Invoke the Agent tool with `subagent_type: "verifier"`, passing the artifact and the full
   evidence base including the archived originals.
3. Write the verifier's returned Markdown verbatim to
   `<eng>/outcomes/03_verification/verify--<artifact-stem>.md` using the Write tool. (The gate hook
   validates `type: verification` and the `## Verdict` section, and appends the `VERIFY` log line.)
4. If the hook blocks the write, re-invoke the verifier with the reason and rewrite.
5. Act on the verdict:
   - **FAIL** — the artifact under test is now suspect: flag it to the operator and recommend
     re-running its producing phase with the verifier's findings. Do not delete the artifact
     yourself; the operator decides.
   - **PASS / PASS-WITH-NOTES** — record it and move on.
6. Update `<eng>/INDEX.md` (verification listed next to its artifact, with verdict).
7. The gate hook (via `.claude/scripts/append_log.sh`) already committed this Work Block automatically inside the engagement's own repo — do not run `git add`/`git commit` yourself. Read the last line of `<eng>/telemetry/execution.log` for the `WB-ID` if you need it for your report to the operator.
