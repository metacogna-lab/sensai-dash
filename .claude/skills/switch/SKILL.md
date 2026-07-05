---
name: switch
description: Switches the active engagement (tenant workspace) — all pipeline commands operate on exactly one engagement at a time, locked by the operations/.active_engagement pointer. Use when the operator wants to work on a different engagement, or names one that isn't active.
---

Argument: an engagement name (snake_case). Engagements live in `engagements/<name>/`.

1. Sanitize the argument: lowercase letters, digits, underscores only. Reject anything containing
   `/`, `..`, or spaces — engagement isolation depends on this.
2. Verify `engagements/<name>/` exists. If not, tell the operator:
   `[ERROR] Engagement '<name>' not found. Use /init-engagement <name> to create it.` and list the
   engagements that do exist.
3. Write the name to `operations/.active_engagement` (overwrite, no newline issues — the hooks strip
   non `[a-z0-9_]` characters when reading it).
4. Prime context: read the newly active engagement's `INDEX.md` and report its TL;DR, run status,
   and active milestones to the operator: `[SUCCESS] Context switched to <name>.`
5. Update the Engagement Registry section of the global `operations/INDEX.md` (mark which is active).
6. Do not log or commit — switching context is not a pipeline phase.

The gate hook enforces isolation from here on: any pipeline write targeting a different
engagement's directories is deleted and blocked as context bleed.
