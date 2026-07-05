#!/usr/bin/env bash
# Shared sandbox helpers for the Sensai Compilar hook-layer bats suite.
# Tests run against the REAL scripts in .claude/scripts/ (never copies), sandboxed
# via CLAUDE_PROJECT_DIR pointed at a throwaway temp tree — real enforcement code,
# synthetic data. See operations/guides/02_MAINTENANCE.md for the manual version of
# this same recipe.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS="$REPO_ROOT/.claude/scripts"
ENG="testeng"

setup_sandbox() {
    export CLAUDE_PROJECT_DIR
    CLAUDE_PROJECT_DIR="$(mktemp -d)"
    export ENG_DIR="$CLAUDE_PROJECT_DIR/operations/engagements/$ENG"
    mkdir -p "$ENG_DIR"/research_body/{02_nodes,04_quarantine} \
             "$ENG_DIR"/outcomes/{01_theories,02_economic_models,03_verification,04_alignment,05_broadcast} \
             "$ENG_DIR"/goals/audits \
             "$ENG_DIR"/telemetry
    echo "$ENG" > "$CLAUDE_PROJECT_DIR/operations/.active_engagement"
    echo "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS" > "$ENG_DIR/telemetry/execution.log"
    printf '# engagement index\n' > "$ENG_DIR/INDEX.md"
}

teardown_sandbox() {
    [ -n "${CLAUDE_PROJECT_DIR:-}" ] && [ -d "$CLAUDE_PROJECT_DIR" ] && rm -rf "$CLAUDE_PROJECT_DIR"
}

# Build a PostToolUse-shaped JSON payload naming the given absolute file path.
hook_payload() {
    python3 -c "import json,sys; print(json.dumps({'tool_name':'Write','tool_input':{'file_path': sys.argv[1]}}))" "$1"
}

write_valid_node() {
    cat > "$1" << 'EOF'
---
type: node
status: ready
source: test.txt
created: 2026-07-05T00:00:00
---

# Test Node

> TL;DR: test fixture.
EOF
}
