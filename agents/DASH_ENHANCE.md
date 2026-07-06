# DASH_ENHANCE.md — Sensai Studio: Deep-Stack Analysis & Enhancement Tasks

**Author:** UI/UX Engineering Review  
**Scope:** `app/src/` — data layer, API surface, component bindings; cross-referenced against live harness data  
**Purpose:** Identify underutilised data structures, prescribe concrete agent tasks, and specify a persistent multi-turn chat system for data-engaged inquiry

---

## 1. Full Data Structure Inventory

### 1.1 `LogRow` (`src/lib/types.ts`)

```ts
interface LogRow {
  timestamp: string;   // "2026-07-05 17:52:12" (space-separated, coerced to ISO on read)
  phase: string;       // 13 canonical values: INIT QUESTION EXTRACT CONSUME INDEX ANALYZE
                       // QUARANTINE EVALUATE VERIFY SYNTHESIZE BROADCAST LONGITUDINAL AUDIT
  workBlock: string;   // "WB-001" — monotonically increasing per engagement
  target: string;      // harness-root-relative artifact path (the file written that session)
  status: string;      // SUCCESS | FAIL | EDIT | GATED | GATED-OVERRIDE
}
```

`EDIT` = revision of prior work block (hook amended an existing artifact).  
`GATED` = gate check failed; artifact moved to `.rejected/`.  
`GATED-OVERRIDE` = operator bypass; artifact committed despite non-compliance.

**Current rendering deficits:**
- Only `SUCCESS`/`PASS`/`FAIL`/`BLOCKED` receive colour. `EDIT`, `GATED`, `GATED-OVERRIDE` are unstyled.
- `phase` has 13 values; all render identically as uppercase text — no icon, no colour, no filter.
- `workBlock` is not linked to the artifact it produced (`ArtifactCard.frontmatter.work_block`).
- `target` is rendered as a truncated string, not a clickable path to open the artifact in the drawer.

### 1.2 `EngagementSummary` (`src/lib/types.ts`)

```ts
interface EngagementSummary {
  id: string;
  path: string;                  // "engagements/compilar"
  focus: string | null;          // INDEX.md frontmatter: current_focus
  status: string | null;         // INDEX.md frontmatter: status
  lastCheckpoint: string | null; // INDEX.md frontmatter: last_checkpoint (ISO)
  active: boolean;               // true when id === operations/.active_engagement
  stages: StageCount[];          // 7 entries; counts of files per pipeline dir
  inputCount: number;            // sum of input-side stage counts (raw + nodes)
  outputCount: number;           // sum of output-side stage counts (theories → broadcast)
  lastActivity: string | null;   // newest execution.log timestamp (ISO)
  recentlyActive: boolean;       // lastActivity within 24 h
}
```

**Unexploited fields:**
- `stages[i].count` — 7 distinct counts computed server-side but collapsed into a 2-segment bar.
- `active` — the active tenant (the engagement the harness will write to) is only shown in the engagement card footer and pipeline header. It is not surfaced at the global/home level with any prominence.

**Not yet in the data model (exists in harness files, not fetched):**
- `INDEX.md` body: a structured **Run Status table** with 11 rows (phase, command, agent, model, queue size, done count, blockers). This is the most operationally dense artifact in the harness — fully parseable but never fetched.
- `goals/primary_directive.md`: plain markdown; the strategic north-star for the engagement.
- `goals/active_milestones.md`: GFM task list (`[x]` / `[ ]`); milestone completion rate is computable.
- `goals/research_questions.md`: structured question list (only exists after `/question` is run).
- `goals/audits/`: daily audit reports.
- `research_body/corpus_map.md`: semantic index built by `/index`; shows node relationships.
- `research_body/03_archive/`: raw files that have been consumed (as opposed to `01_raw` which are queued). Archive count = throughput signal.
- `outcomes/longitudinal/`: cross-session trend reports (historian agent output).

### 1.3 `GlobalTelemetry` (`src/lib/types.ts`)

```ts
interface GlobalTelemetry {
  engagements: number;     // total engagement count
  nodes: number;           // sum of research_body/02_nodes file counts
  theories: number;        // sum of outcomes/01_theories
  economicModels: number;  // sum of outcomes/02_economic_models
}
```

Missing from the model: `verification`, `alignment`, `broadcast`, `archived` (03_archive count = consumed throughput), `quarantined` (04_quarantine count = pending human decisions), `activeEngagement` (name of current tenant).

### 1.4 `ArtifactCard` (`src/lib/types.ts`)

```ts
interface ArtifactCard {
  name: string;
  path: string;
  frontmatter: Record<string, unknown>;
}
```

**Known load-bearing frontmatter keys per template schema** (`operations/templates/`):

| Template | type | status | verdict | source | created | Other |
|----------|------|--------|---------|--------|---------|-------|
| `standard_node.md` | `node` | `ready` | — | raw filename | ISO | — |
| `theory.md` | `theory` | `ready` | — | node filename(s) | ISO | — |
| `economic_model.md` | `economic_model` | `ready` | `viable` \| `no-viable-vector` | theory filename | ISO | — |
| `verification.md` | `verification` | `ready` | `PASS` \| `PASS-WITH-NOTES` \| `FAIL` | artifact filename | ISO | — |
| `alignment.md` | `alignment` | `ready` | — | — | ISO | — |
| `broadcast_post.md` | `broadcast` | `ready` | — | — | ISO | — |
| `conflict.md` | `conflict` | `pending` \| `resolved` | — | — | ISO | — |

**Current rendering:** only `status` appears on the card face. `verdict`, `type`, `source`, `created` are in the tooltip only. `work_block` (the WB-NNN that produced the artifact) links to the log row but this link is never made navigable.

### 1.5 Pipeline Stage Registry (`src/lib/pipeline.ts`)

Seven registered stages in order:

| # | key | dir | side | Current UI |
|---|-----|-----|------|------------|
| 1 | raw | research_body/01_raw | input | Kanban column |
| 2 | nodes | research_body/02_nodes | input | Kanban column |
| 3 | theories | outcomes/01_theories | output | Kanban column |
| 4 | economic | outcomes/02_economic_models | output | Kanban column |
| 5 | verification | outcomes/03_verification | output | Kanban column |
| 6 | alignment | outcomes/04_alignment | output | Kanban column |
| 7 | broadcast | outcomes/05_broadcast | output | Kanban column |

**Unregistered (exist in harness, absent from UI):**
- `research_body/04_quarantine` — HITL conflict queue. When non-empty, a human decision is blocked.
- `research_body/03_archive` — consumed raw files. Count = throughput (inputs fully processed).
- `research_body/00_inbox` — binary sources awaiting `/extract`. Dashboard cannot see extraction queue.
- `outcomes/longitudinal/` — cross-session trend reports; distinct from the numbered outcome chain.

### 1.6 API Surface

| Route | Shape | Gap |
|-------|-------|-----|
| `GET /api/engagements` | `{ engagements[], telemetry }` | No milestones, no run-status table, no active_engagement name |
| `GET /api/log?engagement=` | `{ engagement, rows: LogRow[] }` | No pagination; newest-first only |
| `GET /api/file?path=` | `ParsedFile` | Used by drawer; not used for structured data extraction |
| `GET /api/tree?path=` | `{ path, entries: DirEntry[] }` | One level only; `modified` on entries unused downstream |

**No write API exists** (read-only harness boundary is intentional). Sessions must write within the `app/` directory, not the harness root — session files at `app/sessions/<uuid>.json` are fully writable.

---

## 2. Diagnosis: Unexploited Information Sources

### 2.1 Run Status Table in INDEX.md Is Never Parsed

Each `engagements/<id>/INDEX.md` contains a markdown table with the complete operational state of the pipeline for that engagement:

```markdown
| Phase | Command | Agent (model) | Queue | Done | Blockers |
| QUESTION | `/question` | strategist (fable) | — | 0 | Awaiting stated outcome |
| CONSUME  | `/consume`  | consumer (haiku)   | 0 raw | 1 | None |
...
```

This table has queue sizes, done counts, and blocker text for all 11 phases. It is the most operationally dense artifact in the harness. Currently `readMarkdown` can fetch it but no component parses it — only the raw `body` is rendered in the drawer.

### 2.2 Milestone Completion Is Computable But Not Shown

`goals/active_milestones.md` contains a GFM task list. The ratio of `[x]` to `[ ]` lines is a direct completion percentage — available via simple string parsing from the fetched `ParsedFile.body`. No component reads this file.

### 2.3 Active Tenant Has No Home-Screen Prominence

`operations/.active_engagement` determines which engagement the harness will commit to on the next Work Block. The dashboard fetches this (`FsDataSource.activeEngagement()`) and sets `EngagementSummary.active = true`, but on the home screen there is no banner, indicator, or callout that makes the active tenant visually distinct from inactive ones. An operator switching between tenants has no persistent orientation cue.

### 2.4 Inbox and Archive Queues Are Invisible

`research_body/00_inbox` (binary sources awaiting extraction) and `research_body/03_archive` (consumed raw files) are not in the pipeline registry. An operator cannot see how many PDFs are waiting for `/extract` or how many sources have been fully processed, without drilling into a drawer.

### 2.5 Corpus Map Is Not Surfaced

`research_body/corpus_map.md` is the semantic index built by `/index`. It contains entity cross-references and the baseline "as-is" summary. It is a parsed markdown document available via `/api/file` but no component reads or links to it.

### 2.6 Log Target Is Not a Navigable Link

`LogRow.target` contains the artifact filename (e.g., `node--demo-corpus.md`). Combined with `LogRow.engagement`, the full harness-root-relative path `engagements/<id>/<phase-dir>/<target>` is reconstructable — but `target` is rendered as a truncated string. Clicking it should open the artifact in the drawer.

### 2.7 Synthesis Terminal Is One-Shot, Not Conversational

`SynthesisTerminal` collects a prompt, gathers context, calls the Anthropic API once, and streams a response. There is no message history, no thread concept, and no persistence — closing the tab or navigating away loses the response. A researcher running multiple queries in a session must re-enter context selection and model choice each time. The existing architecture (`streamSynthesis`, `gatherContext`) is fully capable of supporting multi-turn conversations; it just has no state management layer.

---

## 3. Enhancement Tasks

Tasks are ordered by investigative value impact. Each is scoped for one agent execution. All code changes are confined to `app/src/` and `app/sessions/` — the harness read-only boundary is never crossed.

---

### TASK-01: Per-Stage Sparkbar on Engagement Cards

**Priority:** HIGH  
**Data:** `EngagementSummary.stages: StageCount[]` — 7 entries in API response, currently unused.

Replace the 2-segment progress bar in `EngagementGrid.tsx` with a 7-segment micro-bar. Each segment's width is proportional to that stage's count vs. the max count across all 7 stages for this engagement (minimum 1 for denominator). Segments for input-side stages (`raw`, `nodes`) render in `bg-edge`. Segments for output-side stages render in `bg-emerald/60`; non-zero output segments step to `bg-emerald`. Segment widths are displayed as `flex` children of a fixed-height `h-1.5` container.

Below the bar, render a single line of 7 monospace counts separated by `·` in `text-[10px] text-ink-dim`: `0 · 1 · 0 · 0 · 0 · 0 · 0` — positionally corresponding to the 7 stages. Non-zero output counts render in `text-emerald`.

**Files:** `src/components/dashboard/EngagementGrid.tsx`  
**API:** No change — `stages` already in the response.

---

### TASK-02: Active Tenant Banner on Home Screen

**Priority:** HIGH  
**Data:** `EngagementSummary.active: boolean` already in response. `operations/.active_engagement` is already read by `dataSource.activeEngagement()`.

In `app/page.tsx`, above the engagement grid, add a full-width `<aside>` banner when any engagement has `active: true`. The banner renders:

```
● active tenant: <id>  ·  focus: <focus>  ·  <recentlyActive pulse dot if true>
```

Background: `bg-emerald/5`, border: `border-b border-emerald/20`, text: `font-mono text-xs`. This gives operators a persistent orientation cue when switching tenants from the CLI.

In `GlassNav.tsx`, add the active tenant name next to the logo: `sensai / <activeId>` instead of static `sensai / studio`.

**Files:** `src/app/page.tsx`, `src/components/ui/GlassNav.tsx` (make nav accept `activeId` prop)  
**API:** Pass active engagement id through `GlobalTelemetry` or derive from `engagements.find(e => e.active)`.

---

### TASK-03: Run Status Matrix on Engagement Detail Page

**Priority:** HIGH  
**Data:** `engagements/<id>/INDEX.md` body contains an 11-row markdown table (Phase | Command | Agent | Queue | Done | Blockers). Fetchable via `GET /api/file?path=engagements/<id>/INDEX.md`.

Add a `RunStatusMatrix` server component to `app/engagements/[id]/page.tsx`:

1. Fetch the engagement's `INDEX.md` via `dataSource.readFile()`.
2. Parse the Run Status table from the body using a regex/line-split approach:
   - Split on `\n`, find the header row (`| Phase |`), extract subsequent `|`-delimited rows.
   - Produce `RunStatusRow[]`: `{ phase, command, agent, queue, done, blockers }`.
3. Render as a compact monospace table above the Kanban board:
   - Column widths: phase (fixed 120px), done (40px), queue (40px), blockers (fill).
   - `done > 0` → emerald phase name. `blockers !== "None"` → amber blockers text. Queue `> 0` → `text-ink` (has work to do).
   - Clicking a row with `done > 0` jumps to that stage's column in the Kanban (via `scrollIntoView`).

**Files:** `src/app/engagements/[id]/page.tsx`, `src/components/dashboard/RunStatusMatrix.tsx` (new)  
**API:** `GET /api/file` already exists — parse the INDEX.md body client- or server-side.

---

### TASK-04: Milestone Progress on Engagement Cards

**Priority:** HIGH  
**Data:** `goals/active_milestones.md` is a GFM task list. Fetchable as `ParsedFile`; `body` contains `- [x]` and `- [ ]` lines.

Add a `fetchMilestones(id: string)` helper in `src/lib/dataSource.ts`:
- Fetches `engagements/<id>/goals/active_milestones.md` via `readMarkdown`.
- Parses the body: count lines matching `/^\s*-\s*\[x\]/i` (done) and `/^\s*-\s*\[\s\]/` (pending).
- Returns `{ done: number, total: number }`.

Include `milestones: { done: number, total: number } | null` in `EngagementSummary`. Render in `EngagementGrid.tsx` card footer as: `2/7 milestones` in `font-mono text-[10px]`, with a thin inline progress track behind the text (CSS `background: linear-gradient(to right, emerald 28%, transparent 28%)`).

**Files:** `src/lib/dataSource.ts`, `src/lib/types.ts`, `src/components/dashboard/EngagementGrid.tsx`

---

### TASK-05: Log Full-Coverage: Status Colours, Phase Icons, Target Links

**Priority:** HIGH  
**Data:** `LogRow.status` (5 values), `LogRow.phase` (13 values), `LogRow.target` (artifact filename).

**5a. Status colour parity.** Extend `STATUS_COLOR` in `src/lib/constants.ts` (create this file):

```ts
export const STATUS_COLOR: Record<string, string> = {
  SUCCESS: "text-emerald",
  PASS:    "text-emerald",
  EDIT:    "text-amber-400",       // revision — amber
  GATED:   "text-red-500",         // gate block — more urgent than FAIL
  "GATED-OVERRIDE": "text-orange-400",
  FAIL:    "text-red-400",
  BLOCKED: "text-red-400",
};
```

**5b. Phase icon map.** Add `PHASE_ICON: Record<string, LucideIcon>` to `src/lib/constants.ts`:

| Phase | lucide-react icon |
|-------|-------------------|
| INIT | `Play` |
| QUESTION | `HelpCircle` |
| EXTRACT | `FileText` |
| CONSUME | `BookOpen` |
| INDEX | `Database` |
| ANALYZE | `GitBranch` |
| QUARANTINE | `AlertTriangle` |
| EVALUATE | `DollarSign` |
| VERIFY | `ShieldCheck` |
| SYNTHESIZE | `Layers` |
| BROADCAST | `Radio` |
| LONGITUDINAL | `TrendingUp` |
| AUDIT | `ClipboardList` |

Render icon inline before `r.phase` in each `LogStreamer` row (12×12px, same colour as the phase text).

**5c. Target as drawer link.** Reconstruct the full path from `r.target` and `r.engagement`. The heuristic: try `engagements/<r.engagement>/research_body/02_nodes/<r.target>`, then `outcomes/<phase-map>/<r.target>`. Add a `resolveTargetPath(row: TaggedRow): string | null` helper. If resolved, wrap `r.target` in a `<button>` that calls `openFile(path)`. Style as `underline decoration-dotted text-ink-dim hover:text-emerald`.

**5d. Phase filter.** Add a `<details>` / `<summary>` filter toggle above the log (`summary` label: `phases ▾`). Checkboxes for all 13 phases, all checked by default. Client-filters the in-memory `rows` array before render — no API call.

**Files:** `src/lib/constants.ts` (new), `src/components/dashboard/LogStreamer.tsx`

---

### TASK-06: Verdict Badge + Work Block Tag on Pipeline Cards

**Priority:** HIGH  
**Data:** `ArtifactCard.frontmatter.verdict`, `.work_block`, `.type` (all load-bearing per template schema).

In `PipelineBoard.tsx`, extend the `Card` render:

```ts
export const VERDICT_STYLE: Record<string, string> = {
  PASS:             "border-emerald/60 text-emerald bg-emerald/5",
  "PASS-WITH-NOTES":"border-amber-400/60 text-amber-400 bg-amber-400/5",
  "no-viable-vector":"border-ink-dim/40 text-ink-dim",
  FAIL:             "border-red-400/60 text-red-400 bg-red-400/5",
};
```

If `frontmatter.verdict` is present, render a standalone pill badge (`rounded-full border px-2 py-0.5 font-mono text-[10px]`) above the `status` tag. If `frontmatter.work_block` is present, add a `MonospaceTag` with label `"wb"` and value `"WB-NNN"` (clicking it emits `sensai:open-artifact` custom event — see cross-link task). If `frontmatter.type` is present, add a subtle right-aligned `text-[10px] text-ink-dim` type label in the card header (e.g., `node`, `theory`).

`MonospaceTag` needs a `highlight` prop variant: `border-emerald/40 text-emerald` for active statuses.

**Files:** `src/components/dashboard/PipelineBoard.tsx`, `src/components/ui/MonospaceTag.tsx`, `src/lib/constants.ts`

---

### TASK-07: Quarantine Column + Inbox/Archive Counts

**Priority:** MEDIUM

**7a. Quarantine column.** Add to `PIPELINE` in `src/lib/pipeline.ts` (between `nodes` and `theories`):
```ts
{ key: "quarantine", label: "Quarantine", dir: "research_body/04_quarantine", side: "input", hint: "HITL conflict queue" }
```

In `PipelineBoard.tsx`, add a `isWarning` prop to the `Column` renderer. When `column.key === "quarantine"`, apply `border-amber-400/30` to the column header border and `text-amber-400` to the label. If count > 0, add `text-amber-400 animate-pulse` to the count badge.

In `GlassNav.tsx`, add a quarantine count badge: if `engagements.some(e => e.stages.find(s => s.key === "quarantine")?.count > 0)`, render a `text-[10px] bg-amber-400 text-void rounded-full px-1` badge beside "Explorer".

**7b. Inbox and archive.** Add two additional entries to `PIPELINE` or a separate `PIPELINE_EXTENDED` array (not included in `getPipeline()` Kanban — used only for counts):
```ts
{ key: "inbox",   dir: "research_body/00_inbox",   label: "Inbox" }
{ key: "archive", dir: "research_body/03_archive",  label: "Archive" }
```

Surface these counts in a compact `<aside>` on the engagement detail page: `inbox: 2 PDFs · archive: 5 consumed`. This gives operators the extraction queue and throughput signal without adding more Kanban columns.

**Files:** `src/lib/pipeline.ts`, `src/components/dashboard/PipelineBoard.tsx`, `src/components/ui/GlassNav.tsx`, `src/app/engagements/[id]/page.tsx`

---

### TASK-08: Extend GlobalTelemetry to Full Pipeline + Active Tenant

**Priority:** MEDIUM  
**Data:** All 7 stage counts plus inbox/archive are in `EngagementSummary.stages[]`; `active_engagement` is already resolved.

1. Extend the `GlobalTelemetry` interface:
```ts
interface GlobalTelemetry {
  engagements: number;
  activeEngagement: string | null;  // name of current active tenant
  archived: number;                  // total consumed throughput
  quarantined: number;               // total pending HITL decisions
  nodes: number;
  theories: number;
  economicModels: number;
  verification: number;
  alignment: number;
  broadcast: number;
}
```

2. Update `FsDataSource.getGlobalTelemetry()` in `src/lib/dataSource.ts` to populate all fields.

3. In `GlobalTelemetry.tsx`, render in two rows:
   - **Row 1 (pipeline funnel):** 4 input counters (`inbox` → `archive` → `nodes`) + spacer + 5 output counters (`theories` → `broadcast`), with a `→` glyph connecting them. Input counters in `text-ink-dim`, output counters in `text-emerald`.
   - **Row 2 (health signals):** `quarantined` (amber if > 0), `activeEngagement` (highlighted with emerald pulse dot).

**Files:** `src/lib/types.ts`, `src/lib/dataSource.ts`, `src/components/dashboard/GlobalTelemetry.tsx`

---

### TASK-09: Artifact Sort by Recency + Modified Timestamp on Cards

**Priority:** MEDIUM

1. Add `modified: string | null` to `ArtifactCard`.
2. In `FsDataSource.getPipeline()`, map `e.modified` from `DirEntry` into each card.
3. Sort `cards` by `modified` descending (newest first) before returning.
4. In `PipelineBoard.tsx` `Card`, add a right-aligned `timeAgo(card.modified)` in `font-mono text-[10px] text-ink-dim` in the card footer.

**Files:** `src/lib/types.ts`, `src/lib/dataSource.ts`, `src/components/dashboard/PipelineBoard.tsx`

---

### TASK-10: Cmd+K Command Palette (Global Artifact Search)

**Priority:** MEDIUM

New component `src/components/ui/CommandPalette.tsx`:
- **Trigger:** `Cmd+K` / `Ctrl+K` globally (bound in `layout.tsx` client wrapper).
- **Index:** On open, fetches `/api/engagements`, then for each engagement fetches the pipeline tree directories to build a flat list of `{ path, name, engagement, stage }` entries. Cached for the browser session in a module-level `Map`.
- **Search:** Client-side substring filter on `path` and `name` (case-insensitive). Renders up to 8 results.
- **Action:** Selecting a result calls `openFile(path)` from `useDrawer()`.
- **Style:** `fixed top-[20%] left-1/2 -translate-x-1/2 w-[90vw] max-w-xl z-[70] bg-[#0E1015]/90 backdrop-blur-xl border border-[#2B303B] rounded-xl`. Input: `font-mono text-sm`. Results: each item shows stage chip, artifact name, engagement prefix.
- **Index lazily** — build only on first open, cache in memory.

**Files:** `src/components/ui/CommandPalette.tsx` (new), `src/app/layout.tsx`

---

### TASK-11: Persistent Multi-Turn Chat with Session Storage

**Priority:** HIGH

This is the largest enhancement. The current `SynthesisTerminal` is a single-turn prompt → response loop. This task replaces it with a full conversational interface backed by persistent sessions stored in `app/sessions/`.

#### 11.1 Data Model

Session files live at `app/sessions/<uuid>.json` (within the Next.js app directory, not the harness root). The harness boundary is not crossed.

```ts
// app/sessions/<uuid>.json
interface ChatSession {
  id: string;              // UUID v4
  title: string;           // auto-derived from first user message (first 60 chars)
  engagement: string[];    // engagement ids in scope when session was created
  model: string;           // e.g. "claude-opus-4-8"
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp (updated on each new message)
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;         // UUID v4
  role: "user" | "assistant";
  content: string;    // plain markdown
  timestamp: string;  // ISO
  contextFiles?: number;      // number of artifact files included (user turns only)
  contextTruncated?: boolean; // whether context was truncated (user turns only)
  model?: string;             // model used (assistant turns only)
  tokenEstimate?: number;     // rough estimate from char count (assistant turns only)
}
```

#### 11.2 Server API Routes (write access within `app/`)

Add the following routes under `app/src/app/api/sessions/`:

```
GET  /api/sessions              → { sessions: SessionMeta[] }  (id, title, engagement[], model, createdAt, updatedAt, messageCount)
POST /api/sessions              → { session: ChatSession }      (creates new empty session; body: { engagement[], model, title? })
GET  /api/sessions/[id]         → { session: ChatSession }
POST /api/sessions/[id]/message → { message: ChatMessage }     (appends message; body: ChatMessage)
DELETE /api/sessions/[id]       → 204
```

Implementation: use `node:fs/promises` to read/write `process.cwd()/sessions/<uuid>.json`. Validate session IDs with `/^[0-9a-f-]{36}$/` before any file access. These routes are `runtime = "nodejs"`, NOT sandboxed through `resolveSafe` (they write to the app's own directory, not the harness root).

Create `src/lib/sessionStore.ts` with typed read/write helpers for the sessions directory:
```ts
export const sessionDir = path.join(process.cwd(), "sessions");
```

#### 11.3 Chat UI Component

Replace `SynthesisTerminal` in `src/components/admin/` with a two-panel layout:

**Left panel — Session List (collapsible on mobile):**
- Lists all `SessionMeta` entries, sorted by `updatedAt` descending.
- Each item: session title, engagement chips, model badge, `timeAgo(updatedAt)`.
- "New chat" button (emerald, top of list).
- Delete button (×, right-aligned, confirmation inline).
- Active session highlighted with `border-emerald/40` left border.
- On mobile: hidden by default; accessible via a "chats" button in the page header.

**Right panel — Chat Thread:**

Structure:
1. **Thread header**: engagement scope chips (toggleable) + model selector (`SYNTHESIS_MODELS`) + session title (editable on click).
2. **Message thread** (`overflow-y-auto`, scroll to bottom on new message):
   - User messages: right-aligned, `bg-paper` bubble, `font-mono text-sm`.
   - Assistant messages: left-aligned, `prose-sensai` rendered markdown, no bubble background.
   - Each message: `timeAgo(timestamp)` footer. Assistant messages: model badge + token estimate.
   - Context disclosure (user turns only): collapsed `<details>` showing `{n} artifacts in context` (expandable to show file list).
3. **Input area** (pinned bottom):
   - `<textarea>` (auto-resize, max 6 rows), `Enter` to send, `Shift+Enter` for newline.
   - Send button: `<Send />` icon, disabled when empty or streaming.
   - Stop button: replaces Send during streaming.
   - Context toggle: `<Paperclip />` icon, shows engagement selector popover when clicked. Defaults to all selected engagements from session creation.

**Message sending flow:**
1. User submits prompt.
2. Client appends user `ChatMessage` to local state and POSTs to `/api/sessions/[id]/message`.
3. If context is enabled: call `gatherContext(selectedEngagements)` with progress callback (TASK-08 callback pattern).
4. Call `streamSynthesis()` with full message history as the `messages` array (multi-turn format):
   ```ts
   // Build Anthropic messages array from thread history + new context user message
   const messages = thread.map(m => ({ role: m.role, content: m.content }));
   ```
5. Stream assistant deltas into a transient state variable. On stream completion, POST the complete assistant `ChatMessage` to `/api/sessions/[id]/message`.
6. Update `updatedAt` on the session record.

**Files to create/modify:**
- `src/app/api/sessions/route.ts` (new — GET list, POST create)
- `src/app/api/sessions/[id]/route.ts` (new — GET, DELETE)
- `src/app/api/sessions/[id]/message/route.ts` (new — POST append)
- `src/lib/sessionStore.ts` (new — typed fs helpers)
- `src/lib/types.ts` (add `ChatSession`, `ChatMessage`, `SessionMeta`)
- `src/components/admin/ChatThread.tsx` (new — message list + input)
- `src/components/admin/SessionList.tsx` (new — left panel)
- `src/components/admin/ChatPage.tsx` (new — two-panel layout shell)
- `src/app/admin/page.tsx` (update to render `ChatPage` instead of `SynthesisTerminal`)

#### 11.4 Context Strategy for Multi-Turn

On the first message of a session, gather full artifact context (`gatherContext(engagement[])`). On subsequent messages, do NOT re-gather unless the user toggles "refresh context" (a `<RefreshCw />` icon button in the input area). The full context is baked into the first user message. Subsequent user messages are plain prompts — the model uses its conversation memory. This avoids the 120,000-char budget being consumed on every turn.

System prompt: same as current `SYSTEM_PROMPT` in `SynthesisTerminal`, but extended with the session scope and active tenant context:

```ts
const systemPrompt = `You are the Sensai synthesist. You have read-only access to markdown 
artifacts from the following research engagements: ${selectedEngagements.join(", ")}.
Active tenant: ${activeEngagement ?? "none"}.
Answer questions by synthesizing across the provided context, citing artifact paths 
inline as [[path]]. Be rigorous. If context is insufficient, say so explicitly.
This is an ongoing conversation — you may refer to earlier messages in this thread.`;
```

#### 11.5 Export and Share

On the chat thread header, add:
- **Export MD**: downloads the full session as a single markdown file — system prompt, then each message as a `### User` / `### Sensai` section.
- **Copy last response**: `<Copy />` icon on each assistant message bubble.
- **Export session JSON**: downloads the raw `ChatSession` JSON for archival.

---

### TASK-12: Frontmatter Priority Ordering in Markdown Drawer

**Priority:** LOW

In `MarkdownDrawer.tsx`, replace the flat `frontmatterEntries.map()` with a priority-ordered render:

```ts
const PRIORITY_KEYS = [
  "type", "status", "verdict", "work_block", "model", "phase", "created", "source", "slug"
];
```

Render PRIORITY_KEYS first (in order, omitting absent ones), then remaining keys sorted alphabetically. Apply semantic colour to values:
- `status: "ready"` → `text-emerald`
- `verdict: "PASS"` → `text-emerald`; `"PASS-WITH-NOTES"` → `text-amber-400`; `"FAIL"` → `text-red-400`
- `verdict: "no-viable-vector"` → `text-ink-dim`

These colours must match `VERDICT_STYLE` from `src/lib/constants.ts` (TASK-06) — not duplicated.

**Files:** `src/components/dashboard/MarkdownDrawer.tsx`

---

### TASK-13: Context Assembly Progress in Chat + Synthesis

**Priority:** MEDIUM

Refactor `gatherEngagementContext()` in `src/lib/synthesisContext.ts` to accept:
```ts
onProgress?: (filesDone: number, charsUsed: number, maxFiles: number, maxChars: number) => void
```

In `ChatThread.tsx` and the legacy `SynthesisTerminal.tsx`, render a progress line during gathering:

```
reading artifacts… 12 / 40 files · 48,203 / 120,000 chars
```

Rendered as `font-mono text-xs text-ink-dim` above the `EnsoLoader`. The char count renders as `toLocaleString()` for readability.

**Files:** `src/lib/synthesisContext.ts`, `src/components/admin/ChatThread.tsx`

---

## 4. Implementation Architecture Notes

### Shared Constants File
Create `src/lib/constants.ts` on TASK-05. Import `STATUS_COLOR` and `VERDICT_STYLE` from it in all components — never duplicate these maps.

### Session Directory Initialisation
`src/lib/sessionStore.ts` must call `fs.mkdir(sessionDir, { recursive: true })` on first import so the directory exists before any write. In Docker: `sessions/` is inside the container's `/app` directory (writable); it is **not** under `/harness` (the read-only bind-mount). Add `app/sessions/` to `.dockerignore` is wrong — sessions ARE created inside the container. For persistence across container restarts, add a named volume to `docker-compose.yml`:

```yaml
volumes:
  - ./app/sessions:/app/sessions
```

This bind-mounts `sensai-finder/app/sessions/` from the host into the container, surviving restarts.

### No `any` Types
Every new type must be concrete. The `frontmatter: Record<string, unknown>` boundary is the only permitted dynamic type; all parsed fields (`verdict`, `status`, `work_block`, `type`) should be accessed with `as string | undefined` narrowing.

### Build Gate
`bun run build` must pass TypeScript-clean after each task before proceeding to the next. TASK-11 is the largest and should be implemented in sub-tasks (11.1 API routes → 11.2 SessionList → 11.3 ChatThread → 11.4 context strategy) with a build check between each.

### Anthropic SDK Model IDs
Update `SYNTHESIS_MODELS` in `src/lib/anthropic.ts` to current production IDs per CLAUDE.md:
```ts
export const SYNTHESIS_MODELS = [
  { id: "claude-opus-4-8",   label: "Opus 4.8 (deepest)" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6 (balanced)" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5 (fast)" },
] as const;
```
