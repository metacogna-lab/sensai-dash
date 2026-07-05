---
name: consume
description: Ingests one raw text file from research_body/01_raw into a structured Node in research_body/02_nodes. Use for the CONSUME phase — the first step for any new raw text (PDFs go through /extract first).
---

**Engagement scope:** resolve the active engagement first — `ENG="operations/engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are quarantined (to `operations/.rejected/`) by the gate hook as context bleed.

This is the CONSUME phase. Argument: a filename in `<eng>/research_body/01_raw/`, or `all` to
consume every file currently staged there.

**`all` mode:** list `<eng>/research_body/01_raw/*`. If empty, say so and stop. Otherwise run
steps 1-8 below **once per file, sequentially** — one Work Block (one gate write, one ledger
line, one commit) per file, not a single batch commit. Sequential, not parallel: two concurrent
consumes racing the ledger's WB-ID counter is a known sharp edge (`operations/guides/02_MAINTENANCE.md`);
running them one at a time in this same skill invocation avoids it. After the last file, report a
one-line summary (N consumed) and recommend `/index`.

1. Verify the target file exists in `<eng>/research_body/01_raw/`. If the operator pointed at a
   PDF or the inbox, route them to `/extract` first.
2. Read the raw file's full content.
3. Invoke the Agent tool with `subagent_type: "consumer"`, passing the raw content and the source
   filename. Do not pre-summarize the content yourself — hand it over in full so the consumer does
   the extraction.
4. Write the consumer's returned Markdown verbatim to
   `<eng>/research_body/02_nodes/node--<source-slug>.md` using the Write tool, where
   `<source-slug>` is the kebab-cased source filename stem (wiki-readable; the `created:` timestamp
   lives in frontmatter). Re-consuming the same source overwrites its node — that is the idempotency
   contract. (The gate hook validates the frontmatter and appends the `CONSUME` log line
   automatically.)
5. If the hook blocks the write, read the reason, re-invoke the consumer with that feedback, and
   rewrite — do not just delete the raw file and give up.
6. Once the write succeeds, move the raw file to `<eng>/research_body/03_archive/` so it is never
   reprocessed.
7. Update `<eng>/INDEX.md`: add the node under the corpus section with its TL;DR.
8. Read the last line of `<eng>/telemetry/execution.log` for the `WB-ID`, then commit:
   `git add -A && git commit -m "[CONSUME] WB-<id>: <one-line summary of what was extracted>"`.

After a batch of consumes, recommend `/index` to the operator so the corpus map catches up.
