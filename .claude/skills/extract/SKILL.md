---
name: extract
description: Converts binary sources (PDFs primarily) staged in research_body/00_inbox into plain-text raw files in research_body/01_raw, ready for /consume. Use for the EXTRACT phase — the very first step when a source arrives as a PDF or other non-text format.
---

**Engagement scope:** resolve the active engagement first — `ENG="operations/engagements/$(cat operations/.active_engagement)"`; every `<eng>/...` path below means `$ENG/...`. If the pointer file is missing, stop and tell the operator to run `/switch <name>` or `/init-engagement <name>`. Cross-engagement writes are deleted by the gate hook as context bleed.

This is the EXTRACT phase. Argument: a filename in `<eng>/research_body/00_inbox/` (or "all" to
process everything in the inbox).

1. Verify the target file exists in `<eng>/research_body/00_inbox/`. If the operator gave a path
   outside the inbox, move it into the inbox first so provenance is preserved.
2. Convert to plain text, trying in order:
   - **PDF:** `pdftotext -layout "<eng>/research_body/00_inbox/<file>" "<eng>/research_body/01_raw/<stem>.txt"`
     (verified installed). If the result is empty or garbled (scanned/image PDF), fall back to
     reading the PDF with the Read tool (paginated, `pages` parameter, ≤20 pages per call) and
     writing the transcribed text yourself.
   - **Other binary formats** (docx, etc.): use the best available converter (`textutil -convert txt`
     on macOS); same fallback principle.
   - **Already plain text:** just `mv` it to `01_raw/` — no conversion step.
3. **Gate (manual — this phase writes via Bash, which the Write-hook cannot see):** verify the
   output file in `01_raw/` is non-empty and contains real prose (not extraction junk). If it
   failed, delete the output, log `GATED`, and tell the operator the source needs manual handling.
4. **Log (manual, same reason):** this is the one phase where you append the ledger line yourself:
   `"$CLAUDE_PROJECT_DIR"/.claude/scripts/append_log.sh EXTRACT <output-filename> SUCCESS` (or `GATED`).
5. Move the source binary to `<eng>/research_body/03_archive/` so it is never re-extracted.
6. Update the `research_body` section of `<eng>/INDEX.md` (new raw file listed, inbox count).
7. Commit: `git add -A && git commit -m "[EXTRACT] WB-<id>: <source> → <output>.txt"` (WB-id is
   echoed by append_log.sh).
