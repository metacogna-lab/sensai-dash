#!/bin/bash
# Sensai Compilar: Stop hook.
# Reminds (does not block) about two distinct things:
#  1. Uncommitted changes in the HARNESS repo (this repo itself — .claude/, operations/
#     system files, guides, tests). Advisory only: harness commits require explicit user
#     consent (see root CLAUDE.md / global git-workflow rules), so this hook must never
#     force a commit by blocking session stop.
#  2. Uncommitted changes in any ENGAGEMENT's own repo. Under normal operation this
#     should never happen — append_log.sh auto-commits every Work Block — so dirty
#     engagement state usually means a hand-edit (see operations/guides/01_EDITING.md's
#     sanctioned override) that wasn't logged via GATED-OVERRIDE, or a failed auto-commit
#     that append_log.sh already warned about. Also advisory: engagement auto-commits are
#     the harness's own automation, not something this hook should second-guess by
#     forcing a commit on the user's behalf.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

check_repo() {
    local dir="$1" label="$2" advice="$3"
    (
        cd "$dir" 2>/dev/null || exit 0
        git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
        DIRTY=$(git status --porcelain)
        if [ -n "$DIRTY" ]; then
            echo "Reminder: uncommitted changes remain in $label ($dir)." >&2
            echo "$DIRTY" | head -5 >&2
            echo "$advice" >&2
        fi
    )
}

check_repo "$PROJECT_DIR" "the harness repo" \
    "If the user has approved committing this harness Work Block, run: git add -A && git commit -m \"[PHASE] WB-<id>: <summary>\". Do not commit without explicit user consent."

if [ -d "$PROJECT_DIR/engagements" ]; then
    for eng_dir in "$PROJECT_DIR"/engagements/*/; do
        [ -d "$eng_dir" ] || continue
        eng_name="$(basename "$eng_dir")"
        check_repo "$eng_dir" "engagement '$eng_name'" \
            "Uncommitted engagement state is unexpected under normal operation (append_log.sh auto-commits every Work Block) — check for an un-logged hand-edit, or a prior 'engagement repo commit did not happen' warning."
    done
fi

exit 0
