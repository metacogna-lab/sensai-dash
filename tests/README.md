# Hook-Layer Regression Suite

31 bats cases covering `.claude/scripts/gate.sh`, `append_log.sh`, and `post_write_gate.sh` — the
enforcement layer this harness's entire "deterministic gating" claim rests on, including the
per-engagement auto-commit behavior. See
[operations/guides/02_MAINTENANCE.md](../operations/guides/02_MAINTENANCE.md) for when to run
this suite and how it relates to the manual smoke-test recipe.

## Running

```bash
brew install bats-core   # once
bats tests/
```

## What's tested vs. what isn't

Tested: every `gate.sh` required-section/frontmatter check, `append_log.sh`'s WB-ID minting,
pointer resolution, and per-engagement auto-commit (including the GATED case and the
no-git-repo-yet warning path), and `post_write_gate.sh`'s full decision tree — valid/invalid
writes, no-op paths, context bleed (rejected into the *targeted* engagement's own `.rejected/`),
missing pointer, fail-closed behavior on unparseable payloads and a missing `python3`,
ledger-append-failure reporting, and that a successful Work Block lands a commit in the
engagement's own repo (never the harness repo).

**Not tested here:** the `/init-engagement` step-ordering fix (eng finding F4) — bats can't drive
Claude Code's Skill/Agent tool, so that regression is guarded at the mechanism level only (the
context-bleed test proves the underlying check the fix depends on). Also not tested: the
WB-ID read/append race under concurrent writes (finding F8) or size/chunking guards (F15) —
neither fix has landed yet; see the task ledger's roadmap.

## A bug this suite caught on first run

Writing these tests found a real, previously-shipped bug: `ENG_ROOT` was built from
`$CLAUDE_PROJECT_DIR` without canonicalizing it, while the incoming `file_path` *is*
canonicalized (via `os.path.realpath`) before the prefix-match check. On macOS, `mktemp -d`
(and, in principle, any symlinked ancestor of a real checkout) lands under `/var/folders/...`,
which is itself a symlink to `/private/var/folders/...` — so the two sides of the comparison
never matched, and every gated write silently became a no-op. That's fail-*open*, the exact
failure class the whole P1 hardening pass existed to prevent. Fixed by canonicalizing
`PROJECT_DIR` once at script start (`pwd -P`). This is the concrete argument for the suite's own
existence: a hand-reviewed diff would not have caught this; running it against real paths did.
