#!/usr/bin/env bats
# Unit tests for .claude/scripts/append_log.sh — the Work Block ledger writer.

load test_helper

setup() { setup_sandbox; }
teardown() { teardown_sandbox; }

@test "append_log.sh: first call mints WB-001 and appends the line" {
    run "$SCRIPTS/append_log.sh" CONSUME "node--a.md" SUCCESS "$ENG"
    [ "$status" -eq 0 ]
    [[ "$output" == "WB-001" ]]
    run tail -1 "$ENG_DIR/telemetry/execution.log"
    [[ "$output" == *"CONSUME | WB-001 | node--a.md | SUCCESS | -" ]]
}

@test "append_log.sh: second call increments to WB-002" {
    "$SCRIPTS/append_log.sh" CONSUME "node--a.md" SUCCESS "$ENG" >/dev/null
    run "$SCRIPTS/append_log.sh" ANALYZE "theory--b.md" SUCCESS "$ENG"
    [ "$status" -eq 0 ]
    [[ "$output" == "WB-002" ]]
}

@test "append_log.sh: uses the active-engagement pointer when no engagement arg given" {
    run "$SCRIPTS/append_log.sh" CONSUME "node--a.md" SUCCESS
    [ "$status" -eq 0 ]
    [[ "$output" == "WB-001" ]]
    run tail -1 "$ENG_DIR/telemetry/execution.log"
    [[ "$output" == *"node--a.md"* ]]
}

@test "append_log.sh: fails without a pointer and without an explicit engagement" {
    rm -f "$CLAUDE_PROJECT_DIR/operations/.active_engagement"
    run "$SCRIPTS/append_log.sh" CONSUME "node--a.md" SUCCESS
    [ "$status" -eq 1 ]
    [[ "$output" == *"no active engagement"* ]]
}

@test "append_log.sh: creates the log file with header if missing" {
    rm -f "$ENG_DIR/telemetry/execution.log"
    "$SCRIPTS/append_log.sh" CONSUME "node--a.md" SUCCESS "$ENG" >/dev/null
    run head -1 "$ENG_DIR/telemetry/execution.log"
    [[ "$output" == "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS | COST" ]]
}

@test "append_log.sh: cost column defaults to '-' and records an explicit value when given" {
    "$SCRIPTS/append_log.sh" CONSUME "node--a.md" SUCCESS "$ENG" >/dev/null
    run tail -1 "$ENG_DIR/telemetry/execution.log"
    [[ "$output" == *"| SUCCESS | -" ]]
    "$SCRIPTS/append_log.sh" EVALUATE "model--b.md" SUCCESS "$ENG" "0.42" >/dev/null
    run tail -1 "$ENG_DIR/telemetry/execution.log"
    [[ "$output" == *"| SUCCESS | 0.42" ]]
}

@test "append_log.sh: EDIT status is recorded verbatim (F12 revision marker)" {
    run "$SCRIPTS/append_log.sh" ANALYZE "theory--b.md" EDIT "$ENG"
    [ "$status" -eq 0 ]
    run tail -1 "$ENG_DIR/telemetry/execution.log"
    [[ "$output" == *"ANALYZE | WB-001 | theory--b.md | EDIT | -" ]]
}

@test "append_log.sh: WB-ID lock is released (no .wb.lock left behind)" {
    "$SCRIPTS/append_log.sh" CONSUME "node--a.md" SUCCESS "$ENG" >/dev/null
    [ ! -e "$ENG_DIR/telemetry/.wb.lock" ]
}

@test "append_log.sh: concurrent writers mint distinct WB-IDs (F8 lock)" {
    "$SCRIPTS/append_log.sh" CONSUME "node--1.md" SUCCESS "$ENG" >/dev/null &
    "$SCRIPTS/append_log.sh" CONSUME "node--2.md" SUCCESS "$ENG" >/dev/null &
    "$SCRIPTS/append_log.sh" CONSUME "node--3.md" SUCCESS "$ENG" >/dev/null &
    wait
    # Three appends over the header line → 4 lines, and the three minted WB-IDs are unique.
    run bash -c "grep -c '^[0-9]' '$ENG_DIR/telemetry/execution.log'"
    [ "$output" -eq 3 ]
    run bash -c "cut -d'|' -f3 '$ENG_DIR/telemetry/execution.log' | grep WB | sort -u | wc -l | tr -d ' '"
    [ "$output" -eq 3 ]
}

@test "append_log.sh: commits the Work Block into the engagement's own repo" {
    BEFORE=$(git -C "$ENG_DIR" log --oneline | wc -l | tr -d ' ')
    "$SCRIPTS/append_log.sh" CONSUME "node--a.md" SUCCESS "$ENG" >/dev/null
    AFTER=$(git -C "$ENG_DIR" log --oneline | wc -l | tr -d ' ')
    [ "$AFTER" -eq "$((BEFORE + 1))" ]
    run git -C "$ENG_DIR" log -1 --format=%s
    [[ "$output" == "[CONSUME] WB-001: node--a.md (SUCCESS)" ]]
}

@test "append_log.sh: GATED status is also committed (the ledger itself is the audit trail)" {
    "$SCRIPTS/append_log.sh" CONSUME "node--bad.md" GATED "$ENG" >/dev/null
    run git -C "$ENG_DIR" log -1 --format=%s
    [[ "$output" == "[CONSUME] WB-001: node--bad.md (GATED)" ]]
}

@test "append_log.sh: warns but still succeeds when the engagement has no git repo yet" {
    NOGIT_ENG="nogit_eng"
    NOGIT_DIR="$CLAUDE_PROJECT_DIR/engagements/$NOGIT_ENG"
    mkdir -p "$NOGIT_DIR/telemetry"
    run "$SCRIPTS/append_log.sh" CONSUME "node--a.md" SUCCESS "$NOGIT_ENG"
    [ "$status" -eq 0 ]
    [[ "$output" == *"WB-001"* ]]
    [[ "$output" == *"no git repo yet"* ]]
}
