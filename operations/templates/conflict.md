<!--
Progressive Disclosure schema for Quarantine Protocol entries (research_body/04_quarantine/).
Frontmatter fields are load-bearing: the gate hook parses `type` and `status` literally.
These are HUMAN-IN-THE-LOOP review items: the pipeline files them and carries them as open risks,
but never resolves them autonomously. To resolve, run `/resolve-conflict <file>`: it records the
operator's decision (edits `resolution:`, sets `status: resolved`, appends a `## Resolution` section)
and archives the file to research_body/03_archive/. `status: deferred` parks one pending outside
evidence without archiving it.
-->
---
type: conflict
status: review-required
source: <theory filename that surfaced it>
created: <ISO 8601 timestamp>
resolution: none
---

# Conflict: <short name>

> **TL;DR:** <the contradiction in one sentence>

## Claim A
> <verbatim claim> — [[node--<source>]]

## Claim B
> <verbatim claim> — [[node--<source>]]

## Why the pipeline cannot resolve this
<what evidence or human judgment is missing>

## Impact if unresolved
<which research questions / theories / economic models this blocks or weakens>
