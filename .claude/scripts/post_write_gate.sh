#!/bin/bash
# Sensai Compilar: PostToolUse hook for Write|Edit — the deterministic gate.
# Hardened per autoplan review (F1, F2, E9, F6, F9):
#   - fail CLOSED: unparseable payload, missing python3, or missing file_path blocks the write
#   - paths are canonicalized and anchored to THIS repo's engagements root before any action
#   - rejected files are QUARANTINED to operations/.rejected/ (recoverable), never rm'd
#   - gate reason captured via mktemp, not a fixed /tmp path
# On pass: appends the Work Block ledger line to the owning engagement's execution.log.

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POINTER="$PROJECT_DIR/operations/.active_engagement"
ENG_ROOT="$PROJECT_DIR/operations/engagements"
REJECT_DIR="$PROJECT_DIR/operations/.rejected"

if ! command -v python3 >/dev/null 2>&1; then
    echo "gate hook: python3 not found — enforcement cannot run, blocking the write (fail-closed). Install python3 or fix PATH, then retry." >&2
    exit 2
fi

PAYLOAD=$(cat)
PARSED=$(printf '%s' "$PAYLOAD" | python3 -c '
import json, sys, os
try:
    d = json.load(sys.stdin)
except Exception:
    print("__PARSE_ERROR__"); sys.exit(0)
fp = d.get("tool_input", {}).get("file_path", "")
if fp:
    fp = os.path.realpath(fp)
print(fp)
')

if [ "$PARSED" = "__PARSE_ERROR__" ]; then
    echo "gate hook: unparseable hook payload — enforcement would be OFF, blocking the write (fail-closed). Run /bootstrap to self-test the hook." >&2
    exit 2
fi
FILE_PATH="$PARSED"
if [ -z "$FILE_PATH" ]; then
    echo "gate hook: payload carried no file_path for a Write/Edit — blocking (fail-closed)." >&2
    exit 2
fi

# Only writes inside THIS repo's engagements root are gated (canonicalized + anchored — F1).
case "$FILE_PATH" in
    "$ENG_ROOT"/*) : ;;
    *) exit 0 ;;
esac

# Quarantine, never delete (F2): rejected files stay recoverable.
reject_file() {
    mkdir -p "$REJECT_DIR"
    REJECTED_AS="$REJECT_DIR/$(basename "$FILE_PATH").$(date +%s)"
    mv -f "$FILE_PATH" "$REJECTED_AS" 2>/dev/null || REJECTED_AS="(move failed — file left in place)"
}

REL="${FILE_PATH#"$ENG_ROOT"/}"
ENGAGEMENT="${REL%%/*}"
# realpath above already collapsed ../ segments (F6); this is belt-and-braces.
case "$REL" in
    *..*|"")
        reject_file
        echo "Rejected: malformed engagement path ($FILE_PATH). Moved to $REJECTED_AS." >&2
        exit 2
        ;;
esac

# Context-bleed enforcement: writes land only in the ACTIVE engagement.
if [ ! -f "$POINTER" ]; then
    reject_file
    echo "Rejected: no active engagement pointer (operations/.active_engagement). File quarantined at $REJECTED_AS — run /switch <name> or /init-engagement <name>, then restore or regenerate it." >&2
    exit 2
fi
ACTIVE=$(tr -cd 'a-z0-9_' < "$POINTER")
if [ "$ENGAGEMENT" != "$ACTIVE" ]; then
    reject_file
    echo "Context bleed blocked: write targeted engagement '$ENGAGEMENT' but the active engagement is '$ACTIVE'. File quarantined at $REJECTED_AS. Run /switch $ENGAGEMENT first if this was intentional." >&2
    exit 2
fi

case "$FILE_PATH" in
    */research_body/02_nodes/*.md)      PHASE="CONSUME";      TYPE="node";               TPL="standard_node.md" ;;
    */research_body/corpus_map.md)      PHASE="INDEX";        TYPE="corpus_map";         TPL="corpus_map.md" ;;
    */research_body/04_quarantine/*.md) PHASE="QUARANTINE";   TYPE="conflict";           TPL="conflict.md" ;;
    */outcomes/theories/*.md)           PHASE="ANALYZE";      TYPE="theory";             TPL="theory.md" ;;
    */outcomes/economic_models/*.md)    PHASE="EVALUATE";     TYPE="economic_model";     TPL="economic_model.md" ;;
    */outcomes/verification/*.md)       PHASE="VERIFY";       TYPE="verification";       TPL="verification.md" ;;
    */outcomes/longitudinal/*.md)       PHASE="LONGITUDINAL"; TYPE="longitudinal";       TPL="longitudinal_report.md" ;;
    */outcomes/alignment/*.md)          PHASE="SYNTHESIZE";   TYPE="alignment";          TPL="alignment.md" ;;
    */outcomes/broadcast/*.md)          PHASE="BROADCAST";    TYPE="broadcast";          TPL="broadcast_post.md" ;;
    */goals/research_questions.md)      PHASE="QUESTION";     TYPE="research_questions"; TPL="research_questions.md" ;;
    */goals/audits/*.md)                PHASE="AUDIT";        TYPE="audit";              TPL="daily_audit.md" ;;
    *) exit 0 ;;
esac

TARGET=$(basename "$FILE_PATH")
REASON_FILE=$(mktemp "${TMPDIR:-/tmp}/sensai_gate.XXXXXX")
trap 'rm -f "$REASON_FILE"' EXIT

if "$SCRIPT_DIR/gate.sh" "$FILE_PATH" "$TYPE" 2>"$REASON_FILE"; then
    if ! "$SCRIPT_DIR/append_log.sh" "$PHASE" "$TARGET" "SUCCESS" "$ENGAGEMENT" >/dev/null; then
        echo "gate hook: artifact $TARGET passed the gate but the ledger append FAILED — fix operations/engagements/$ENGAGEMENT/telemetry/ and log this Work Block manually via append_log.sh." >&2
        exit 2
    fi
    exit 0
else
    REASON=$(cat "$REASON_FILE")
    reject_file
    "$SCRIPT_DIR/append_log.sh" "$PHASE" "$TARGET" "GATED" "$ENGAGEMENT" >/dev/null 2>&1 || true
    echo "Gate failed for $TARGET (quarantined at $REJECTED_AS). Reason: $REASON. Follow the schema in operations/templates/$TPL and rewrite. If this rejection looks wrong twice in a row, stop and inspect the template vs the output yourself." >&2
    exit 2
fi
