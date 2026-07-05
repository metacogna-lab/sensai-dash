# Sensai Compilar: Skill & Agent Standard

Every new pipeline phase is a pair: a native subagent in `.claude/agents/*.md` (the cognitive work,
model-routed) and a native skill in `.claude/skills/<name>/SKILL.md` (the orchestration: read
inputs, invoke the agent, write the output, let the hook gate it, commit). New phases must follow
this standard.

## 1. Structural Requirements

- **Agent isolation:** an agent reads what it's handed and returns one Markdown document as its
  final message. It never writes files directly and never invokes other agents.
- **Skill orchestration:** a skill reads from exactly one input directory layer and writes to
  exactly one output directory layer. Never mix raw inputs with outcomes in the same skill.
- **Idempotency:** running a skill twice on the same input must not corrupt state — artifacts use
  deterministic slug filenames (`node--<source-slug>.md`, `theory--<slug>.md`, …), so a rerun
  overwrites its own prior output rather than spawning duplicates; timestamps live in frontmatter
  (`created:`), and raw inputs move to `03_archive/` only after a successful, gated write.
- **Wiki discipline:** artifacts cross-reference each other with `[[wikilinks]]` and every skill
  updates the relevant section of `operations/INDEX.md` inside the same Work Block — an artifact not
  reachable from `INDEX.md` is invisible to downstream agents.

## 2. Mandatory Gating

No skill may consider its Work Block done because the agent returned text — it is done only when
the write lands in the target directory and the `PostToolUse` gate hook does not block it
(`.claude/scripts/post_write_gate.sh` → `gate.sh`). A skill must never treat a `GATED` block as
silent failure: read the reason from stderr, re-invoke the agent with that feedback, and retry.

## 3. Logging & Commit

Do not append to `operations/telemetry/execution.log` by hand from within a skill's own reasoning —
the `PostToolUse` hook does it for every Write-tool write into a gated directory. A skill's job
after a successful write is only to read the last line for the `WB-ID`, update `INDEX.md`, and
issue the commit. One skill invocation = one commit.

**Sole exception — Bash-created files:** the Write hook cannot see files produced by Bash commands
(e.g. `/extract` running `pdftotext`). A phase that writes via Bash must gate its own output
(verify non-empty, well-formed) and log explicitly with
`.claude/scripts/append_log.sh <PHASE> <target> <SUCCESS|GATED>`. Prefer Write-tool output paths so
the hook does this for you.

## 4. Registration

A new phase must be registered in four places: `.claude/agents/<name>.md`,
`.claude/skills/<name>/SKILL.md`, a `case` arm in `.claude/scripts/post_write_gate.sh` (plus a
required-section check in `gate.sh` if the artifact has a load-bearing section), and a template in
`operations/templates/`. Then add its row to the I/O contract table in `operations/README.md` and its
line to the Run Status table in `operations/INDEX.md`. A skill with no gate gets no automatic logging
and silently drifts from the ledger — do not skip the hook wiring.
