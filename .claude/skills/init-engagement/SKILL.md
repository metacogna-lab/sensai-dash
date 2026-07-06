---
name: init-engagement
description: Scaffolds a new isolated engagement (tenant workspace) under engagements/, gives it its own standalone git repository, and switches to it. Use when starting research for a new, distinct domain/client/project that must not share context or history with existing engagements.
---

Argument: an engagement name (snake_case). (This is the PRD's `/init` command, renamed to avoid
colliding with Claude Code's built-in `/init`.)

1. Sanitize the argument: lowercase letters, digits, underscores only. Reject anything containing
   `/`, `..`, or spaces.
2. If `engagements/<name>/` already exists, stop and offer `/switch <name>` instead.
3. Scaffold the isolated tree:
   ```bash
   ENG="engagements/<name>"
   mkdir -p "$ENG"/{goals/audits,research_body/{00_inbox,01_raw,02_nodes,03_archive,04_quarantine},outcomes/{01_theories,02_economic_models,03_verification,longitudinal,04_alignment,05_broadcast},telemetry}
   echo "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS | COST" > "$ENG/telemetry/execution.log"
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
6. **Give it its own repository — every engagement is a standalone git repo, never a subdirectory
   of the harness repo's history.** This is what makes an engagement genuinely isolated: separate
   commit history, separate lifecycle, separately deletable/exportable/pushable-to-its-own-remote
   later, and no risk of one client's research data ending up in another's (or the harness
   template's own) git log.
   ```bash
   git -C "$ENG" init -q
   printf '.rejected/\n' > "$ENG/.gitignore"
   ```
   (`.rejected/` is quarantine scratch — recoverable working-tree state, not a Work Block product;
   see `operations/guides/02_MAINTENANCE.md`. Everything else in the engagement — goals, corpus,
   outcomes, telemetry — is exactly what this repo's history should hold.)
7. Register it in the global `operations/INDEX.md` Engagement Registry (name, directive one-liner,
   active marker). This is a harness-repo (system layer) change — leave it to the normal commit
   flow for this repo, do not fold it into the engagement's own commit.
8. Log the birth of the engagement to its own ledger:
   `.claude/scripts/append_log.sh INIT <name> SUCCESS <name>`. This appends the ledger header line
   AND commits the entire initial scaffold — seed files, `.gitignore`, and the ledger itself — as
   one Work Block inside the new engagement's own repo. Do not run a separate `git add`/`git
   commit` yourself; that already happened. If the warning "no git repo yet" appears, step 6 was
   skipped or failed — fix that before continuing, don't just retry the log call.
9. Report: `[SUCCESS] Initialized and switched to <name>. Own repo at engagements/<name>/.git.`
