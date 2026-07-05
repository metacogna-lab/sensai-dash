<!--
Progressive Disclosure schema for EVALUATE-phase output.
Frontmatter fields are load-bearing: the PostToolUse gate hook parses `type` and `status` literally,
and requires a non-empty `## Monetization Vector` section.
-->
---
type: economic_model
status: ready
verdict: <viable | no-viable-vector>
source: <theory filename>
created: <ISO 8601 timestamp>
---

# <Economic model title>

> **TL;DR:** <one-sentence statement of the monetization vector, or of the evidence gap if
> verdict is no-viable-vector>

## Monetization Vector
<if verdict: viable — the concrete pricing model, IP boundary, product spec, or build steps, naming
the mechanism, not just the potential. If verdict: no-viable-vector — the specific evidence gap
that would need to close (this is a legitimate, honest answer, not a fallback)>

## Route Optimization
<the most resource-efficient, structurally sound path to realize the vector>

## Cross-References
<explicit references back to the source theory / originating raw titles>
