# Engagements

Each subdirectory here is its own **standalone git repository**, created by
`/init-engagement <name>` and gitignored from this harness repo (see the root `.gitignore`) —
that's why `git status` in the harness repo never shows engagement contents changing, even
though `/consume`, `/analyze`, etc. write files here constantly.

Every Work Block is committed automatically, inside the engagement's own repo, by
`.claude/scripts/append_log.sh` — see `operations/guides/02_MAINTENANCE.md` for what that means
day to day, and `operations/guides/01_EDITING.md` for the sanctioned hand-edit override if you
ever need to touch an artifact outside the pipeline.

If you're looking for a given engagement's actual content (research, theories, economic models,
telemetry), `cd` into its directory and treat it as its own repo: `git -C
engagements/<name> log`, etc.
