# Sensai Mission Control: Skill & Agent Standard

Every new pipeline phase is a pair: a native subagent in `.claude/agents/*.md` (the cognitive work,
model-routed) and a native skill in `.claude/skills/<name>/SKILL.md` (the orchestration: read
inputs, invoke the agent, write the output, let the hook gate it and commit it). New phases must
follow this standard.

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

**Retry cap: two rewrite attempts, then stop.** If the same artifact still fails the gate on the
third try, the problem is almost certainly a template/agent mismatch, not a fixable prompt
variance — stop retrying, fix the mismatch (see `operations/guides/01_EDITING.md`), and only then
retry once more. Burning further model calls against the same broken contract wastes tokens
without converging.

## 3. Logging & Commit

Do not append to `<eng>/telemetry/execution.log` by hand from within a skill's own reasoning —
`.claude/scripts/append_log.sh` does it for every Write-tool write into a gated directory (called
by the `PostToolUse` hook). That same script **also commits the Work Block automatically**, inside
the owning engagement's own git repository — never the harness repo, and never something a skill
does itself with `git add`/`git commit`. A skill's job after a successful write is only to update
`INDEX.md` and, if it needs the `WB-ID` for its report to the operator, read the last line of the
ledger. One skill invocation = one Work Block = one automatic commit.

**Sole exception — Bash-created files:** the Write hook cannot see files produced by Bash commands
(e.g. `/extract` running `pdftotext`). A phase that writes via Bash must gate its own output
(verify non-empty, well-formed) and log explicitly with
`.claude/scripts/append_log.sh <PHASE> <target> <SUCCESS|GATED>` — call this LAST, after every other
file change for that Work Block (archiving a source, updating `INDEX.md`), so the one automatic
commit it triggers captures the whole block together. Prefer Write-tool output paths so the hook
does this for you without the ordering caveat.

**If a Work Block isn't committed:** `append_log.sh` warns loudly rather than failing silently —
either the engagement has no `.git` yet (run `/bootstrap`, which will initialize one) or nothing
was staged. The ledger line itself is still authoritative either way; see
`operations/guides/02_MAINTENANCE.md`.

## 4. Registration

A new phase must be registered in four places: `.claude/agents/<name>.md`,
`.claude/skills/<name>/SKILL.md`, a `case` arm in `.claude/scripts/post_write_gate.sh` (plus a
required-section check in `gate.sh` if the artifact has a load-bearing section), and a template in
`operations/templates/`. Then add its row to the I/O contract table in `operations/README.md` and its
line to the Run Status table in `operations/INDEX.md`. A skill with no gate gets no automatic logging
and silently drifts from the ledger — do not skip the hook wiring.
