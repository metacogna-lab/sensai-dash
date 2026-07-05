#!/usr/bin/env bats
# Unit tests for .claude/scripts/gate.sh — the frontmatter/schema envelope check.
# See operations/guides/01_EDITING.md for what these gates do and don't validate.

load test_helper

setup() {
    TMPFILE="$(mktemp)"
}
teardown() {
    rm -f "$TMPFILE"
}

@test "gate.sh: valid node passes" {
    write_valid_node "$TMPFILE"
    run "$SCRIPTS/gate.sh" "$TMPFILE" node
    [ "$status" -eq 0 ]
}

@test "gate.sh: missing status field fails" {
    cat > "$TMPFILE" << 'EOF'
---
type: node
created: 2026-07-05T00:00:00
---

# body
EOF
    run "$SCRIPTS/gate.sh" "$TMPFILE" node
    [ "$status" -eq 1 ]
    [[ "$output" == *"missing 'status:'"* ]]
}

@test "gate.sh: no frontmatter block fails" {
    printf '# just a heading\nno frontmatter here\n' > "$TMPFILE"
    run "$SCRIPTS/gate.sh" "$TMPFILE" node
    [ "$status" -eq 1 ]
    [[ "$output" == *"no frontmatter"* ]]
}

@test "gate.sh: wrong type value fails" {
    cat > "$TMPFILE" << 'EOF'
---
type: theory
status: ready
---

# body
EOF
    run "$SCRIPTS/gate.sh" "$TMPFILE" node
    [ "$status" -eq 1 ]
    [[ "$output" == *"missing 'type: node'"* ]]
}

@test "gate.sh: empty body after frontmatter fails" {
    cat > "$TMPFILE" << 'EOF'
---
type: node
status: ready
---
EOF
    run "$SCRIPTS/gate.sh" "$TMPFILE" node
    [ "$status" -eq 1 ]
    [[ "$output" == *"body is empty"* ]]
}

@test "gate.sh: file not found fails" {
    run "$SCRIPTS/gate.sh" "/nonexistent/path/xyz.md" node
    [ "$status" -eq 1 ]
    [[ "$output" == *"file not found"* ]]
}

@test "gate.sh: economic_model missing Monetization Vector fails" {
    cat > "$TMPFILE" << 'EOF'
---
type: economic_model
status: ready
verdict: viable
---

# body without the required section
EOF
    run "$SCRIPTS/gate.sh" "$TMPFILE" economic_model
    [ "$status" -eq 1 ]
    [[ "$output" == *"Monetization Vector"* ]]
}

@test "gate.sh: economic_model with Monetization Vector passes" {
    cat > "$TMPFILE" << 'EOF'
---
type: economic_model
status: ready
verdict: viable
---

## Monetization Vector
Flat SaaS subscription.
EOF
    run "$SCRIPTS/gate.sh" "$TMPFILE" economic_model
    [ "$status" -eq 0 ]
}

@test "gate.sh: corpus_map missing Baseline (As-Is) fails" {
    cat > "$TMPFILE" << 'EOF'
---
type: corpus_map
status: ready
---

## Entity Index
- foo
EOF
    run "$SCRIPTS/gate.sh" "$TMPFILE" corpus_map
    [ "$status" -eq 1 ]
    [[ "$output" == *"Baseline (As-Is)"* ]]
}

@test "gate.sh: verification missing Verdict fails" {
    cat > "$TMPFILE" << 'EOF'
---
type: verification
status: ready
---

## Claim Audit
n/a
EOF
    run "$SCRIPTS/gate.sh" "$TMPFILE" verification
    [ "$status" -eq 1 ]
    [[ "$output" == *"Verdict"* ]]
}

@test "gate.sh: alignment missing Execution Detail fails" {
    cat > "$TMPFILE" << 'EOF'
---
type: alignment
status: ready
---

## Outcome Answer
n/a
EOF
    run "$SCRIPTS/gate.sh" "$TMPFILE" alignment
    [ "$status" -eq 1 ]
    [[ "$output" == *"Execution Detail"* ]]
}
