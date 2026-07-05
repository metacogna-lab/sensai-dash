#!/bin/bash
# Sensai Compilar: append one dense line to an engagement's Work Block ledger.
# Usage: append_log.sh <PHASE> <TARGET> <STATUS> [engagement]
# STATUS is one of SUCCESS, GATED, FAIL.
# If [engagement] is omitted, the active-engagement pointer is used.

set -euo pipefail

PHASE="$1"
TARGET="$2"
STATUS="$3"

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
POINTER="$PROJECT_DIR/operations/.active_engagement"

ENGAGEMENT="${4:-}"
if [ -z "$ENGAGEMENT" ]; then
    if [ ! -f "$POINTER" ]; then
        echo "append_log: no active engagement — run /switch or /init-engagement first" >&2
        exit 1
    fi
    ENGAGEMENT=$(tr -cd 'a-z0-9_' < "$POINTER")
fi

LOG_FILE="$PROJECT_DIR/operations/engagements/$ENGAGEMENT/telemetry/execution.log"

mkdir -p "$(dirname "$LOG_FILE")"
if [ ! -f "$LOG_FILE" ]; then
    echo "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS" > "$LOG_FILE"
fi

PREV_COUNT=$(($(wc -l < "$LOG_FILE") - 1))
[ "$PREV_COUNT" -lt 0 ] && PREV_COUNT=0
WB_ID=$(printf "WB-%03d" "$((PREV_COUNT + 1))")

echo "$(date '+%Y-%m-%d %H:%M:%S') | ${PHASE} | ${WB_ID} | ${TARGET} | ${STATUS}" >> "$LOG_FILE"
echo "$WB_ID"
