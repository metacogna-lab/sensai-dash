<!--
Progressive Disclosure schema for VERIFY-phase output (outcomes/verification/).
Frontmatter fields are load-bearing: the gate hook parses `type` and `status` literally, and
requires a non-empty `## Verdict` section.
-->
---
type: verification
status: ready
source: <artifact filename under test>
created: <ISO 8601 timestamp>
---

# Verification: <artifact name>

> **TL;DR:** <verdict + the single most important finding>

## Verdict
**PASS | PASS-WITH-NOTES | FAIL** — <one-line justification>

## Claim Audit
| Claim (abbreviated) | Classification | Evidence |
|---|---|---|
| <claim> | grounded / extrapolated / unsupported | [[node--<source>]] or "none" |

## Constraint Compliance
<per-constraint check against goals/research_questions.md `## Constraints`>

## Required Repairs (if FAIL)
<what the producing phase must fix — the verifier judges, it does not repair>
