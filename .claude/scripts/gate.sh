#!/bin/bash
# Sensai Compilar: frontmatter gate.
# Usage: gate.sh <file> <expected_type>
# Exit 0 if the file has valid frontmatter (type + status) and non-empty body, 1 otherwise.
# Prints the failure reason to stderr.

set -euo pipefail

FILE="$1"
EXPECTED_TYPE="$2"

if [ ! -f "$FILE" ]; then
    echo "gate: file not found: $FILE" >&2
    exit 1
fi

FRONTMATTER=$(awk '/^---$/{c++; if (c==2) exit} c==1 && !/^---$/' "$FILE")

if [ -z "$FRONTMATTER" ]; then
    echo "gate: no frontmatter block found in $FILE" >&2
    exit 1
fi

if ! echo "$FRONTMATTER" | grep -qE "^type: *${EXPECTED_TYPE} *\$"; then
    echo "gate: frontmatter missing 'type: ${EXPECTED_TYPE}' in $FILE" >&2
    exit 1
fi

if ! echo "$FRONTMATTER" | grep -qE "^status: *[a-zA-Z_-]+ *\$"; then
    echo "gate: frontmatter missing 'status:' in $FILE" >&2
    exit 1
fi

BODY=$(awk '/^---$/{c++; next} c>=2' "$FILE" | tr -d '[:space:]')
if [ -z "$BODY" ]; then
    echo "gate: body is empty after frontmatter in $FILE" >&2
    exit 1
fi

# Type-specific required sections: an artifact without its load-bearing section is junk.
# $1 = grep pattern, $2 = human-readable section name for the error message.
require_section() {
    if ! grep -qE "^## $1" "$FILE"; then
        echo "gate: ${EXPECTED_TYPE} missing '## $2' section in $FILE" >&2
        exit 1
    fi
}

case "$EXPECTED_TYPE" in
    economic_model) require_section "Monetization Vector" "Monetization Vector" ;;
    corpus_map)     require_section "Baseline \(As-Is\)" "Baseline (As-Is)" ;;
    verification)   require_section "Verdict" "Verdict" ;;
    alignment)      require_section "Execution Detail" "Execution Detail" ;;
esac

exit 0
