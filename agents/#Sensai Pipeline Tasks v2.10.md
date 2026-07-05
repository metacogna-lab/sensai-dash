<!-- /autoplan restore point: /Users/nullzero/.sensai/projects/sensai-finder/main-autoplan-restore-20260705-115645.md -->
# #Sensai Pipeline Tasks v2.10

Gap analysis of the implemented harness (`.claude/` + `operations/`) against the requirements in
`Fable Interaction - Sensai Studio #Sensai.md`, plus operator-added requirements (PDF ingestion,
longitudinal analysis, explicit I/O contracts). Each gap becomes a Work Block below. This file is
the task ledger for the v2.10 build-out; check items off as they land.

## Requirement Coverage Matrix (Fable Interaction phases → harness)

| Fable Interaction requirement | Status in v2.00 harness | v2.10 resolution |
|---|---|---|
| I.A Corpus Parameterization — systematic intake of full corpus | PARTIAL — `/consume` is per-text-file only; no intake path for PDFs/binary sources | **EXTRACT phase**: `research_body/00_inbox/` for binary sources; `/extract` converts PDF → text in `01_raw/` via `pdftotext` |
| I.B Semantic Indexing — high-dimensional contextual map across the whole suite | MISSING — nodes are per-file; nothing maps the corpus as one system | **INDEX phase**: `indexer` agent (sonnet) builds `research_body/corpus_map.md` from all nodes: entities, jurisdictions/boundaries, structural hierarchies |
| I.C Baseline Establishment — "as-is" state from documentation only | MISSING | Baseline is a mandatory `## Baseline (As-Is)` section of `corpus_map.md`; analyst reads it |
| II.A Objective Deconstruction | COVERED — `/question` → `strategist` (fable) | — |
| II.B Constraint Mapping | COVERED — `## Constraints` in `research_questions.md` | — |
| III.A Inter-document Correlation | COVERED — `analyst` cross-node synthesis | Strengthened: analyst now also receives `corpus_map.md` |
| III.B Conflict Isolation | COVERED — `## Open Conflicts` in theory template | — |
| III.C Quarantine Protocol — HITL queue for unresolvable conflicts | MISSING — conflicts noted in theory body but no structured review queue | **QUARANTINE protocol**: `/analyze` writes each open conflict to `research_body/04_quarantine/conflict_*.md` (`type: conflict`, `status: review-required`); humans resolve and move to archive |
| IV.A Gap Analysis (baseline vs outcome) | PARTIAL — `## Baseline vs. Gap` in theory, but baseline was never established | Fixed by I.C: gap analysis now diffs corpus_map baseline against research_questions outcome |
| IV.B Autonomous Extrapolation | COVERED — `evaluator` (opus) | — |
| IV.C Route Optimization | COVERED — `## Route Optimization` in economic_model | — |
| V.A Macro-Synthesis Output — unified strategic alignment document | MISSING — pipeline stopped at per-theory economic models | **SYNTHESIZE phase**: `synthesist` agent (fable) compiles theories + economic models + verifications into `outcomes/alignment/alignment_*.md` |
| V.B Granular Execution Detailing, cross-referenced to sources | PARTIAL — econ model has `## Cross-References` | Alignment doc requires `## Execution Detail` with per-step source cross-refs |
| V.C Systemic Self-Audit — stress-test outputs against corpus constraints | MISSING — `auditor` audits *process drift*, not *output validity* | **VERIFY phase**: `verifier` agent (opus) stress-tests a theory/econ-model/alignment doc against nodes + constraints → `outcomes/verification/verify_*.md` with a hard `## Verdict` |

## Operator-added requirements

| Requirement | Resolution |
|---|---|
| PDF → raw data processing | `/extract` skill; `pdftotext` (verified installed) with `Read`-tool page fallback; EXTRACT log phase. Bash-created files bypass the Write gate hook, so `/extract` calls `append_log.sh` directly — documented exception in `operations/SKILL.md` |
| Longitudinal analysis | **LONGITUDINAL phase**: `historian` agent (sonnet) reads `execution.log` + dated artifacts across a time window → `outcomes/longitudinal/long_*.md`: question-coverage trajectory, conflict burn-down, node→theory→econ conversion rate, drift trend |
| Explicit I/O contracts | Per-phase I/O contract table added to `operations/README.md`; every phase declares exactly one read layer and one write layer |
| Logging completeness | Valid phases extended to: INIT, EXTRACT, QUESTION, CONSUME, INDEX, ANALYZE, QUARANTINE, EVALUATE, VERIFY, LONGITUDINAL, SYNTHESIZE, BROADCAST, AUDIT — every artifact-producing path logs to `execution.log` (via gate hook for Write-tool paths, via `append_log.sh` for the Bash EXTRACT path) |

## Work Blocks

- [x] **WB-A (dirs):** create `research_body/00_inbox/`, `research_body/04_quarantine/`,
      `outcomes/verification/`, `outcomes/longitudinal/`,
      `outcomes/alignment/`
- [x] **WB-B (agents):** add `.claude/agents/{indexer,verifier,historian,synthesist}.md`; update
      `analyst.md` to emit structured conflicts for quarantine
- [x] **WB-C (skills):** add `.claude/skills/{extract,index,stress-test,longitudinal,synthesize}/SKILL.md`;
      update `analyze` (quarantine step, corpus_map input) and `bootstrap` (new checklist)
- [x] **WB-D (templates):** add `operations/templates/{corpus_map,conflict,verification,longitudinal_report,alignment}.md`
- [x] **WB-E (hooks):** extend `post_write_gate.sh` case arms (index, quarantine, verification,
      longitudinal, alignment); `gate.sh` required-section checks (`## Verdict` for verification,
      `## Baseline (As-Is)` for corpus_map, `## Execution Detail` for alignment)
- [x] **WB-F (docs):** update `operations/SKILL.md` (Bash-write logging exception), `operations/README.md`
      (pipeline table + I/O contract), root `CLAUDE.md` (phase list, gated dirs), `operations/INDEX.md`
- [x] **WB-G (verify):** smoke-test gate arms; run `/bootstrap`; confirm `pdftotext` path works on a
      sample PDF

## Pipeline order of operations (v2.10)

```
00_inbox (pdf/binary)
   └─ EXTRACT ──────────► 01_raw (text)
                             └─ CONSUME ────────► 02_nodes (+ raw → 03_archive)
                                                     ├─ INDEX ────► corpus_map.md   (I.B + I.C)
QUESTION ► goals/research_questions.md               │
   (before ANALYZE)                                  └─ ANALYZE ──► outcomes/theories
                                                          ├─ conflicts ► 04_quarantine (III.C, HITL)
                                                          └─ EVALUATE ► outcomes/economic_models
                                                                └─ VERIFY ► outcomes/verification (V.C)
                                                                └─ SYNTHESIZE ► outcomes/alignment (V.A/B)
                                                                      └─ BROADCAST ► outcomes/broadcast
LONGITUDINAL (any time, reads log + dated artifacts) ► outcomes/longitudinal
AUDIT (/daily-summary, process drift) ► goals/audits
```

---

# v2.20 Addendum — PRD v1.00 + Hooks Spec (multi-tenancy)

Processed inputs: `#Sensai PRD v1.00.md`, `#Sensai Hooks.md`. New requirement vs v2.10:
**multi-tenant engagements**. Everything else in those docs (gating engine, one-line logging,
state machine, daily audit, fail-safe deletion) was already implemented in v2.10.

| PRD/Hooks requirement | Resolution |
|---|---|
| §3 System logic vs engagement state split | System = `.claude/` + `operations/templates/`; state = `operations/engagements/<name>/{goals,research_body,outcomes,telemetry,INDEX.md}` |
| §4.1 `/switch <name>` | `.claude/skills/switch/` — pointer write + context priming from engagement INDEX.md |
| Hooks `/init <name>` | `.claude/skills/init-engagement/` — renamed: `/init` collides with Claude Code's built-in |
| Hooks `.active_engagement` pointer | `operations/.active_engagement` (sanitized to `[a-z0-9_]` on every read) |
| §5 Path traversal prevention | Gate hook rejects malformed engagement path segments; switch/init sanitize names |
| §5 Context bleed prevention | Gate hook derives owning engagement from each gated write path; non-active target ⇒ delete + block |
| §4.1 Low-token per-engagement log | `engagements/<name>/telemetry/execution.log`; `append_log.sh` takes engagement arg or reads pointer |
| §4.4 STDOUT protocol ([SUCCESS]/[FAIL]) | Superseded natively: gate-hook block = [FAIL] (don't commit, self-correct); unblocked write + hook log line = [SUCCESS] |
| §5 API key management | N/A — native subagents, no keys (v2.00 supersession stands) |
| §4.2 econ headers "## Economic Vector, ## System Architecture" | PRD marks these "e.g."; implemented as `## Monetization Vector` + `## Route Optimization` (v2.10 templates) |

Work Blocks:
- [x] **WB-H (topology):** `operations/engagements/compilar/` migration + `.active_engagement` pointer
- [x] **WB-I (hooks):** engagement-aware `post_write_gate.sh` (bleed block, traversal check), pointer-aware `append_log.sh`
- [x] **WB-J (skills):** `/switch`, `/init-engagement`; all 12 pipeline skills + 10 agents re-pathed to `<eng>/`; bootstrap rewritten two-layer
- [x] **WB-K (docs):** global INDEX.md registry, engagement INDEX.md, README multi-tenancy section, root CLAUDE.md
- [x] **WB-L (verify):** context-bleed block fires; active-engagement write logs to correct ledger

---

# /autoplan CEO Review — Step 0 (2026-07-05, mode: SELECTIVE EXPANSION, [subagent-only])

## System Audit
No commits (entire harness untracked, 5 top-level entries); no stashes; zero TODO/FIXME in tree;
no SENSAI.md/TODOS.md; no design doc or handoff; learnings/brain cold. Retrospective check: N/A
(no history). UI scope: none. **Surprise finding:** operator-added `.gitignore` contains `*.log`
and `telemetry/` — this ignores every engagement's `telemetry/execution.log`, but the ledger is
designed to be committed (durable WB history feeds /longitudinal and the WB-ID commit protocol).
Design-vs-operator conflict → surfaced at gate as User Challenge U1.

**Taste calibration** — well-designed references: `.claude/scripts/gate.sh` (single-purpose,
deterministic, required-section table), the per-template load-bearing frontmatter contract.
Anti-pattern to avoid repeating: INDEX.md updates are honor-system prose instructions in every
skill while everything else is hook-enforced — the one drift-prone seam (→ expansion E1).

**Landscape (Layer 1/2/3):** L1 tried-and-true: RAG stacks + knowledge vaults + Agent SDK
researcher→writer→reviewer pipelines. L2 (search): coding-harness market converging (Skills/Hooks
no longer Claude-exclusive); no incumbent product = gated research→economic-value compiler. L3:
differentiation is deterministic gating + HITL quarantine on *research synthesis*, not coding.

## 0A. Premises (named, for the gate)
- **P-1 (pipeline > wiki):** research only counts when forced through gated phases to an economic
  outcome; storage without conversion is failure. — plausible, core Fable Interaction mandate.
- **P-2 (deterministic gates):** LLM output must be schema-gated by hooks, never trusted. — sound;
  verified live twice.
- **P-3 (multi-tenancy now):** parallel isolated engagements needed before the first corpus is
  processed. — speculative: zero engagements have run; cost already sunk, low carrying cost.
- **P-4 (native substrate):** Claude Code skills/agents/hooks beat a bespoke API harness. — sound;
  eliminated key mgmt + router scripts; market data supports primitives' maturity.
- **P-5 (LLM wiki as memory):** slug files + INDEX.md + wikilinks suffice as recall layer; no
  vector index. — holds at small corpus scale; breaks at ~100s of nodes (deferred, T3).
- **P-6 (solo operator, 2 HITL points):** quarantine queue + FAIL verdicts are the only stop-and-
  wait points. — matches PRD; depends on operator servicing them.

## 0B. Existing Code Leverage
Plan == as-built ledger; every sub-problem maps to shipped code (routing→agent frontmatter,
gating→post_write_gate.sh, PDF→pdftotext, state→INDEX.md, isolation→pointer+hook). No rebuild of
existing repo functionality detected. External overlap noted, not duplication: sensai's own
ingest/query skills and /learn are general-purpose; this harness is engagement-scoped with hard
gates.

## 0C. Dream State
```
CURRENT STATE                      THIS PLAN                       12-MONTH IDEAL
Verified v2.20 multi-tenant   →   (complete; adds E1,E2 below) →   3+ engagements shipping alignment
harness; 0 corpora; 0 commits                                      docs; longitudinal data steering
                                                                   corpus buys; template-repo reuse
```
Plan moves toward ideal; the only regression risk is the uncommitted state (everything is one
`rm -rf` from gone) — gate decision G1.

## 0C-bis. Implementation Alternatives
```
APPROACH A: Native harness as built (skills+agents+hooks, file wiki)   Effort: spent  Risk: Low
  Pros: enforced gates; no keys; verified live   Cons: Claude Code lock-in; honor-system INDEX
  Reuses: everything shipped
APPROACH B (minimal viable): CLAUDE.md conventions only, no hooks      Effort: S      Risk: High
  Pros: trivial to maintain  Cons: silent drift, no enforcement — regresses PRD §4.2
APPROACH C (ideal architecture): A + eval harness + vector recall +    Effort: XL     Risk: Med
  per-engagement repos. Pros: scale + portability  Cons: new infra now, zero corpora yet
```
**RECOMMENDATION (auto, P1+P4):** A now; C's elements itemized as T1-T3 deferrals. B rejected —
enforcement is the product. Not a close call → mechanical, not taste.

## 0D. Selective-Expansion Scan
Complexity check: ~40 system files is the product itself, not incidental complexity; accepted.
Candidates (auto-triaged per P2 blast-radius rule; review-only — nothing implemented until gate):
- **E1 ACCEPT** (in radius, 2 files, <1h CC): INDEX-drift reminder — post_write_gate warns when a
  gated write lands without an INDEX.md update in the same Work Block.
- **E2 ACCEPT** (in radius, 2 files, <1h CC): `/resolve-conflict <file>` skill — guided HITL
  servicing of the quarantine queue (record resolution, set status, archive). Closes the loop the
  PRD leaves manual.
- **E3 TASTE** (new infra): bats regression tests for gate.sh/append_log.sh (~15 cases).
- **T1 DEFER→TODOS:** per-engagement git isolation (worktree/repo per tenant) — L, new infra.
- **T2 DEFER→TODOS:** eval harness for pipeline output quality (LLM-judge suites) — XL.
- **T3 DEFER→TODOS:** vector/gbrain recall once any corpus exceeds ~100 nodes — L.

## 0E. Temporal Interrogation (first real run, human-scale → CC-scale)
HOUR 1 (staging): which engagement + stated outcome; inbox vs raw placement. → resolved by docs.
HOUR 2-3 (question/consume): outcome statement sharpness; batch-consume order. → operator input.
HOUR 4-5 (index/analyze): corpus_map overwrite cadence; quarantine servicing rhythm → E2 helps.
HOUR 6+ (evaluate/verify): commit-per-WB consent friction — every WB wants a commit but commits
require consent → gate decision G2 (standing consent for WB commits vs ask-each-time).

## 0F. Mode
SELECTIVE EXPANSION (autoplan override; matches "iteration on existing system" default). Committed.

<!-- AUTONOMOUS DECISION LOG -->
## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|----------------|-----------|-----------|----------|
| 1 | P0 | Plan file = this ledger | Mechanical | P3 | Only plan artifact in repo | — |
| 2 | P0 | UI scope NO / DX scope YES | Mechanical | — | 1 vs 14 term matches; product is a CC harness | — |
| 3 | P0.5 | Codex voices off → [subagent-only] | Mechanical | — | codex auth probe failed | codex voice |
| 4 | P1-0F | Mode = SELECTIVE EXPANSION | Mechanical | override | autoplan fixed mode | other modes |
| 5 | P1-0C-bis | Approach A (as-built) | Mechanical | P1,P4 | B unenforced; C = A + deferrals | B; C-now |
| 6 | P1-0D | E1 INDEX-drift reminder → accept | Auto | P2 | blast radius, 2 files, <1h | — |
| 7 | P1-0D | E2 /resolve-conflict skill → accept | Auto | P2 | closes HITL loop, <1h | — |
| 8 | P1-0D | E3 bats gate tests → taste | Taste | P1 vs P3 | coverage rule vs new test infra | — |
| 9 | P1-0D | T1 per-eng git, T2 evals, T3 vector recall → TODOS | Auto | P3 | outside radius / new infra / premature | in-plan now |

## CEO Phase — Dual Voices + Sections 1-10 (2026-07-05, [subagent-only])

### CLAUDE SUBAGENT (CEO — strategic independence) — 13 findings, condensed
1. CRITICAL wrong-problem: 3 plan versions, 0 corpora processed; next move is more harness. Reframe: freeze `.claude/`, run one real engagement end-to-end, judge the output.
2. CRITICAL P-2 overclaim: gate.sh validates form (frontmatter + header presence), not truth. Quality theater while the eval harness (T2) is deferred.
3. CRITICAL closed-loop verify: verifier reads only corpus-derived nodes (haiku-extracted, pdftotext-lossy); CONSUME hallucinations invisible by construction; PASS ≡ "internally consistent".
4. CRITICAL durability: repo uncommitted; `.gitignore` discards `telemetry/` — the ledger the WB/longitudinal design depends on. Found twice, fixed zero times.
5. HIGH missing premise P-0: no named consumer of an alignment doc anywhere in plan/PRD/README.
6. HIGH EVALUATE cannot output "no economic value" — a pipeline that can't say "nothing here" is uninformative.
7. HIGH harness-became-the-hobby drift; zero tests on 40 files riding a fast-moving substrate.
8. HIGH "multi-tenancy" label inflates a directory convention + pointer + bleed hook.
9. HIGH 0C-bis alternatives were a strawman sandwich (built-thing vs obviously-bad vs obviously-premature); commercial deep-research diff never run.
10. MED substrate commoditization; defensible asset is prompts/templates + corpora, not hooks.
11. MED token economics unmodeled (opus/fable per artifact, full-corpus re-reads, retry-on-gate-fail).
12. MED BROADCAST publishes externally on a format gate — needs a third HITL point.
13. MED self-review theater: CRITICAL findings must block next WB until resolved/overridden.

### CEO DUAL VOICES — CONSENSUS TABLE
```
  Dimension                              Claude-subagent   Codex   Consensus
  1. Premises valid?                     DISAGREE (P-0 missing, P-2 overclaimed)  N/A  FLAGGED
  2. Right problem to solve?             DISAGREE (run > build)                   N/A  FLAGGED → U2
  3. Scope calibration correct?          DISAGREE (freeze harness)                N/A  FLAGGED
  4. Alternatives sufficiently explored? DISAGREE (strawman 0C-bis)               N/A  FLAGGED
  5. Competitive/market risks covered?   PARTIAL (substrate risk unpriced)        N/A  FLAGGED
  6. 6-month trajectory sound?           DISAGREE (harness-as-hobby)              N/A  FLAGGED
  Single-voice mode: no CONFIRMED possible; every critical finding flagged regardless.
```

### Sections 1-10 (primary reviewer, grounded in the as-built code)

**S1 Architecture** — dependency graph:
```
 operator ─/skill→ SKILL.md ─Agent tool→ subagent(model-tier) ─doc→ Write
                                                                    │
     .active_engagement ─────────────┐                              ▼
 settings.json → post_write_gate.sh ─┼─ bleed/traversal check → gate.sh(type schema)
                                     │        pass│fail=delete+block
                                     ▼            ▼
                        engagements/<eng>/…   append_log.sh → telemetry/execution.log
```
Findings: (a) pointer file = single point of failure — fail-closed (good), recovery documented
via /switch (ok). (b) destructive remediation: hook deletes on gate-fail; safe only because the
artifact also exists in the agent's returned message — rewrite is cheap. OK. (c) triple
bookkeeping: path→type map exists in hook case arms + SKILL.md §4 + README table; drift risk
accepted at current size (registration rule already mandates all four points). (d) rollback
posture VOID until first commit → G1. (e) 10x/100x: INDEX full-corpus read breaks first (~100s
nodes) → T3 as designed.

**S2 Error & Rescue Registry**
```
 CODEPATH                      FAILURE                       RESCUED?  USER SEES / ACTION
 post_write_gate: json parse   malformed hook payload        N ← GAP   FILE_PATH='' → exit 0 = ungated
                                                                        write passes SILENTLY → fix E9
 post_write_gate: gate fail    schema invalid                Y         delete + GATED line + block msg
 post_write_gate: append fail  ledger unwritable post-pass   N ← GAP   artifact exists, no ledger line
 gate.sh: file vanished        race/manual delete            Y         GATED, reason printed
 append_log: pointer missing   no active engagement          Y         exit 1 + instruction
 /extract: pdftotext empty     scanned/garbled PDF           Y         manual gate → GATED + operator msg
 agent returns refusal/garbage LLM failure                   PARTIAL   gate deletes; retry loop UNBOUNDED
                                                                        ← GAP: cap at 2 retries then stop
 mv raw→archive fails          partial consume               Y(benign) slug overwrite = idempotent rerun
```
**S3 Security** — threat model: (a) prompt injection via corpus (untrusted PDFs → agents):
likelihood Med, impact Med; contained — pipeline agents are Read/Grep/Glob-only, no Bash/Write;
residual data-poisoning risk flows to verifier + quarantine; document as accepted risk. (b) path
traversal/context bleed: mitigated, verified live. (c) confidentiality: engagement corpora in one
repo + BROADCAST external publishing → E6 HITL sign-off; per-tenant repos = T1. (d) secrets: none
in tree; `*.env` ignored. No HIGH open threats after E6/E9.

**S4 Data-flow/interaction edges** — /consume rerun: idempotent (slug overwrite). /switch
mid-pipeline: next writes re-scoped; mitigated by switch printing new context; single-operator
premise P-6 accepted. Concurrent sessions on one repo: pointer race out of scope (P-6). Zero-node
/index, /analyze without questions, /synthesize without verifications: all refuse with
instructions (checked in SKILL.md gates). No unhandled edges beyond S2 GAPs.

**S5 Code quality** — gate.sh require_section pattern/label duplication: minor, accepted.
append_log WB-ID from line count: fragile to hand-edits; ledger is hook-written only — accepted.
No cyclomatic offenders (largest script 90 lines). DRY: the one real repetition is the
per-skill boilerplate paragraph (engagement scope note) — generated by script, uniform, accepted.

**S6 Test review** — NEW codepaths (hook: 11 gate arms × pass/fail, bleed, traversal, no-pointer;
append_log numbering/engagement arg; extract fallback chain) have **zero repeatable tests** —
only session smoke-tests. 2am-Friday test: "gate deletes a legit artifact due to regex drift" —
currently only caught manually. LLM eval suites: none (T2). → E3 sharpened from taste to
recommended-accept: ~15 bats cases over gate.sh/append_log/post_write_gate (pure bash, no LLM).
Chaos: corrupted pointer, log file deleted mid-run — covered by E3 case list.

**S7 Performance** — hotspots: INDEX/ANALYZE full-corpus reads (T3); opus×2 per artifact chain
+ fable×2 per run; retry-on-GATED doubles cost. No cost visibility → E4: append per-WB
token/cost column to ledger (format change is free pre-first-run; historian funnel gains a
cost row).

**S8 Observability** — ledger + INDEX.md + git trail + GATED-streak detection (historian
"Systemic Faults") = adequate for solo CLI. Runbooks: README leverage rules. Day-1 dashboard =
INDEX.md Run Status. Gap: silent ungated-write path from S2 GAP-1 → E9 makes it loud.

**S9 Deployment/rollout** — no deploy surface; "rollout" = git protocol. G1 (initial commit)
is the entire rollback story. /bootstrap = post-deploy verification. Feature flags N/A.

**S10 Long-term** — reversibility 4/5 (markdown + git). Debt: zero tests (E3), triple
bookkeeping (accepted), substrate coupling (subagent #10) → mitigation: templates/prompts are
plain markdown (portable by construction); add T4 "substrate portability audit" to TODOS.
1-year question: README + CLAUDE.md map pass the new-engineer test. Path dependency: quarantine/
verify formats lock analysis idioms — acceptable, versioned in templates/.

**S11 Design/UX** — SKIPPED: no UI scope (CLI + markdown only; 1 term match < threshold 2).

### Required Outputs (CEO phase)

**NOT in scope** (deferred with rationale): T1 per-engagement git isolation (no second real
tenant yet); T2 LLM eval harness (pull-forward argued by subagent #2 — surfaced at gate as taste);
T3 vector recall (<100 nodes); T4 substrate portability audit (markdown-native already, audit
later); commercial deep-research comparison run (folded into U2 decision).

**What already exists**: whole harness (see WB-A..L); reuse map in Step 0B. No rebuilds found.

**Dream state delta**: plan + E-fixes leaves us at "verified engine, zero miles"; the 12-month
ideal requires corpus runs the plan does not schedule → U2 at gate.

**Failure Modes Registry** (delta rows; full table in S2):
```
 CODEPATH                    FAILURE            RESCUED? TEST? USER SEES?     → status
 post_write_gate payload     silent ungated     N        N     Silent        CRITICAL GAP → E9
 agent retry loop            unbounded retries  N        N     token burn    GAP → E10
 append fail post-pass       artifact w/o ledger N       N     Silent        GAP → E9 bundles
```

**Scope decisions (SELECTIVE EXPANSION cherry-picks, auto-triaged)**:
Accepted: E1 INDEX-drift reminder · E2 /resolve-conflict · E4 cost column in ledger ·
E5 "NO VIABLE VECTOR" first-class evaluator verdict · E6 BROADCAST human sign-off (3rd HITL) ·
E7 verifier samples originals in 03_archive · E9 fail-loud hook payload parse · E10 retry cap (2)
Taste (gate): E3 bats test suite (recommended accept after S6)
User Challenges (gate): U1 telemetry gitignored · U2 freeze-harness-and-run · U3 "multi-tenant" label
Deferred: T1-T4. Gate decisions: G1 initial commit · G2 WB commit consent · G3 name P-0 consumer.

### Decision Audit Trail (appended)
| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|----------------|-----------|-----------|----------|
| 10 | P1-S2 | E9 fail-loud payload parse → accept | Auto | P2 | silent ungated write = worst failure class | silent exit 0 |
| 11 | P1-S2 | E10 retry cap 2 → accept | Auto | P3,P5 | unbounded LLM retry burns tokens | infinite retry |
| 12 | P1-voices | E5 no-viable-vector verdict → accept | Auto | P1 | pipeline must be able to say "nothing here" | forced vectors |
| 13 | P1-voices | E6 broadcast HITL → accept | Auto | P1 | external publishing on format gate unsafe | hook-only gate |
| 14 | P1-voices | E7 verifier samples originals → accept | Auto | P1 | breaks closed verification loop cheaply | nodes-only |
| 15 | P1-S7 | E4 cost column → accept | Auto | P2 | free pre-first-run; funds token-economics view | no cost data |
| 16 | P1-S6 | E3 bats suite → taste (rec: accept) | Taste | P1 vs P3 | zero repeatable tests on enforcement layer | — |
| 17 | P1-voices | U2, U1, U3 → user challenges at gate | UserChallenge | — | models challenge operator's stated direction | auto-decide |
| 18 | P1 | P-0 (named consumer) → gate G3 | UserChallenge | — | only the operator knows the customer | invented one |

## ENG Phase — Dual Voices + Sections 1-4 (2026-07-05, [subagent-only])

### CLAUDE SUBAGENT (eng — independent review) — 16 findings, condensed (full text in session)
P1: (F1) `post_write_gate.sh:28` rm -f path never anchored to $PROJECT_DIR nor canonicalized —
can delete files in OTHER checkouts matching `*/operations/engagements/*`. (F2) delete-on-fail
applies to **Edit** of pre-existing artifacts → permanent loss in a zero-commit repo; restore,
don't delete, for Edits. (F3) ledger gitignored + zero commits (confirms U1/G1). (F4)
`/init-engagement` step order writes seeds BEFORE switching pointer → bleed hook deletes the new
engagement's seed files — first real multi-tenant moment breaks. (F5) fail-open: unparseable
payload → exit 0, every gate silently off (confirms E9; also `rm -f` failure downgrades block
to warning via set -e, and python3-missing kills hook non-blockingly).
P2: (F6) traversal check only inspects first segment — `compilar/../other/…` bypasses bleed.
(F7) skills inline untrusted corpus content into the privileged session; pass PATHS to read-only
agents instead (also halves token double-spend). (F8) WB-ID minting is a wc-l read/append race —
docs encourage parallel consumes; lockdir needed (macOS lacks flock). (F9) fixed `/tmp/
sensai_gate_reason` — CWE-377 symlink + cross-session clobber; mktemp. (F10) zero tests on ~180
lines of destructive bash (=E3, upgraded from taste). (F11) `.active_engagement` has no
concurrency story (two tabs race; deleted-as-bleed or mis-ledgered).
P3: (F12) every Edit mints a fresh SUCCESS WB → ledger inflation; add EDIT status. (F13) rm-f
failure path + spurious GATED when the Write itself errored. (F14) per-WB commit instructions
contradict consent rule AND `git add -A` drops the gitignored ledger (=G2 must resolve). (F15)
no chunking/size guards anywhere; /index O(N²) cumulative; 400-page PDF kills /consume. (F16)
gate is envelope-validation (frontmatter anywhere; `status: garbage` passes) — stop calling it
artifact validation; also grep SIGPIPE-under-pipefail nit.

### ENG DUAL VOICES — CONSENSUS TABLE
```
  Dimension                     Claude-subagent                         Codex  Consensus
  1. Architecture sound?        PARTIAL (shape good; enforcement flaws) N/A    FLAGGED
  2. Test coverage sufficient?  DISAGREE (0% on enforcement layer)      N/A    FLAGGED
  3. Performance risks?         DISAGREE (no chunking/size guards)      N/A    FLAGGED
  4. Security threats covered?  DISAGREE (rm anchor, traversal, Bash)   N/A    FLAGGED
  5. Error paths handled?       DISAGREE (fail-open enforcement)        N/A    FLAGGED
  6. Deployment risk?           DISAGREE (zero commits)                 N/A    FLAGGED
```

### Section 3 — Test Coverage Diagram (enforcement layer; framework: none → bats proposed)
```
CODE PATHS                                          USER FLOWS
[+] .claude/scripts/post_write_gate.sh              [+] Pipeline write lifecycle
  ├── [GAP] payload unparseable (fail-open BUG F5)    ├── [★ smoke] valid node → SUCCESS ledger
  ├── [GAP] non-engagement path skip                  ├── [★ smoke] invalid node → delete+block
  ├── [GAP] malformed segment reject                  ├── [★ smoke] bleed write → delete+block
  ├── [GAP] no-pointer reject                         ├── [GAP][→E2E] /init-engagement 2nd tenant
  ├── [GAP] bleed reject (+ mid-path `..` F6)         │      (BROKEN by F4 — regression test req'd)
  ├── [GAP] 11 case arms × pass/fail (22 paths)       ├── [GAP] /switch mid-run re-scope
  ├── [GAP] rm -f failure → still blocks (F13)        └── [GAP] two parallel consumes (F8 race)
  └── [GAP] append fail after pass
[+] gate.sh: [GAP×8] no-fm/no-type/no-status/empty-body/4 required-section arms
[+] append_log.sh: [GAP×4] pointer-missing/explicit-arg/numbering/concurrent
[+] extract path: [GAP×2] pdftotext-empty fallback, size guard (F15)
COVERAGE: 0/39 repeatable (3 one-off session smokes) | QUALITY: ★:3 | GAPS: 36 (2 →E2E)
REGRESSION RULE: F4 (init-engagement seed deletion) is a broken existing behavior → its
regression test is a CRITICAL requirement, not optional.
```

### Section 4 — Performance: F15 chunking + F7 path-passing are the only material items (no DB/N+1 surface). Cost visibility = E4 (accepted).

### Worktree parallelization
| Step | Modules touched | Depends on |
|---|---|---|
| L1 hook hardening (F1,F2,F5,F6,F9,F13,E9,E1) | .claude/scripts/ | — |
| L2 skill fixes (F4,F7,E5,E6,E7,E10,E2) | .claude/skills/, .claude/agents/, templates/ | — |
| L3 bats suite (E3/F10) | tests/ | L1 (tests the hardened hooks) |
| L4 ledger/commit policy (G1,U1,G2,F8,F12,E4) | .gitignore, append_log.sh, docs | operator decisions |
Lanes: L1 ∥ L2 in parallel; L3 after L1; L4 after gate decisions. Conflict flag: L1 and L4 both
touch append_log.sh — coordinate or sequence.

### Decision Audit Trail (appended)
| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|----------------|-----------|-----------|----------|
| 19 | P3 | F1,F2,F4,F5(+F13) accepted as P1 fixes | Auto | P1,P5 | enforcement layer must not destroy data / fail open | ship as-is |
| 20 | P3 | F6,F7,F8,F9 accepted as P2 | Auto | P2 | in blast radius, each <1h CC | defer |
| 21 | P3 | F10/E3 bats: taste → ACCEPTED | Auto-revised | P1 | 2nd voice independently demands it; regression rule triggers on F4 | keep as taste |
| 22 | P3 | F11 session guard, F12 EDIT status, F15 size guards → P2/P3 in-plan | Auto | P2,P3 | small, localized | defer all |
| 23 | P3 | F16 relabel gates as envelope-validation in docs | Auto | P5 | honest naming; truth-checking is T2 | overclaim |
| 24 | P3 | F14 commit policy → G2 (operator) | UserChallenge | — | consent rule vs WB protocol is operator's call | pick silently |

## DX Phase — Dual Voices + 8 Passes (2026-07-05, [subagent-only], mode: DX POLISH)

Product type: **Claude Code Skill / CLI-driven pipeline**. Personas (auto-inferred, P6):
(a) solo AI-native operator driving Claude Code daily; (b) the fresh Claude session itself as a
first-class developer reading the docs.

### CLAUDE SUBAGENT (DX — independent) — 12 findings, condensed; overall 6/10, TTHW 15-45min
HIGH/CRIT: (D-1) no demo/sample corpus — hello world requires BYO corpus vs plain-Claude baseline
TTHW≈0. (=F5) fail-open hook is also the worst DX failure (enforcement silently OFF); /bootstrap
never self-tests the hook. (=F2) delete-on-Edit destroys old artifacts. (D-4/=F14) skills' commit
steps contradict CLAUDE.md consent rule — fresh session must violate or stall 13×/run; `git add
-A` can't even stage the gitignored ledger. (D-5) no documented escape hatch; the implicit one
(edit outside Claude Code) silently desyncs ledger+INDEX. (=F10) zero tests.
MED: (D-6) `/stress-test`≠VERIFY, `/daily-summary`≠AUDIT — ledger greps miss; add /verify,
/audit aliases. (D-7) arg-shape inconsistency: /extract has `all`, /consume doesn't (docs say
"batch-consume"); window grammar undefined; WB-ID read-after-append race → append_log should echo
to caller. (D-8) gate messages excellent but generic template pointer + fixed /tmp reason file
(=F9). (D-9) pointer-missing deletes the artifact to punish a config problem — quarantine, don't
delete. (D-10) nothing routes fresh operators to /bootstrap first. (=F6) traversal gap.

### DX DUAL VOICES — CONSENSUS: single-voice; all six checklist dims flagged (get-started <5min:
NO · names guessable: PARTIAL · errors actionable: PARTIAL · docs findable: YES-with-2-contradictions ·
upgrade safe: NO STORY · env friction-free: PARTIAL).

### Developer Journey Map
| Stage | Today | Gap → fix |
|---|---|---|
| Discover | repo README (no remote) | fine for internal |
| Evaluate | must read ~3 docs; no artifact to look at | D-1 demo output in repo |
| Install | clone + Claude Code; pdftotext optional | /bootstrap checks it ✓ |
| Hello world | BYO corpus, 6 steps, 15-45min | **D-1 demo corpus → <10min target** |
| Integrate | golden path README ✓ (best artifact) | route step 0 = /bootstrap (D-10) |
| Debug | good gate messages; silent fail-open | F5 fail-closed + bootstrap hook self-test |
| Upgrade | none (substrate churn unversioned) | F16 relabel + T4 portability audit |
| Scale | no chunking (F15); INDEX O(N²) | F15 size guards; T3 vector recall |
| Migrate | templates are portable markdown ✓ | T4 |

### Developer Empathy Narrative
"I clone it, open Claude Code, and the map in CLAUDE.md is genuinely great — I know where
everything lives in two minutes. Then I want to SEE it work and there's nothing to feed it. I
grab a random PDF, /extract, /consume — a gate rejects the node once, the error message actually
tells me the missing field (nice), the retry passes. Then the skill wants to git commit and the
same repo's rules tell it not to without asking me — it asks, and will ask 12 more times tonight.
At 2am I fat-finger an Edit on yesterday's theory and the hook *deletes it*; there are no commits
to restore from. The tool whose pitch is 'never lose research to sloppiness' just lost my
research to strictness."

### DX Scorecard (0-10; gap-to-10 noted)
| Dim | Score | 10 looks like |
|---|---|---|
| 1 Getting started | 4 | bundled demo engagement; one command to first node (<10min TTHW) |
| 2 CLI ergonomics | 7 | /verify + /audit aliases; /consume all; defined window grammar |
| 3 Error messages | 5 | fail-closed; restore-don't-delete; exact template path in message |
| 4 Documentation | 8 | fix 2 contradictions (commit policy, ledger ignore); runnable examples |
| 5 Upgrade path | 5 | versioned templates; substrate-churn note; T4 audit |
| 6 Dev environment | 6 | bootstrap-first routing; python3 + hook self-test in /bootstrap |
| 7 Community/ecosystem | n/a | single-operator internal tool — dimension differs in kind |
| 8 Measurement loops | 6 | ledger+audit+longitudinal exist; add E4 cost + T2 quality evals |
| **Overall** | **6/10** | → 8/10 achievable with D-1, F5, F2, F14 policy, aliases |

**TTHW: 15-45 min current → target <10 min** (demo corpus) → stretch <5 min (one-command demo run).
**Magical moment:** `/bootstrap` ends with "run `/demo` to watch a corpus become an economic
model in 3 minutes" — the pipeline's whole thesis, experienced before any investment.

### DX Implementation Checklist
- [ ] D-1 demo corpus + README "First run" block (P2) — the single highest-leverage DX item
- [ ] /verify + /audit aliases (P2) · /consume all + WB-ID echoed by append_log (P2)
- [ ] Documented override path with GATED-OVERRIDE ledger line (P2)
- [ ] /bootstrap: python3 check + hook self-test + route as README step 0 (P2)
- [ ] Pointer-missing → quarantine-not-delete (folds into F2 .rejected/ mechanism) (P1 w/ F2)
- [ ] Window grammar + exact template path in gate messages (P3)

### Decision Audit Trail (appended)
| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|-------|----------|----------------|-----------|-----------|----------|
| 25 | P3.5 | D-1 demo corpus → accept P2 | Auto | P1,P6 | kills the BYO-corpus cliff; 1h CC | ship empty |
| 26 | P3.5 | /verify + /audit aliases → accept | Auto | P5 | phase↔command mismatch is pure friction | rename-only |
| 27 | P3.5 | /consume all + WB-ID echo → accept | Auto | P3 | docs already promise batch; fixes race read | docs edit only |
| 28 | P3.5 | documented override + OVERRIDE ledger line → accept | Auto | P5 | undocumented override already exists, worse | "never hand-edit" doctrine |
| 29 | P3.5 | bootstrap-first routing + hook self-test → accept | Auto | P1 | fail-open (F5) makes self-test mandatory | trust the hook |
| 30 | P3.5 | pointer-missing quarantine-not-delete → fold into F2 | Auto | P5 | same .rejected/ mechanism | separate path |

## SENSAI REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | issues_open (via /autoplan) | 13 findings (4 critical); 9 proposals, 8 accepted, 4 deferred |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | unavailable (auth) | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_open (via /autoplan) | 16 issues, 3 critical gaps; coverage 0/39 → bats suite accepted |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | skipped | no UI scope |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | issues_open (via /autoplan) | score 6/10 → target 8/10; TTHW 15-45min → <10min |

**VERDICT:** CEO + ENG + DX reviewed, APPROVED AS-IS at final gate (D2→A, 2026-07-05). P1 fixes
(F1, F2, E9, F4, G1/U1) implemented and verified same session; per U2 the harness is now FROZEN
except the approved P2/P3 checklist until engagement #1 runs a real corpus end-to-end.
NO UNRESOLVED DECISIONS
