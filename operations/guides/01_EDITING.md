# Editing the Harness Safely

Every layer below can be changed. This guide is the difference between a change that lands
cleanly and one that silently breaks a gate, an agent, or the ledger.

## The four-point registration contract

[operations/SKILL.md](../SKILL.md) already states this; repeated here because it's the #1 way
edits break things. A new phase — or a change to an existing one's output shape — touches:

1. `.claude/agents/<name>.md` — the cognitive work, model-routed.
2. `.claude/skills/<name>/SKILL.md` — the orchestration (read → invoke agent → write → commit).
3. `.claude/scripts/post_write_gate.sh` — a `case` arm mapping the output path to `PHASE`/`TYPE`/`TPL`.
4. `operations/templates/<type>.md` — the schema, including any required sections `gate.sh` checks.

Then two non-code updates: the row in `operations/README.md`'s I/O contract table, and the Run
Status row in the relevant `INDEX.md`. Missing #3 means the artifact is never gated or logged —
silent, and the hardest of these to notice because everything *looks* like it worked.

**Verification after any of the four:** write one valid and one deliberately invalid artifact to
the new/changed path and confirm the gate passes/rejects as expected (see `02_MAINTENANCE.md`'s
smoke-test recipe). Don't trust a code review of the `case` arm alone — regex drift is exactly
the failure class the harness exists to prevent, and it's silent until you test it.

## Editing an agent (`.claude/agents/*.md`)

Agents are Read/Grep/Glob-only by design (never Write/Bash) — that's the injection containment
boundary from the eng review. Don't grant an agent Write or Bash to "make it more capable"; that
removes the one thing standing between a poisoned corpus and an uncontrolled write. If an agent
genuinely needs to produce a file, the calling skill writes it, not the agent.

Changing an agent's `model:` frontmatter changes its cost/quality tier — do this deliberately, not
as a quick fix for a bad output (a bad output is usually a prompt problem; see
`04_PROMPT_TUNING.md`).

## Editing a skill (`.claude/skills/*/SKILL.md`)

Skills are prose instructions to Claude Code, not executable code — there's no syntax to lint.
The failure mode is a skill whose instructions drift from what the hook actually enforces (e.g. a
skill says "write to `outcomes/broadcast/`" after that directory was renumbered to
`outcomes/05_broadcast/` — the write would still gate correctly by path, but the skill's own
prose becomes misleading to the next reader, human or agent). After any path-touching change,
`grep` the skills and agents directory for the old path string — this repo's own P0 restructure
(renumbering `outcomes/`) is the worked example: every one of the ~13 files referencing the old
paths had to be found and fixed in the same commit.

## Editing a hook script (`.claude/scripts/*.sh`)

The highest-blast-radius edit in the harness — these scripts can delete (well: quarantine, as of
the post-review hardening) user artifacts. Rules, non-negotiable:

- **Fail closed, not open.** If a hook can't determine what to do (unparseable input, missing
  dependency), it must block (`exit 2`) and say why — never `exit 0` silently. This was CEO
  finding E9 / eng finding F5; the current `post_write_gate.sh` fails closed on payload-parse
  errors and a missing `python3`. Keep it that way when you touch this file.
- **Quarantine, don't delete.** Rejected/bled writes move to the OWNING engagement's own
  `.rejected/` (`engagements/<eng>/.rejected/`, gitignored inside that engagement's own
  repo) with a timestamp suffix, never `rm -f`. This was eng finding F2 (Edit failures were
  destroying pre-existing artifacts). If you're tempted to add another `rm -f` on a new failure
  path, route it through the existing `reject_file()` helper instead. The one exception is the
  malformed-engagement-segment case, which uses the harness-level `reject_file_fallback()` (a
  shared `operations/.rejected/`) because the engagement name itself isn't trustworthy enough yet
  to build a path from.
- **Anchor and canonicalize paths before acting on them.** `post_write_gate.sh` resolves the
  incoming path with `os.path.realpath`, canonicalizes `PROJECT_DIR` itself the same way
  (`pwd -P` — a symlinked ancestor otherwise defeats the prefix match silently, fail-open; the
  bats suite caught this once), and only acts on paths under this repo's
  `engagements/` root — this was eng finding F1 (an unanchored path could match and
  quarantine files in an unrelated checkout). Any new path-matching logic must do the same. Also
  remember a bare file directly under `engagements/` (no engagement subdirectory — e.g.
  the tracked `README.md` there) is not inside any engagement; it must be a no-op, not treated as
  a bleed into an engagement named after the filename.
- **Every Work Block commit happens inside the engagement's OWN repo, automatically.**
  `append_log.sh` runs `git -C <engagement-dir> add -A && git commit` right after appending the
  ledger line — this is what makes commits "regular" without any skill remembering to run one.
  Never add a `git commit` call to a skill file, and never point a hook's commit logic at the
  harness repo (`$PROJECT_DIR`) instead of the engagement directory — that would silently commit
  research data into the wrong repository.
- **One reason file per invocation, via `mktemp`.** Never write hook scratch state to a fixed
  `/tmp` path — a fixed path is both a symlink-attack surface and a cross-session data race (eng
  finding F9).

## Editing a template (`operations/templates/*.md`)

Templates are the schema `gate.sh` enforces (frontmatter `type`/`status`, and for four types a
required section — `## Monetization Vector`, `## Baseline (As-Is)`, `## Verdict`, `## Execution
Detail`). Two edit classes:

- **Additive** (new optional section, clarified comment): safe, no migration needed. Existing
  artifacts remain valid since `gate.sh` doesn't reject unknown sections.
- **Schema-breaking** (renaming/requiring a section `gate.sh` checks, changing a required
  frontmatter value): this orphans every existing artifact of that type — they'll fail
  `/stress-test` re-checks or simply look stale next to new ones written under the new schema.
  When you must do this: add a `schema_version:` frontmatter field to the template (not present
  today — introduce it at the first schema-breaking change), bump it, and note the migration in
  the template's leading HTML comment (what changed, why, and whether old artifacts need
  re-generating or are grandfathered as-is). Do not silently redefine what "valid" means for
  files that already passed the gate under the old definition.

## The sanctioned hand-edit override

`HOW_TO.md`'s prior "never hand-edit" doctrine was honest but incomplete — quarantine-conflict
resolution and FAIL-verdict rework both require touching artifacts outside the pipeline, and
pretending otherwise just pushes the edit underground where the ledger doesn't see it (DX
finding D-5). If you must hand-edit an artifact outside Claude Code:

1. Make the edit.
2. Log it explicitly so the ledger stays truthful:
   `.claude/scripts/append_log.sh <PHASE> <filename> GATED-OVERRIDE`
   (`GATED-OVERRIDE` is a new status value alongside `SUCCESS`/`GATED`/`FAIL` — it means "a human
   bypassed the gate for a legitimate reason," distinct from an automated pass or rejection.)
3. Update the relevant `INDEX.md` by hand to match — the wiki-discipline rule ("an artifact not
   reachable from INDEX.md is invisible to downstream agents") doesn't suspend itself for manual
   edits.

## The two-retry cap

When a skill's agent produces output the gate rejects, the skill re-invokes the agent with the
rejection reason and tries again. **Cap this at two rewrite attempts.** If the same artifact is
still failing the gate on the third try, stop — the problem is very likely a template/agent
mismatch (the agent is producing a shape the template doesn't describe, or vice versa), and
burning further model calls on the same broken contract wastes tokens without converging. Fix the
mismatch (this is an `01_EDITING.md` "editing a skill/template" situation), then retry once.
