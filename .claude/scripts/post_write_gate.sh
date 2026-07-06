#!/bin/bash
# Sensai Compilar: PostToolUse hook for Write|Edit — the deterministic gate.
# Hardened per autoplan review (F1, F2, E9, F6, F9) + bats-suite discovery:
#   - fail CLOSED: unparseable payload, missing python3, or missing file_path blocks the write
#   - paths are canonicalized and anchored to THIS repo's engagements root before any action
#   - ENG_ROOT itself is canonicalized too (bats caught this): on macOS $CLAUDE_PROJECT_DIR
#     can be reached via a symlink (e.g. /var/folders -> /private/var/folders under a temp
#     sandbox, but the same class of issue applies to any symlinked ancestor in real use).
#     FILE_PATH is realpath'd by the python3 step below; comparing that against a
#     non-canonicalized ENG_ROOT silently fails the prefix match and every gated write
#     becomes a no-op — fail-OPEN, the exact failure class this hook exists to prevent.
#     Canonicalizing ENG_ROOT/POINTER/REJECT_DIR here keeps both sides of every comparison
#     on the same footing.
#   - rejected files are QUARANTINED, never rm'd — to the OWNING engagement's own
#     .rejected/ (engagements/<eng>/.rejected/) so its full audit trail,
#     failures included, stays inside that engagement's own repo. A shared fallback at
#     operations/.rejected/ (in the harness repo) exists only for the malformed-segment
#     case, where the engagement name itself isn't trustworthy enough to build a path from.
#   - gate reason captured via mktemp, not a fixed /tmp path
# On pass: appends the Work Block ledger line and commits it, inside the owning
# engagement's OWN git repo (see append_log.sh — both this hook and /extract's Bash path
# converge there, so the commit logic lives in one place).

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
PROJECT_DIR="$(cd "$PROJECT_DIR" 2>/dev/null && pwd -P || echo "$PROJECT_DIR")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POINTER="$PROJECT_DIR/operations/.active_engagement"
ENG_ROOT="$PROJECT_DIR/engagements"
FALLBACK_REJECT_DIR="$PROJECT_DIR/operations/.rejected"

if ! command -v python3 >/dev/null 2>&1; then
    echo "gate hook: python3 not found — enforcement cannot run, blocking the write (fail-closed). Install python3 or fix PATH, then retry." >&2
    exit 2
fi

PAYLOAD=$(cat)
# Emit two lines: tool_name, then the realpath'd file_path (F12 needs the tool name to tell
# a first-write SUCCESS from an Edit revision). A parse failure emits the single-line sentinel.
PARSED=$(printf '%s' "$PAYLOAD" | python3 -c '
import json, sys, os
try:
    d = json.load(sys.stdin)
except Exception:
    print("__PARSE_ERROR__"); sys.exit(0)
tn = d.get("tool_name", "")
fp = d.get("tool_input", {}).get("file_path", "")
if fp:
    fp = os.path.realpath(fp)
print(tn)
print(fp)
')

if [ "$(printf '%s\n' "$PARSED" | sed -n 1p)" = "__PARSE_ERROR__" ]; then
    echo "gate hook: unparseable hook payload — enforcement would be OFF, blocking the write (fail-closed). Run /bootstrap to self-test the hook." >&2
    exit 2
fi
TOOL_NAME=$(printf '%s\n' "$PARSED" | sed -n 1p)
FILE_PATH=$(printf '%s\n' "$PARSED" | sed -n 2p)
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
# Once ENGAGEMENT is known and validated (clean of ".."), reject into ITS OWN .rejected/.
reject_file() {
    local dir="$ENG_ROOT/$ENGAGEMENT/.rejected"
    mkdir -p "$dir"
    REJECTED_AS="$dir/$(basename "$FILE_PATH").$(date +%s)"
    mv -f "$FILE_PATH" "$REJECTED_AS" 2>/dev/null || REJECTED_AS="(move failed — file left in place)"
}

# Before ENGAGEMENT is validated, a malformed segment could itself contain traversal —
# never build a path out of it. Use the shared harness-level fallback instead.
reject_file_fallback() {
    mkdir -p "$FALLBACK_REJECT_DIR"
    REJECTED_AS="$FALLBACK_REJECT_DIR/$(basename "$FILE_PATH").$(date +%s)"
    mv -f "$FILE_PATH" "$REJECTED_AS" 2>/dev/null || REJECTED_AS="(move failed — file left in place)"
}

REL="${FILE_PATH#"$ENG_ROOT"/}"

# A bare file directly under engagements/ (no subdirectory component — e.g.
# the engagements/README.md placeholder) is not inside any engagement at all. Ungated:
# it can't bleed into a tenant that was never its target in the first place.
case "$REL" in
    */*) : ;;
    *) exit 0 ;;
esac

ENGAGEMENT="${REL%%/*}"
# realpath above already collapsed ../ segments (F6); this is belt-and-braces.
case "$REL" in
    *..*|"")
        reject_file_fallback
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
    */outcomes/01_theories/*.md)        PHASE="ANALYZE";      TYPE="theory";             TPL="theory.md" ;;
    */outcomes/02_economic_models/*.md) PHASE="EVALUATE";     TYPE="economic_model";     TPL="economic_model.md" ;;
    */outcomes/03_verification/*.md)    PHASE="VERIFY";       TYPE="verification";       TPL="verification.md" ;;
    */outcomes/longitudinal/*.md)       PHASE="LONGITUDINAL"; TYPE="longitudinal";       TPL="longitudinal_report.md" ;;
    */outcomes/04_alignment/*.md)       PHASE="SYNTHESIZE";   TYPE="alignment";          TPL="alignment.md" ;;
    */outcomes/05_broadcast/*.md)       PHASE="BROADCAST";    TYPE="broadcast";          TPL="broadcast_post.md" ;;
    */goals/research_questions.md)      PHASE="QUESTION";     TYPE="research_questions"; TPL="research_questions.md" ;;
    */goals/audits/*.md)                PHASE="AUDIT";        TYPE="audit";              TPL="daily_audit.md" ;;
    *) exit 0 ;;
esac

TARGET=$(basename "$FILE_PATH")
REASON_FILE=$(mktemp "${TMPDIR:-/tmp}/sensai_gate.XXXXXX")
trap 'rm -f "$REASON_FILE"' EXIT

if "$SCRIPT_DIR/gate.sh" "$FILE_PATH" "$TYPE" 2>"$REASON_FILE"; then
    # F12: a passing Edit of an existing artifact logs EDIT, not SUCCESS, so revisions
    # don't inflate the SUCCESS count the audit/historian funnel reads.
    GATE_STATUS="SUCCESS"
    [ "$TOOL_NAME" = "Edit" ] && GATE_STATUS="EDIT"
    if ! "$SCRIPT_DIR/append_log.sh" "$PHASE" "$TARGET" "$GATE_STATUS" "$ENGAGEMENT" >/dev/null; then
        echo "gate hook: artifact $TARGET passed the gate but the ledger append FAILED — fix engagements/$ENGAGEMENT/telemetry/ and log this Work Block manually via append_log.sh." >&2
        exit 2
    fi
    # INDEX-drift reminder (non-blocking): a gated write is one half of a Work Block; the
    # skill's INDEX.md update is the other half. If the engagement's INDEX.md hasn't been
    # touched in the last 5 minutes, this artifact is likely invisible to downstream agents.
    ENG_INDEX="$ENG_ROOT/$ENGAGEMENT/INDEX.md"
    if [ -f "$ENG_INDEX" ]; then
        INDEX_AGE=$(( $(date +%s) - $(stat -f %m "$ENG_INDEX" 2>/dev/null || stat -c %Y "$ENG_INDEX" 2>/dev/null || echo 0) ))
        if [ "$INDEX_AGE" -gt 300 ]; then
            echo "Reminder: $TARGET was gated ${GATE_STATUS} but $ENG_INDEX hasn't been updated in ${INDEX_AGE}s. Update it as part of this Work Block — an artifact not reachable from INDEX.md is invisible to downstream agents." >&2
        fi
    fi
    exit 0
else
    REASON=$(cat "$REASON_FILE")
    reject_file
    "$SCRIPT_DIR/append_log.sh" "$PHASE" "$TARGET" "GATED" "$ENGAGEMENT" >/dev/null 2>&1 || true
    echo "Gate failed for $TARGET (quarantined at $REJECTED_AS). Reason: $REASON. Follow the schema in operations/templates/$TPL and rewrite. If this rejection looks wrong twice in a row, stop and inspect the template vs the output yourself." >&2
    exit 2
fi
