# TASK-07: Quarantine Column + Inbox/Archive Counts

**Priority:** MEDIUM  
**Status:** PENDING  
**Depends on:** None  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

Surface two currently invisible harness signals:
- **Quarantine**: `research_body/04_quarantine/` is the HITL conflict queue. Non-empty = a human decision is blocked. Must appear in the Kanban with a warning visual.
- **Inbox / Archive**: `00_inbox` (extraction queue) and `03_archive` (consumed throughput) are not in the pipeline registry. Surface as counts on the engagement detail page sidebar.

---

## Context

`src/lib/pipeline.ts` defines `PIPELINE` — the array of registered stage objects. Currently 7 stages. The Kanban in `PipelineBoard.tsx` iterates this array to render columns.

Harness directories not yet registered:
- `research_body/04_quarantine` — HITL queue; operator must resolve conflicts before pipeline can continue
- `research_body/03_archive` — consumed raw files; count = throughput signal
- `research_body/00_inbox` — binary sources awaiting `/extract`; count = extraction queue depth

---

## Implementation

### 7a: Quarantine Column — `src/lib/pipeline.ts`

Add a quarantine entry to `PIPELINE` between `nodes` and `theories`:

```ts
{
  key:   "quarantine",
  label: "Quarantine",
  dir:   "research_body/04_quarantine",
  side:  "input" as const,
  hint:  "HITL conflict queue — resolve before pipeline can continue",
}
```

Ensure the `PipelineStage` type has a `hint?: string` field (add if absent).

### 7a: Warning Styling in `PipelineBoard.tsx`

Pass `isWarning: boolean` to the `Column` renderer. Set `isWarning = column.key === "quarantine" && column.cards.length > 0`.

When `isWarning`:
- Column header border: replace `border-edge/30` with `border-amber-400/30`
- Column label: `text-amber-400`
- Count badge: `bg-amber-400/20 text-amber-400 animate-pulse`
- Column background tint: `bg-amber-400/3` (very subtle)

When `isWarning` and count = 0:
- Render the column normally (dim, no warning) — zero quarantine is healthy state.

### 7a: Global Nav Quarantine Badge — `src/components/ui/GlassNav.tsx`

Accept a `quarantineCount: number` prop. When > 0, render a badge beside "Explorer" nav link:

```tsx
{quarantineCount > 0 && (
  <span className="ml-1 rounded-full bg-amber-400 px-1 font-mono text-[10px] text-void">
    {quarantineCount}
  </span>
)}
```

In the layout/page that renders `GlassNav`, derive `quarantineCount` from the global telemetry or engagement summaries. Sum `stages.find(s => s.key === "quarantine")?.count ?? 0` across all engagements.

### 7b: Inbox/Archive Sidebar — `src/lib/pipeline.ts`

Add a `PIPELINE_SIDEBAR` export (not included in the main Kanban, used only for counts):

```ts
export const PIPELINE_SIDEBAR = [
  { key: "inbox",   label: "Inbox",   dir: "research_body/00_inbox",   hint: "Sources awaiting /extract" },
  { key: "archive", label: "Archive", dir: "research_body/03_archive",  hint: "Consumed source files (throughput)" },
] as const;
```

In `FsDataSource.getEngagement(id)` (or `getPipeline(id)`), fetch counts for `inbox` and `archive` directories and include them in the response. Add `sidebarCounts: { inbox: number; archive: number }` to `EngagementSummary` (or return alongside `getPipeline`).

### 7b: Sidebar Render — `src/app/engagements/[id]/page.tsx`

Below the `RunStatusMatrix` (TASK-03) and above the Kanban, add a compact aside:

```tsx
<aside className="flex gap-4 font-mono text-xs text-ink-dim">
  <span>
    inbox: <span className={inboxCount > 0 ? "text-ink" : ""}>{inboxCount}</span>
    {inboxCount > 0 && " PDFs queued"}
  </span>
  <span className="text-ink-dim/30">·</span>
  <span>
    archive: <span className="text-emerald/70">{archiveCount}</span> consumed
  </span>
</aside>
```

---

## Acceptance Criteria

- [ ] Quarantine Kanban column added between nodes and theories
- [ ] Non-empty quarantine column shows amber border, amber label, pulsing count badge
- [ ] Empty quarantine column renders normally (no warning visual)
- [ ] Nav shows amber count badge beside "Explorer" when any engagement has quarantined files
- [ ] Engagement detail page shows inbox and archive counts in compact aside
- [ ] Inbox count > 0 renders in `text-ink` (not dim); archive count renders in `text-emerald/70`
- [ ] `PIPELINE_SIDEBAR` export present in `src/lib/pipeline.ts`
- [ ] `bun run build` passes TypeScript-clean
