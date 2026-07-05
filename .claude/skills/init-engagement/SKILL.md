---
name: init-engagement
description: Scaffolds a new isolated engagement (tenant workspace) under operations/engagements/ and switches to it. Use when starting research for a new, distinct domain/client/project that must not share context with existing engagements.
---

Argument: an engagement name (snake_case). (This is the PRD's `/init` command, renamed to avoid
colliding with Claude Code's built-in `/init`.)

1. Sanitize the argument: lowercase letters, digits, underscores only. Reject anything containing
   `/`, `..`, or spaces.
2. If `operations/engagements/<name>/` already exists, stop and offer `/switch <name>` instead.
3. Scaffold the isolated tree:
   ```bash
   ENG="operations/engagements/<name>"
   mkdir -p "$ENG"/{goals/audits,research_body/{00_inbox,01_raw,02_nodes,03_archive,04_quarantine},outcomes/{theories,economic_models,verification,longitudinal,alignment,broadcast},telemetry}
   echo "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS" > "$ENG/telemetry/execution.log"
   ```
4. **Switch FIRST**: write `<name>` to `operations/.active_engagement`. This must precede any
   Write-tool seed file — the gate hook quarantines writes into non-active engagements as context
   bleed, so seeding before switching destroys the seeds (regression guarded; see test plan).
5. Create the engagement's seed files (Write tool):
   - `<eng>/goals/primary_directive.md` — ask the operator for this engagement's directive, or
     adapt the compilar default.
   - `<eng>/goals/active_milestones.md` — the standard first-run checklist (stage corpus →
     `/question` → `/extract`+`/consume` → `/index` → `/analyze`).
   - `<eng>/INDEX.md` — the engagement wiki home, from the structure of an existing engagement's
     INDEX.md (empty run-status tables).
6. Register it in the global `operations/INDEX.md` Engagement Registry (name, directive one-liner,
   active marker).
7. Log the birth of the engagement to its own ledger:
   `.claude/scripts/append_log.sh INIT <name> SUCCESS <name>` and commit:
   `git add -A && git commit -m "[INIT] WB-<id>: engagement <name> scaffolded"`.
8. Report: `[SUCCESS] Initialized and switched to <name>.`
