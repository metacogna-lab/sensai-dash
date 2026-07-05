---
name: bootstrap
description: Pre-flight check for the Sensai Compilar harness — verifies system logic (agents, skills, hooks, templates), the multi-tenant engagement layout, the active-engagement pointer, and extraction tooling. Use when setting up a new environment or when /bootstrap is invoked explicitly.
---

Run this before any other Sensai Compilar command in a fresh checkout.

**System layer (global):**
1. Confirm the harness is complete:
   agents `.claude/agents/{strategist,consumer,indexer,analyst,evaluator,verifier,synthesist,broadcaster,historian,auditor}.md`;
   skills `.claude/skills/{bootstrap,switch,init-engagement,question,extract,consume,index,analyze,evaluate,stress-test,verify,synthesize,broadcast,longitudinal,daily-summary,audit}/SKILL.md`;
   hooks `.claude/scripts/{post_write_gate,gate,append_log,check_committed}.sh` all executable
   (`chmod +x` any that aren't) and wired in `.claude/settings.json`.
2. Verify `operations/templates/` contains all 11 schemas: standard_node, theory, economic_model,
   broadcast_post, research_questions, daily_audit, corpus_map, conflict, verification,
   longitudinal_report, alignment.
3. Verify extraction tooling: `command -v pdftotext`. If absent, note that `/extract` falls back to
   Read-tool PDF transcription (slower) and suggest `brew install poppler`.
4. Verify `python3` is on `PATH` (`command -v python3`). The gate hook parses its JSON payload
   with python3 and fails CLOSED if it's missing — that's the correct, safe behavior, but if
   python3 is genuinely absent every gated write will block until it's restored. Report this
   loudly, don't just note it in passing.
5. **Hook self-test (the enforcement layer must be verified live, not assumed):** write a
   deliberately invalid Markdown file (missing required frontmatter) to
   `operations/engagements/<active>/research_body/02_nodes/__bootstrap_selftest__.md` using the
   Write tool. Confirm the PostToolUse hook blocks it and the file lands in
   `operations/.rejected/` (not silently accepted, not deleted). Clean up any leftover
   `.rejected/` copy afterward. If the write is NOT blocked, the gate is failing open — this is a
   CRITICAL result, stop and report it before doing anything else; do not proceed to run any
   pipeline phase until this is fixed (see `operations/guides/02_MAINTENANCE.md`).
6. Verify this is a git repository (`git rev-parse --is-inside-work-tree`). If not, tell the user
   the Work Block/commit protocol requires git, and ask before running `git init`.

**Engagement layer (multi-tenant):**
7. Verify `operations/.active_engagement` exists and names a directory under `operations/engagements/`.
   If the pointer is missing but engagements exist, ask which to activate (`/switch`). If no
   engagements exist at all, recommend `/init-engagement <name>`.
8. For EACH engagement under `operations/engagements/`, verify its isolated tree:
   `goals/`, `goals/audits/`,
   `research_body/{00_inbox,01_raw,02_nodes,03_archive,04_quarantine}`,
   `outcomes/{01_theories,02_economic_models,03_verification,04_alignment,05_broadcast,longitudinal}`,
   `telemetry/execution.log` (with the header row `TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS`),
   and `INDEX.md`. Create anything missing.
9. Verify the global wiki home `operations/INDEX.md` exists and its Engagement Registry lists every
   directory in `operations/engagements/` with the active one marked.

Report a short pass/fail summary per layer. Do not commit — bootstrap isn't a phase and logs
nothing.
