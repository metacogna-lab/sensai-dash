# Maintaining the Harness

The health rhythm: what to check, how often, and what silent failure looks like for each layer.

## The smoke-test recipe (run after any hook or gate-arm change)

This is the exact recipe used to verify every change in this repo's own build (P0 renumbering,
P1 hardening). Two writes, both via the Write tool so the `PostToolUse` hook actually fires:

1. **Valid case:** write a well-formed artifact to the path you changed/added. Confirm: the write
   succeeds, `tail` the engagement's `telemetry/execution.log` and see the expected `SUCCESS` line
   with the right `PHASE`.
2. **Invalid case:** write the same path with a required field/section missing. Confirm: the
   write is blocked (you'll see the `PostToolUse:Write hook blocking error` message), the file is
   quarantined to that engagement's own `operations/engagements/<eng>/.rejected/` (not deleted),
   and the ledger shows `GATED`.
3. **Clean up:** remove both test artifacts and reset the ledger to its header row before
   committing — test noise in the ledger corrupts the WB-ID sequence for real work. Since Work
   Blocks now auto-commit, also check `git -C operations/engagements/<eng> log` for stray test
   commits and `git reset --soft`/amend them away before you're done — a smoke test that leaves
   `[CONSUME] WB-004: __bootstrap_selftest__.md (GATED)` in real history is exactly the noise
   step 3 exists to prevent.

If you changed engagement-isolation logic specifically, add a third case: write into a
*different* engagement than the active one and confirm it's quarantined as context bleed, not
silently accepted.

## `/bootstrap` — run it, don't just trust it

`/bootstrap` checks directory structure, script executability, template completeness, the
active-engagement pointer, and `pdftotext`. As of the post-review hardening it should also
self-test the gate hook itself (write a deliberately invalid file to a gated path and confirm the
hook blocks it) and check `python3` is on `PATH` — both were failure-open surfaces the eng review
found (`gate hook: python3 not found` and unparseable-payload paths are only *fail-closed* if the
code path that detects them actually runs; `/bootstrap` verifying that is the difference between
"should be safe" and "verified safe today"). Run it: after any hook/script change, after a Claude
Code or dependency upgrade, and at the start of any new environment.

## The triple-bookkeeping sync checklist

Path → (phase, type, template) is recorded in three places that don't share a single source of
truth: the hook's `case` arms, `operations/README.md`'s I/O contract table, and each phase's
`SKILL.md`. This is a known, accepted tradeoff (11-14 arms is small enough to hand-sync), but it's
also exactly where this repo's own renumbering work found stale references. Checklist to run
whenever any gated path changes:

```bash
# Substitute the old and new path fragments.
grep -rn "OLD_PATH_FRAGMENT" .claude operations CLAUDE.md HOW_TO.md
```

Every hit is a place that needs the new fragment. Do this in the same commit as the change, not
as a follow-up — a stale reference in a `SKILL.md` won't break the hook (the hook is the source
of truth for enforcement), but it will mislead the next reader into thinking the old path is still
correct.

## Substrate-churn watch

The harness's "code" is Claude Code native configuration: `.claude/agents/*.md` frontmatter,
`.claude/skills/*/SKILL.md`, and the `PostToolUse`/`Stop` hook contract in `.claude/settings.json`.
None of this is versioned against a specific Claude Code release. If a future Claude Code update
changes:
- the hook JSON payload shape → `post_write_gate.sh`'s python3 parser needs updating (it already
  fails closed on a shape it doesn't recognize — see `01_EDITING.md` — so the failure mode is "the
  hook blocks everything," which is loud and safe, not silent).
- the `Agent` tool's `subagent_type` resolution or agent frontmatter schema → the 10 agents in
  `.claude/agents/` may stop being discoverable; verify with `/bootstrap`'s agent-completeness
  check after any Claude Code upgrade.
- Skill invocation syntax → re-run the smoke tests above; the gate/ledger layer is independent of
  skill syntax and should be unaffected.

The honest naming note from the eng review (finding F16) applies here too: these gates validate
schema *envelopes* (frontmatter + required section presence), not artifact *truth*. Don't let
substrate maturity ("Claude Code hooks are robust now") get conflated with "gates prove the
content is correct" — they never did, and the docs should keep saying so.

## `.rejected/` recovery

Since the P1 hardening, a gate/bleed rejection moves the file to that engagement's own
`operations/engagements/<eng>/.rejected/<filename>.<unix-timestamp>` instead of deleting it (the
one exception — a malformed engagement-name segment — falls back to the shared
`operations/.rejected/` in the harness repo, since the name isn't trustworthy enough to build a
per-engagement path from). To recover:

1. Inspect the file — read the rejection reason from the chat/hook output (it names the specific
   missing field or section).
2. Fix it in place, or copy the content into a fresh Write through the correct skill (preferred —
   this re-exercises the gate and gets you a proper ledger line, and thus a proper commit).
3. Delete the `.rejected/` copy once recovered; it's listed in the engagement's own `.gitignore`
   (added by `/init-engagement`), not the record of truth.

If `.rejected/` is accumulating files faster than they're being resolved, that's the same signal
as a growing quarantine queue: the run needs your attention, not more corpus.

## Two repos, one harness

Every command in this harness operates on exactly one of two trust boundaries:

- **The harness repo** (this repo) — `.claude/`, `operations/` system files, `agents/`, `tests/`.
  Commits here require operator consent, same as any dev repo; the Stop hook only reminds.
- **The active engagement's own repo** — `operations/engagements/<name>/`, created by
  `/init-engagement` and gitignored from the harness repo. Every Work Block commits here
  *automatically*, via `append_log.sh`. This is the harness's own designed automation, not a
  session deciding to commit on the operator's behalf — don't second-guess it by adding consent
  gates, and don't confuse a reminder about the harness repo with one about an engagement repo (the
  Stop hook checks both, separately, and says which is which).

If an engagement predates this feature and has no `.git` yet, `/bootstrap` initializes one (with
an initial commit of its current state) rather than silently leaving it half-migrated — check for
"has no git repo yet" warnings from `append_log.sh` as the tell.

## Regression net

`tests/` (added post-review) is a bats suite covering the hook layer's case arms, the bleed check,
traversal rejection, missing-pointer handling, and the specific `/init-engagement` ordering
regression (seed files must survive being written before the pointer switches — this was broken
once, see the task ledger's eng review finding F4). Run it after any change to
`.claude/scripts/*.sh`. It is the only mechanical net over enforcement-layer behavior; the smoke
tests above are for one-off verification of a specific change, the suite is for "did I break
something else."
