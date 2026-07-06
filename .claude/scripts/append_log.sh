#!/bin/bash
# Sensai Compilar: append one dense line to an engagement's Work Block ledger, then
# commit the Work Block to that engagement's OWN git repository.
# Usage: append_log.sh <PHASE> <TARGET> <STATUS> [engagement] [cost]
# STATUS is one of SUCCESS, EDIT, GATED, FAIL, GATED-OVERRIDE.
#   EDIT distinguishes a revision of an existing artifact from a first-write SUCCESS, so
#   re-edits don't inflate the SUCCESS Work Block count (eng review F12).
# If [engagement] is omitted, the active-engagement pointer is used.
# [cost] is a RESERVED column (CEO review E4): the enforcement layer has no token/cost data
#   at call time, so callers pass "-" (the default). The column exists now — a schema change
#   is free before the first real corpus run — so token accounting can backfill it later
#   without a second format migration that would break every historian/audit reader.
#
# Both Work Block paths converge here: the PostToolUse hook calls this after a gated
# Write/Edit, and /extract's Bash-created-file path calls it directly. Putting the
# per-engagement commit here (not duplicated in post_write_gate.sh) keeps "every Work
# Block gets logged AND committed" true regardless of which path produced it.
#
# The commit is scoped to the ENGAGEMENT's own repository, not the harness/dev repo
# this script lives in — those are a different trust boundary (see
# operations/guides/02_MAINTENANCE.md). Committing here is best-effort: a git hiccup
# (no repo yet, nothing staged, no git identity configured) prints a warning but never
# makes the ledger append itself fail — the ledger line is load-bearing, the commit is
# automation on top of it.

set -euo pipefail

PHASE="$1"
TARGET="$2"
STATUS="$3"

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
PROJECT_DIR="$(cd "$PROJECT_DIR" 2>/dev/null && pwd -P || echo "$PROJECT_DIR")"
POINTER="$PROJECT_DIR/operations/.active_engagement"

ENGAGEMENT="${4:-}"
if [ -z "$ENGAGEMENT" ]; then
    if [ ! -f "$POINTER" ]; then
        echo "append_log: no active engagement — run /switch or /init-engagement first" >&2
        exit 1
    fi
    ENGAGEMENT=$(tr -cd 'a-z0-9_' < "$POINTER")
fi

COST="${5:--}"

ENG_DIR="$PROJECT_DIR/engagements/$ENGAGEMENT"
LOG_FILE="$ENG_DIR/telemetry/execution.log"

mkdir -p "$(dirname "$LOG_FILE")"

# F8: serialize WB-ID minting + append so parallel writers (e.g. a batch /consume) don't
# both read the same line count and mint a colliding WB number. mkdir is atomic on POSIX;
# macOS has no flock, so a lock DIRECTORY is the portable primitive. Best-effort: if the
# lock can't be acquired within the timeout we proceed anyway rather than deadlock the
# pipeline — the WB-ID race is a rare, recoverable annoyance; a stuck ledger is not.
LOCK_DIR="$ENG_DIR/telemetry/.wb.lock"
acquired=0
tries=0
while [ "$tries" -lt 100 ]; do
    if mkdir "$LOCK_DIR" 2>/dev/null; then acquired=1; break; fi
    tries=$((tries + 1))
    sleep 0.1
done
if [ "$acquired" -eq 1 ]; then
    trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT
else
    echo "append_log: warning — could not acquire the ledger lock ($LOCK_DIR) after ~10s; proceeding without it, so a concurrent writer could mint a colliding WB-ID. Remove that dir if it's stale." >&2
fi

if [ ! -f "$LOG_FILE" ]; then
    echo "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS | COST" > "$LOG_FILE"
fi

PREV_COUNT=$(($(wc -l < "$LOG_FILE") - 1))
[ "$PREV_COUNT" -lt 0 ] && PREV_COUNT=0
WB_ID=$(printf "WB-%03d" "$((PREV_COUNT + 1))")

echo "$(date '+%Y-%m-%d %H:%M:%S') | ${PHASE} | ${WB_ID} | ${TARGET} | ${STATUS} | ${COST}" >> "$LOG_FILE"

# Regular, per-Work-Block commit into the ENGAGEMENT's own repo (not the harness repo).
if git -C "$ENG_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if ! git -C "$ENG_DIR" add -A 2>/dev/null || \
       ! git -C "$ENG_DIR" commit -q -m "[${PHASE}] ${WB_ID}: ${TARGET} (${STATUS})" 2>/dev/null; then
        echo "append_log: warning — ${WB_ID} logged but the engagement repo commit did not happen (nothing staged, or git identity not configured in $ENG_DIR). The ledger line is still authoritative; commit manually if needed." >&2
    fi
else
    echo "append_log: warning — engagement '$ENGAGEMENT' has no git repo yet at $ENG_DIR; Work Block logged but not committed. Run /bootstrap or re-create it with /init-engagement." >&2
fi

echo "$WB_ID"
