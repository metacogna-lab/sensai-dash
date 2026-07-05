#!/usr/bin/env bats
# Integration tests for .claude/scripts/post_write_gate.sh — the PostToolUse hook.
# Exercises real hook code against synthetic PostToolUse payloads in a sandboxed
# CLAUDE_PROJECT_DIR. See tests/test_helper.bash for the sandbox recipe.

load test_helper

setup() { setup_sandbox; }
teardown() { teardown_sandbox; }

@test "post_write_gate: valid node write passes, logs SUCCESS, file remains" {
    TARGET="$ENG_DIR/research_body/02_nodes/node--a.md"
    write_valid_node "$TARGET"
    PAYLOAD=$(hook_payload "$TARGET")
    run bash -c "echo '$PAYLOAD' | '$SCRIPTS/post_write_gate.sh'"
    [ "$status" -eq 0 ]
    [ -f "$TARGET" ]
    run tail -1 "$ENG_DIR/telemetry/execution.log"
    [[ "$output" == *"CONSUME | WB-001 | node--a.md | SUCCESS" ]]
}

@test "post_write_gate: invalid node write is blocked and quarantined, logs GATED" {
    TARGET="$ENG_DIR/research_body/02_nodes/node--bad.md"
    cat > "$TARGET" << 'EOF'  # missing status
---
type: node
created: 2026-07-05T00:00:00
---
EOF
    PAYLOAD=$(hook_payload "$TARGET")
    run bash -c "echo '$PAYLOAD' | '$SCRIPTS/post_write_gate.sh'"
    [ "$status" -eq 2 ]
    [ ! -f "$TARGET" ]
    ls "$CLAUDE_PROJECT_DIR/operations/.rejected/" | grep -q "node--bad.md"
    run tail -1 "$ENG_DIR/telemetry/execution.log"
    [[ "$output" == *"CONSUME | WB-001 | node--bad.md | GATED" ]]
}

@test "post_write_gate: write outside the engagements root is a no-op" {
    OUTSIDE="$CLAUDE_PROJECT_DIR/some_other_file.md"
    echo "not gated" > "$OUTSIDE"
    PAYLOAD=$(hook_payload "$OUTSIDE")
    LOG_BEFORE=$(cat "$ENG_DIR/telemetry/execution.log")
    run bash -c "echo '$PAYLOAD' | '$SCRIPTS/post_write_gate.sh'"
    [ "$status" -eq 0 ]
    [ -f "$OUTSIDE" ]
    LOG_AFTER=$(cat "$ENG_DIR/telemetry/execution.log")
    [ "$LOG_BEFORE" = "$LOG_AFTER" ]
}

@test "post_write_gate: write inside the engagement root but unmatched path is a no-op" {
    TARGET="$ENG_DIR/goals/primary_directive.md"
    echo "not a gated artifact type" > "$TARGET"
    PAYLOAD=$(hook_payload "$TARGET")
    LOG_BEFORE=$(cat "$ENG_DIR/telemetry/execution.log")
    run bash -c "echo '$PAYLOAD' | '$SCRIPTS/post_write_gate.sh'"
    [ "$status" -eq 0 ]
    [ -f "$TARGET" ]
    LOG_AFTER=$(cat "$ENG_DIR/telemetry/execution.log")
    [ "$LOG_BEFORE" = "$LOG_AFTER" ]
}

@test "post_write_gate: context bleed into a non-active engagement is quarantined, not deleted" {
    # This is the mechanism-level regression guard for eng finding F4 (init-engagement wrote
    # seed files before switching the pointer, so the bleed check quarantined its own seeds).
    # bats can't drive the Skill/Agent tool to re-run /init-engagement directly; this test
    # instead proves the underlying bleed mechanism behaves correctly, which is what F4's fix
    # (switch-before-seed ordering in init-engagement/SKILL.md) depends on staying true.
    OTHER_ENG_DIR="$CLAUDE_PROJECT_DIR/operations/engagements/other_eng/research_body/02_nodes"
    mkdir -p "$OTHER_ENG_DIR"
    TARGET="$OTHER_ENG_DIR/node--bleed.md"
    write_valid_node "$TARGET"
    PAYLOAD=$(hook_payload "$TARGET")
    run bash -c "echo '$PAYLOAD' | '$SCRIPTS/post_write_gate.sh'"
    [ "$status" -eq 2 ]
    [[ "$output" == *"Context bleed blocked"* ]]
    [ ! -f "$TARGET" ]
    ls "$CLAUDE_PROJECT_DIR/operations/.rejected/" | grep -q "node--bleed.md"
}

@test "post_write_gate: missing active-engagement pointer quarantines the write" {
    rm -f "$CLAUDE_PROJECT_DIR/operations/.active_engagement"
    TARGET="$ENG_DIR/research_body/02_nodes/node--nopointer.md"
    write_valid_node "$TARGET"
    PAYLOAD=$(hook_payload "$TARGET")
    run bash -c "echo '$PAYLOAD' | '$SCRIPTS/post_write_gate.sh'"
    [ "$status" -eq 2 ]
    [[ "$output" == *"no active engagement pointer"* ]]
    [ ! -f "$TARGET" ]
}

@test "post_write_gate: unparseable JSON payload fails CLOSED (blocks), not open" {
    TARGET="$ENG_DIR/research_body/02_nodes/node--parseerr.md"
    write_valid_node "$TARGET"
    run bash -c "echo 'not { valid json at all' | '$SCRIPTS/post_write_gate.sh'"
    [ "$status" -eq 2 ]
    [[ "$output" == *"unparseable"* ]]
    # The write is untouched by the hook either way (it can't map the payload to a
    # path) — what matters is the hook blocks the TOOL CALL rather than silently
    # allowing it through, which is what a bare `exit 0` would have done pre-fix.
}

@test "post_write_gate: valid JSON with no file_path key fails CLOSED" {
    run bash -c "echo '{\"tool_name\":\"Write\",\"tool_input\":{}}' | '$SCRIPTS/post_write_gate.sh'"
    [ "$status" -eq 2 ]
    [[ "$output" == *"blocking"* ]]
}

@test "post_write_gate: missing python3 fails CLOSED" {
    TARGET="$ENG_DIR/research_body/02_nodes/node--nopython.md"
    write_valid_node "$TARGET"
    PAYLOAD=$(hook_payload "$TARGET")
    # /bin has bash but not python3 on macOS — restricts what the SCRIPT can find
    # without breaking env/run's own ability to exec bash in the first place.
    run env -i PATH="/bin" CLAUDE_PROJECT_DIR="$CLAUDE_PROJECT_DIR" \
        bash -c "echo '$PAYLOAD' | '$SCRIPTS/post_write_gate.sh'"
    [ "$status" -eq 2 ]
    [[ "$output" == *"python3 not found"* ]]
}

@test "post_write_gate: ledger append failure is reported, not silently swallowed" {
    TARGET="$ENG_DIR/research_body/02_nodes/node--ledgerfail.md"
    write_valid_node "$TARGET"
    chmod 000 "$ENG_DIR/telemetry/execution.log"
    PAYLOAD=$(hook_payload "$TARGET")
    run bash -c "echo '$PAYLOAD' | '$SCRIPTS/post_write_gate.sh'"
    chmod 644 "$ENG_DIR/telemetry/execution.log"
    [ "$status" -eq 2 ]
    [[ "$output" == *"ledger append FAILED"* ]]
}
