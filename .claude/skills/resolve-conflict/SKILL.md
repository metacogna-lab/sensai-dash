---
name: resolve-conflict
description: Services the human-in-the-loop quarantine queue — records an operator's resolution for one contradiction in research_body/04_quarantine, marks it resolved, and archives it. Use for the QUARANTINE phase when the operator wants to clear a conflict the analyst refused to resolve autonomously.
---

**Engagement scope:** resolve the active engagement first — `ENG="engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are quarantined (to `operations/.rejected/`) by the gate hook as context bleed.

This is the QUARANTINE (resolution) phase — the operator half of the loop `/analyze` opens when it
files a contradiction it cannot settle on evidence alone. The pipeline never resolves these itself;
this skill only records the human judgement the operator supplies.

Argument: one conflict filename in `<eng>/research_body/04_quarantine/`. With no argument (or `all`),
list the open queue and stop for the operator to choose.

1. **List / select.** If no filename was given, list `<eng>/research_body/04_quarantine/*.md`, showing
   each file's `## Conflict` title and `## Impact if unresolved` line so the operator can pick. If the
   queue is empty, say so and stop. Never pick a conflict to resolve on the operator's behalf.
2. **Read the conflict** file in full (both `## Claim A` / `## Claim B`, the `## Why the pipeline
   cannot resolve this`, and the `## Impact` section) so the resolution is grounded in what was
   actually contradictory.
3. **Get the resolution from the operator.** The resolution is a human decision — which claim holds
   (or a synthesis of both, or "still unresolvable, needs external evidence X"). If the operator has
   not stated it, ask; do not invent one. A conflict the operator cannot yet settle stays in the queue.
4. **Record it in place (Edit tool).** Edit the quarantine file so it stays schema-valid (`type: conflict`)
   and:
   - set frontmatter `status: resolved` (or `status: deferred` if the operator is explicitly parking it
     pending outside evidence — that keeps it out of the "actionable" count without pretending it's done);
   - replace `resolution: none` with a one-line summary of the decision;
   - append a `## Resolution` section: the decision, its rationale, and which research questions /
     theories / economic models it unblocks, cross-referenced with `[[wikilinks]]`.
   This Edit lands in the gated `04_quarantine/` directory, so the hook validates it and logs the Work
   Block automatically as `QUARANTINE` with status `EDIT` — do **not** call `append_log.sh` yourself and
   do **not** `git commit`. If the hook blocks the Edit, read the reason and fix the frontmatter/sections.
5. **Archive (Bash).** Move the resolved file out of the review queue into the archive:
   `mv "<eng>/research_body/04_quarantine/<file>" "<eng>/research_body/03_archive/"`. This relocation is
   bookkeeping, not a new artifact — the resolution Edit in step 4 is the logged Work Block, so the move
   needs no separate ledger line. (Leave a `deferred` conflict in `04_quarantine/`; only `resolved` ones
   are archived.)
6. **Update `<eng>/INDEX.md`:** remove the conflict from the open review-queue section and note the
   resolution (and anything it unblocks) so downstream `/analyze` / `/evaluate` runs see it is cleared.
7. Report to the operator: which conflict was resolved, the decision recorded, what it unblocks, and how
   many conflicts remain in the queue. Read the last `QUARANTINE` line of `<eng>/telemetry/execution.log`
   for the `WB-ID` if you need it for the report.
