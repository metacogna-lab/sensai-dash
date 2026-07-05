#!/bin/bash
# Sensai Compilar: Stop hook.
# Reminds (does not block) when there are uncommitted changes, so the Work Block
# Git Commit Protocol isn't forgotten. This is advisory only: git commits require
# explicit user consent (see root CLAUDE.md / global git-workflow rules), so this
# hook must never force a commit by blocking session stop.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$PROJECT_DIR" || exit 0

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

DIRTY=$(git status --porcelain)
if [ -n "$DIRTY" ]; then
    echo "Reminder: uncommitted changes remain. If the user has approved committing this Work Block, run: git add -A && git commit -m \"[PHASE] WB-<id>: <summary>\". Do not commit without explicit user consent." >&2
fi

exit 0
