# TASK-08: Extend GlobalTelemetry to Full Pipeline + Active Tenant

**Priority:** MEDIUM  
**Status:** PENDING  
**Depends on:** TASK-07 (adds inbox/archive counts to stage data)  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

The home-screen `GlobalTelemetry` widget currently shows only 4 numbers (engagements, nodes, theories, economicModels). Extend it to cover all 7 output stages, plus inbox/archive throughput, quarantine health, and the active tenant name.

---

## Context

Current `GlobalTelemetry` interface (`src/lib/types.ts`):
```ts
interface GlobalTelemetry {
  engagements: number;
  nodes: number;
  theories: number;
  economicModels: number;
}
```

All missing counts are already computed per-engagement in `EngagementSummary.stages[]`. The sum across all engagements is a single reduce pass — no new filesystem reads needed.

`FsDataSource.getGlobalTelemetry()` in `src/lib/dataSource.ts` currently fetches all engagements and sums from their stage arrays. It just needs to be extended.

---

## Implementation

### Step 1: Extend `GlobalTelemetry` — `src/lib/types.ts`

```ts
interface GlobalTelemetry {
  engagements: number;
  activeEngagement: string | null;  // value from operations/.active_engagement
  nodes: number;
  theories: number;
  economicModels: number;
  verification: number;
  alignment: number;
  broadcast: number;
  archived: number;       // sum of research_body/03_archive counts (throughput)
  quarantined: number;    // sum of research_body/04_quarantine counts (HITL backlog)
}
```

### Step 2: Populate all fields — `src/lib/dataSource.ts`

In `getGlobalTelemetry()`, after fetching all `EngagementSummary[]`:

```ts
const sum = (key: string) =>
  engagements.reduce(
    (acc, e) => acc + (e.stages.find((s) => s.key === key)?.count ?? 0),
    0
  );

return {
  engagements: engagements.length,
  activeEngagement: engagements.find((e) => e.active)?.id ?? null,
  nodes:          sum("nodes"),
  theories:       sum("theories"),
  economicModels: sum("economic"),
  verification:   sum("verification"),
  alignment:      sum("alignment"),
  broadcast:      sum("broadcast"),
  archived:       sum("archive"),      // requires TASK-07 to add "archive" stage
  quarantined:    sum("quarantine"),   // requires TASK-07 to add "quarantine" stage
};
```

If TASK-07 is not yet complete, `archived` and `quarantined` will sum to 0 (safe fallback — `sum()` returns 0 when key not found).

### Step 3: Re-render `GlobalTelemetry.tsx`

Replace the current flat row with a two-row layout:

**Row 1 — Pipeline funnel** (left = input, right = output, `→` separating them):

```tsx
<div className="flex items-center gap-2 font-mono text-xs">
  {/* Input side */}
  <Metric label="inbox"   value={t.archived + t.nodes} dim />
  <span className="text-ink-dim/40">→</span>
  <Metric label="nodes"   value={t.nodes} />
  <span className="text-ink-dim/40 mx-1">▸</span>
  {/* Output side */}
  <Metric label="theories"  value={t.theories}       emerald={t.theories > 0} />
  <Metric label="models"    value={t.economicModels}  emerald={t.economicModels > 0} />
  <Metric label="verified"  value={t.verification}    emerald={t.verification > 0} />
  <Metric label="aligned"   value={t.alignment}       emerald={t.alignment > 0} />
  <Metric label="broadcast" value={t.broadcast}       emerald={t.broadcast > 0} />
</div>
```

**Row 2 — Health signals:**

```tsx
<div className="flex items-center gap-3 font-mono text-xs text-ink-dim">
  {t.quarantined > 0 && (
    <span className="text-amber-400">
      ⚠ {t.quarantined} quarantined
    </span>
  )}
  {t.activeEngagement && (
    <span className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
      {t.activeEngagement}
    </span>
  )}
  <span className="text-ink-dim/40">{t.archived} consumed</span>
</div>
```

`Metric` is a local presentational component: `{ label: string; value: number; emerald?: boolean; dim?: boolean }` — renders `value` in the appropriate colour above a `text-[10px]` `label`.

---

## Acceptance Criteria

- [ ] `GlobalTelemetry` interface has all 9 fields (including `activeEngagement`, `quarantined`, `archived`)
- [ ] `getGlobalTelemetry()` populates all fields from existing stage data (no extra FS reads beyond what `listEngagements()` already does)
- [ ] Home-screen widget shows two-row layout: funnel row + health row
- [ ] Output stage metrics render in emerald when count > 0
- [ ] Quarantine count renders amber and only appears when > 0
- [ ] Active engagement renders with pulse dot in health row
- [ ] `bun run build` passes TypeScript-clean
