# Sensai Mission Control Pipeline Example

This guide walks through a complete end-to-end example of the Sensai Mission Control research pipeline, from initialization through final synthesis and broadcast.

## Overview

The pipeline consists of 13 phases that transform raw research materials into verified strategic deliverables:
- **Input phases**: Question → Extract → Consume → Index
- **Analysis phases**: Analyze → Resolve Conflicts
- **Evaluation phases**: Evaluate → Stress-Test → Verify
- **Output phases**: Synthesize → Broadcast
- **Monitoring phases**: Longitudinal → Audit

---

## Phase 0: Initialize a Test Engagement

### 1. Create a new engagement called "example-research"

```bash
cd /Users/nullzero/sensai-org/sensai-finder
/bootstrap
```

**Expected output:**
```
✓ engagements/example-research/ created
✓ Subdirectories scaffolded: goals/ research_body/ outcomes/ telemetry/
✓ INDEX.md initialized
✓ .active_engagement set to: example-research
```

### 2. Verify engagement structure

```bash
tree engagements/example-research -L 2
```

**Expected structure:**
```
engagements/example-research/
├── .git/                          # Separate git repo
├── .gitignore
├── INDEX.md                       # Engagement wiki home
├── goals/
│   ├── primary_directive.md
│   ├── active_milestones.md
│   └── research_questions.md
├── research_body/
│   ├── 00_inbox/                 # Raw uploads
│   ├── 01_raw/                   # Processed raw files
│   ├── 02_nodes/                 # Extracted concepts
│   ├── 03_archive/               # Completed nodes
│   ├── 04_quarantine/            # Conflicts needing resolution
│   └── corpus_map.md
├── outcomes/
│   ├── 01_theories/
│   ├── 02_economic_models/
│   ├── 03_verification/
│   ├── 04_alignment/
│   ├── 05_broadcast/
│   └── longitudinal/
└── telemetry/
    └── execution.log             # Work block ledger
```

---

## Phase 1: QUESTION - Calibrate Research Direction

### 1. Define primary directive

**Edit:** `engagements/example-research/goals/primary_directive.md`

```markdown
---
type: directive
status: active
author: claude
created: 2026-07-06
---

# Primary Directive

## Problem Statement
How can research teams accelerate discovery velocity while maintaining rigor and verification?

## Success Metric
A concrete pipeline architecture that reduces discovery-to-insight time by 60% without sacrificing validity.

## Scope
- Research methodology optimization
- Tooling requirements
- Team coordination patterns
- Verification gates
```

### 2. Set active milestones

**Edit:** `engagements/example-research/goals/active_milestones.md`

```markdown
---
type: milestones
status: active
---

# Active Milestones

1. [ ] Calibrate core questions (Phase: QUESTION)
2. [ ] Extract 10+ research concepts (Phase: EXTRACT)
3. [ ] Consume into structured nodes (Phase: CONSUME)
4. [ ] Build semantic index (Phase: INDEX)
5. [ ] Synthesize 2 theories (Phase: ANALYZE)
6. [ ] Develop 2 economic models (Phase: EVALUATE)
7. [ ] Verify all models (Phase: VERIFY)
8. [ ] Generate strategic alignment doc (Phase: SYNTHESIZE)
9. [ ] Broadcast findings (Phase: BROADCAST)
```

### 3. Define research questions

**Edit:** `engagements/example-research/goals/research_questions.md`

```markdown
---
type: research_questions
status: active
---

# Research Questions

## RQ-001: Methodology
- What discovery patterns yield highest-confidence insights?
- Which verification gates prevent false positives most effectively?

## RQ-002: Architecture  
- What tool integration points minimize friction?
- How should teams coordinate across phases?

## RQ-003: Economics
- What is the ROI of structured discovery vs. ad-hoc exploration?
- Where do teams recoup velocity losses from rigor?
```

### 4. Run question calibration

```bash
/question
```

**Expected output:**
```
[QUESTION] WB-001: example-research (SUCCESS)
- Logged to: engagements/example-research/telemetry/execution.log
- Ledger entry: 2026-07-06T10:30:00Z | QUESTION | WB-001 | example-research | SUCCESS
```

---

## Phase 2: EXTRACT - Parse Raw Research Materials

### 1. Add sample research materials

Create `engagements/example-research/research_body/00_inbox/sample_paper.md`:

```markdown
# How to Scale Research Teams

## Abstract
Scaling research teams without sacrificing output quality is a persistent challenge. We present a pipeline-based approach to coordinate work across researchers at different expertise levels.

## Key Findings

### Finding 1: Structured Extraction
By enforcing structured node extraction early, teams capture 94% more context than free-form note-taking.

### Finding 2: Verification Gates
Three-layer verification (peer review, automated check, domain expert sign-off) catches 99% of errors while adding only 15% to cycle time.

### Finding 3: Economic Model
Teams using structured pipeline see 3x faster time-to-insight despite upfront process overhead.

## Implications
- Process structure beats individual talent for scaling
- Verification can be parallelized to minimize overhead
- Discovery velocity increases with pipeline maturity
```

### 2. Run extraction

```bash
/extract engagements/example-research/research_body/00_inbox/sample_paper.md
```

**Expected output:**
```
✓ Extracted 3 concepts from sample_paper.md
- node--structured-extraction.md
- node--verification-gates.md  
- node--economic-model.md

[EXTRACT] WB-002: example-research (SUCCESS)
```

### 3. Verify node creation

```bash
ls -la engagements/example-research/research_body/02_nodes/
```

**Expected output:**
```
node--structured-extraction.md
node--verification-gates.md
node--economic-model.md
```

---

## Phase 3: CONSUME - Ingest into Structured Nodes

### 1. Review extracted nodes

```bash
cat engagements/example-research/research_body/02_nodes/node--structured-extraction.md
```

**Expected format:**
```markdown
---
name: structured-extraction
type: node
status: active
created: 2026-07-06
source: sample_paper.md
---

# Structured Extraction

## Claim
By enforcing structured node extraction early, teams capture 94% more context than free-form note-taking.

## Evidence
- Pilot study: 12 researchers, 3-month trial
- Metric: Context retention rate, measured via downstream node consumption

## Implications
- Process > Individual talent
- Extraction speed stabilizes with practice
```

### 2. Run consumption phase

```bash
/consume
```

**Expected output:**
```
[CONSUME] WB-003: example-research (SUCCESS)
- Processed 3 nodes
- Status: All nodes ready for indexing
```

---

## Phase 4: INDEX - Build Semantic Corpus Index

### 1. Run indexing

```bash
/index
```

**Expected output:**
```
[INDEX] WB-004: example-research (SUCCESS)
- Built corpus_map.md with 3 nodes
- Cross-references: 7 edges
- Ready for analysis
```

### 2. Review corpus map

```bash
cat engagements/example-research/research_body/corpus_map.md
```

**Expected format:**
```markdown
# Corpus Map

## Index

### Nodes (3 total)
- node--structured-extraction: Process improvement
- node--verification-gates: Quality assurance  
- node--economic-model: Business impact

### Cross-References
- structured-extraction → verification-gates (validation dependency)
- verification-gates → economic-model (cost-benefit)
- economic-model → structured-extraction (ROI driver)

## Relationships
- **Input sources**: sample_paper.md
- **Ready for**: ANALYZE phase
```

---

## Phase 5: ANALYZE - Synthesize Theories

### 1. Run analysis

```bash
/analyze
```

**Expected output:**
```
[ANALYZE] WB-005: example-research (SUCCESS)
- Generated 1 theory
- theory--pipeline-architecture.md
```

### 2. Review generated theory

```bash
cat engagements/example-research/outcomes/01_theories/theory--pipeline-architecture.md
```

**Expected format:**
```markdown
---
name: pipeline-architecture
type: theory
status: active
created: 2026-07-06
phase: ANALYZE
---

# Theory: Pipeline-Based Research Architecture

## Thesis
Structuring research as a 13-phase pipeline with discrete gates accelerates discovery velocity by enforcing rigor, parallelization, and feedback loops.

## Supporting Evidence
- RQ-001: Extraction structure captures 94% more context
- RQ-002: Verification gates prevent false positives (99% catch rate)
- RQ-003: Pipeline ROI positive after 6 weeks

## Predictions
1. Teams adopting pipeline see 3x faster insights within 3 months
2. Error rates drop 50% despite higher throughput
3. Team coordination overhead reduces by 40% after pipeline stabilization

## Falsifiability
- Metric 1: Time-to-insight < 21 days (pipeline vs. 60 days baseline)
- Metric 2: Error rate < 1% (pipeline vs. 2% baseline)
- Metric 3: Coordination time < 10% of research time
```

---

## Phase 6: EVALUATE - Develop Economic Models

### 1. Run evaluation

```bash
/evaluate
```

**Expected output:**
```
[EVALUATE] WB-006: example-research (SUCCESS)
- Generated 1 economic model
- model--pipeline-roi.md
```

### 2. Review economic model

```bash
cat engagements/example-research/outcomes/02_economic_models/model--pipeline-roi.md
```

**Expected format:**
```markdown
---
name: pipeline-roi
type: economic_model
status: active
created: 2026-07-06
theory: pipeline-architecture
---

# Economic Model: Pipeline ROI

## Monetization Vector
### Revenue Impact
- Faster insights → Faster decision-making → Market advantage
- Value per decision: $250K (average strategic decision value)
- Insights-per-month baseline: 2 → Pipeline: 6 (+200%)
- Annual revenue uplift: $1.2M

### Cost Impact
- Pipeline infrastructure: $50K one-time, $10K/month ops
- Training overhead: $30K (amortizes to $5K/month year 1)
- Net cost: $15K/month

## Return Calculation
- Breakeven: Month 2 (payback period: 60 days)
- Year 1 ROI: 480%
- Year 2+ ROI: 1,200% (recurring benefit, amortized cost)

## Unit Economics
- Cost per insight (pipeline): $2,500 ($15K / 6 insights)
- Cost per insight (baseline): $12,500 ($25K / 2 insights)
- Efficiency gain: 5x

## Risks & Mitigation
- **Risk**: Team adoption friction → **Mitigation**: 2-week ramp period
- **Risk**: Hidden coordination costs → **Mitigation**: Telemetry tracking
- **Risk**: Quality regressions → **Mitigation**: Verification gates
```

---

## Phase 7: STRESS-TEST - Verify Model Robustness

### 1. Run stress testing

```bash
/stress-test
```

**Expected output:**
```
[STRESS-TEST] WB-007: example-research (EDIT)
- Found 1 assumption that needs interrogation
- Flagged for /resolve-conflict
```

### 2. Resolve conflicts (if any)

```bash
/resolve-conflict
```

**Expected output:**
```
[QUARANTINE] WB-008: example-research (SUCCESS)
- Conflict interrogation complete
- Ready for verification
```

---

## Phase 8: VERIFY - Independent Model Validation

### 1. Run verification

```bash
/verify
```

**Expected output:**
```
[VERIFY] WB-009: example-research (SUCCESS)
- Verdict: APPROVED
- All models passed verification gates
- Ready for synthesis
```

### 2. Review verification report

```bash
cat engagements/example-research/outcomes/03_verification/verdict--pipeline-roi.md
```

**Expected format:**
```markdown
---
name: verdict-pipeline-roi
type: verification
status: complete
verdict: APPROVED
phase: VERIFY
---

# Verification Verdict: Pipeline ROI Model

## Assessment Criteria
- [x] Falsifiability: Metrics are measurable and concrete
- [x] Evidence quality: Sources are peer-reviewed and replicated
- [x] Logic consistency: No circular reasoning detected
- [x] Risk mitigation: Contingencies are realistic and testable

## Confidence Level
- Overall: 92% confidence
- Revenue projections: 88% (market timing uncertainty)
- Cost estimates: 95% (based on operational data)
- Adoption curve: 85% (team-dependent variable)

## Sign-off
Verified by: Independent Verifier Agent
Date: 2026-07-06
Status: APPROVED ✓
```

---

## Phase 9: SYNTHESIZE - Generate Strategic Alignment

### 1. Run synthesis

```bash
/synthesize
```

**Expected output:**
```
[SYNTHESIZE] WB-010: example-research (SUCCESS)
- Generated strategic alignment document
- alignment--pipeline-architecture.md
```

### 2. Review alignment document

```bash
cat engagements/example-research/outcomes/04_alignment/alignment--pipeline-architecture.md
```

**Expected format:**
```markdown
---
name: alignment-pipeline-architecture
type: strategic_alignment
status: complete
phase: SYNTHESIZE
---

# Strategic Alignment: Research Pipeline Implementation

## Executive Summary
Implementing a 13-phase research pipeline increases strategic decision velocity by 3x while improving accuracy by 50%, delivering $1.2M annual value with 60-day payback.

## Problem
- Current state: Ad-hoc research, 60-day insight cycles, 2% error rate
- Target state: Structured pipeline, 20-day insight cycles, 0.5% error rate
- Gap: Methodology rigor + coordination overhead

## Recommended Solution: Sensai Mission Control Pipeline
- 13-phase architecture with discrete gates
- Parallel processing where possible
- Continuous verification and conflict resolution
- Measurable outcomes at each phase

## Implementation Roadmap

### Phase 1 (Weeks 1-2): Team Training
- Introduce pipeline concepts
- Set up infrastructure
- Cost: $30K

### Phase 2 (Weeks 3-6): Pilot (3 research projects)
- Run pipeline on representative projects
- Capture telemetry
- Cost: $50K

### Phase 3 (Weeks 7+): Scale (full team adoption)
- Roll out to all research streams
- Optimize based on pilot learnings
- Cost: $15K/month

## Success Metrics
- Time-to-insight: 60 days → 20 days (-67%)
- Error rate: 2% → 0.5% (-75%)
- Decision velocity: 2/month → 6/month (+200%)
- ROI: 480% year 1, 1,200% year 2+

## Risks & Contingencies
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Team adoption friction | Medium | High | 2-week ramp + internal champions |
| Infrastructure costs exceed forecast | Low | Medium | Phased rollout, capacity planning |
| Quality regressions | Low | High | Multi-layer verification gates |

## Decision: APPROVED FOR IMPLEMENTATION
```

---

## Phase 10: BROADCAST - Generate External Deliverables

### 1. Run broadcast

```bash
/broadcast
```

**Expected output:**
```
[BROADCAST] WB-011: example-research (SUCCESS)
- Generated broadcast artifacts
- blog_post--pipeline-velocity.md
- executive_brief--roi-analysis.md
- technical_spec--architecture.md
```

### 2. Review broadcast outputs

**Blog post:**
```bash
cat engagements/example-research/outcomes/05_broadcast/blog_post--pipeline-velocity.md
```

**Executive brief:**
```bash
cat engagements/example-research/outcomes/05_broadcast/executive_brief--roi-analysis.md
```

---

## Phase 11: LONGITUDINAL - Cross-Phase Monitoring

### 1. Run longitudinal analysis

```bash
/longitudinal
```

**Expected output:**
```
[LONGITUDINAL] WB-012: example-research (SUCCESS)
- Analyzed question → theory → model → verification pipeline
- Identified 2 high-confidence predictions
- Flagged 1 assumption requiring ongoing monitoring
```

### 2. Review longitudinal report

```bash
cat engagements/example-research/outcomes/longitudinal/report--trajectory.md
```

**Expected format:**
```markdown
---
name: trajectory-pipeline-roi
type: longitudinal_analysis
phase: LONGITUDINAL
---

# Longitudinal Analysis: Pipeline ROI Trajectory

## Question-to-Theory Path
- RQ-001 (methodology) → Extraction node → Theory (structure improves outcomes)
- Confidence: 95%

- RQ-003 (economics) → Economic model node → Model (ROI positive)
- Confidence: 88%

## Theory-to-Model Conversion
- 1 theory generated (pipeline-architecture)
- 1 economic model derived (pipeline-roi)
- Conversion quality: HIGH

## Predictions Requiring Monitoring
1. **Adoption curve**: Will actual adoption match 6-week ramp?
   - Monitor: Team feedback sessions, pilot metrics
   - Review interval: Monthly

2. **Error rate reduction**: Will quality improve by 75%?
   - Monitor: Audit trails, post-decision validation
   - Review interval: Quarterly

## Trajectory Assessment
- Research direction: STABLE (no major conflicts)
- Confidence evolution: INCREASING (more evidence)
- Recommendation: PROCEED TO IMPLEMENTATION
```

---

## Phase 12: AUDIT - Systematic Process Review

### 1. Run audit

```bash
/daily-summary
```

**Expected output:**
```
[AUDIT] WB-013: example-research (SUCCESS)
- Audited all 12 work blocks
- 13 artifacts generated
- 0 critical issues, 0 drift detected
- Pipeline quality: EXCELLENT
```

### 2. Review audit report

```bash
cat engagements/example-research/telemetry/audit_report.md
```

---

## Viewing the Dashboard

### 1. Start the observability dashboard

```bash
cd app && bun run dev
```

Then open: **http://localhost:3000**

### 2. Dashboard features

**Terminal View** (`/`):
- Metric funnel: Nodes → Theories → Models → Verified → Aligned → Broadcast
- Active engagement status: example-research
- Live telemetry stream showing all work blocks

**Explorer View** (`/engagements`):
- Browse all engagements
- View stage progression sparkbars
- Drill into individual engagement structure

**Plugins View** (`/plugins`):
- Reference all 17 available skills
- Reference all 10 available agents  
- View invocation commands

---

## Complete Telemetry Log

```bash
cat engagements/example-research/telemetry/execution.log
```

**Expected format:**
```
2026-07-06T10:30:00Z | QUESTION    | WB-001 | example-research | SUCCESS
2026-07-06T11:15:00Z | EXTRACT     | WB-002 | example-research | SUCCESS
2026-07-06T12:00:00Z | CONSUME     | WB-003 | example-research | SUCCESS
2026-07-06T13:15:00Z | INDEX       | WB-004 | example-research | SUCCESS
2026-07-06T14:30:00Z | ANALYZE     | WB-005 | example-research | SUCCESS
2026-07-06T15:45:00Z | EVALUATE    | WB-006 | example-research | SUCCESS
2026-07-06T16:30:00Z | STRESS-TEST | WB-007 | example-research | EDIT
2026-07-06T17:00:00Z | QUARANTINE  | WB-008 | example-research | SUCCESS
2026-07-06T17:45:00Z | VERIFY      | WB-009 | example-research | SUCCESS
2026-07-06T18:30:00Z | SYNTHESIZE  | WB-010 | example-research | SUCCESS
2026-07-06T19:15:00Z | BROADCAST   | WB-011 | example-research | SUCCESS
2026-07-06T20:00:00Z | LONGITUDINAL| WB-012 | example-research | SUCCESS
2026-07-06T20:45:00Z | AUDIT       | WB-013 | example-research | SUCCESS
```

---

## Key Concepts

### Work Blocks
Each skill invocation creates one ledger line (one work block):
- **Format**: `TIMESTAMP | PHASE | WORK_BLOCK_ID | TARGET | STATUS`
- **Status values**: SUCCESS, EDIT (revision), GATED (template error), FAIL
- **Automatic**: The hook system logs on successful artifact creation

### Engagement Structure
- **Separate git repo**: Each engagement is a standalone repo with its own history
- **Gated directories**: outcomes/ subdirectories are template-validated
- **Wiki discipline**: All artifacts cross-reference via `[[wikilinks]]`
- **Telemetry**: execution.log is append-only, immutable

### Pipeline Phases (in order)
1. **QUESTION** — Calibrate research direction
2. **EXTRACT** — Parse raw materials into concepts
3. **CONSUME** — Ingest concepts into structured nodes
4. **INDEX** — Build semantic corpus index
5. **ANALYZE** — Synthesize theories from nodes
6. **QUARANTINE** — Resolve contradictions (HITL gate)
7. **EVALUATE** — Develop economic models
8. **STRESS-TEST** — Test model assumptions
9. **VERIFY** — Independent verification
10. **SYNTHESIZE** — Generate strategic alignment doc
11. **BROADCAST** — Create external deliverables
12. **LONGITUDINAL** — Cross-phase trajectory analysis
13. **AUDIT** — System health check

---

## Troubleshooting

### Engagement not appearing in dashboard
```bash
# Check active engagement pointer
cat operations/.active_engagement

# Set it explicitly
/switch example-research
```

### Skills not discoverable
```bash
# Visit Plugins page at http://localhost:3000/plugins
# All 17 skills + 10 agents should be listed with invocation commands
```

### Telemetry not updating
```bash
# Verify the engagement's execution.log exists
cat engagements/example-research/telemetry/execution.log

# Run a phase manually to generate a new work block
/question
```

---

## Next Steps

After completing this example:
1. Review the strategically aligned documentation in `outcomes/04_alignment/`
2. Study the economic model ROI calculations in `outcomes/02_economic_models/`
3. Examine the telemetry for phase-to-phase progression
4. Create your own engagement with real research materials
5. Iterate and refine based on the pipeline's feedback loops

---

**Status**: ✅ Complete pipeline example with 13 work blocks, ready for production use.
