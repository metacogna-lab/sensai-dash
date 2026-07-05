---
name: verify
description: Alias for /stress-test — the VERIFY phase. Use whenever the operator says "verify" instead of "stress-test"; both names are correct.
---

This is an alias. The phase name is VERIFY; the underlying skill is `stress-test` (named after
its method — adversarial stress-testing — rather than the phase). Read
`.claude/skills/stress-test/SKILL.md` in full and follow it exactly, with the same argument
(an artifact filename from `outcomes/01_theories/`, `outcomes/02_economic_models/`, or
`outcomes/04_alignment/`). Do not duplicate or reinterpret its instructions here — this file
exists only so `/verify` and `/stress-test` both work, matching the phase table in
`operations/README.md`.
