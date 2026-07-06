# TASK-01: Per-Stage Sparkbar on Engagement Cards

**Priority:** HIGH  
**Status:** PENDING  
**Depends on:** None  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

Replace the current 2-segment progress bar in `EngagementGrid.tsx` with a 7-segment micro-sparkbar that exposes all individual pipeline stage counts already present in the API response.

---

## Context

`GET /api/engagements` returns `EngagementSummary[]`. Each summary already contains:

```ts
stages: StageCount[]  // 7 entries — one per registered pipeline stage
```

The 7 stages in order (from `src/lib/pipeline.ts`):

| # | key | dir | side |
|---|-----|-----|------|
| 1 | raw | research_body/01_raw | input |
| 2 | nodes | research_body/02_nodes | input |
| 3 | theories | outcomes/01_theories | output |
| 4 | economic | outcomes/02_economic_models | output |
| 5 | verification | outcomes/03_verification | output |
| 6 | alignment | outcomes/04_alignment | output |
| 7 | broadcast | outcomes/05_broadcast | output |

Currently `stages[i].count` is collapsed into two numbers for a generic 2-bar. All per-stage granularity is discarded.

---

## Implementation

**File:** `src/components/dashboard/EngagementGrid.tsx`

### 7-Segment Sparkbar

Replace the existing progress bar with a `flex` row of 7 segments inside a `h-1.5` container:

- Each segment's width is proportional to its count vs the maximum count across all 7 stages for this engagement (use `Math.max(1, ...stages.map(s => s.count))` as denominator to avoid division by zero).
- Input-side stages (`side === "input"`: raw, nodes): render `bg-edge` (non-zero) or `bg-edge/20` (zero).
- Output-side stages (`side === "output"`: theories → broadcast): render `bg-emerald/60` (non-zero) or `bg-emerald/10` (zero). A non-zero output stage with count ≥ 1 steps up to `bg-emerald`.
- Add `min-w-[2px]` to each segment so zero-count stages are still visible as a sliver.
- Each segment gets `title={\`${stage.label}: ${stage.count}\`}` for hover tooltip.

```tsx
<div className="flex h-1.5 w-full gap-0.5">
  {stages.map((stage) => {
    const pct = stage.count / maxCount;
    const isInput = stage.side === "input";
    const color = isInput
      ? stage.count > 0 ? "bg-edge" : "bg-edge/20"
      : stage.count > 0 ? "bg-emerald" : "bg-emerald/10";
    return (
      <div
        key={stage.key}
        className={`min-w-[2px] rounded-sm ${color}`}
        style={{ flex: Math.max(pct, 0.05) }}
        title={`${stage.label}: ${stage.count}`}
      />
    );
  })}
</div>
```

### Count Legend Line

Below the sparkbar, render a single line of 7 monospace counts separated by `·`:

```tsx
<p className="font-mono text-[10px] text-ink-dim">
  {stages.map((stage, i) => (
    <span key={stage.key}>
      {i > 0 && <span className="mx-0.5 opacity-40">·</span>}
      <span className={stage.side === "output" && stage.count > 0 ? "text-emerald" : ""}>
        {stage.count}
      </span>
    </span>
  ))}
</p>
```

---

## Acceptance Criteria

- [ ] 7 distinct coloured segments visible on each engagement card
- [ ] Input segments use `bg-edge` palette; output segments use `bg-emerald` palette
- [ ] Count legend line shows `0 · 1 · 0 · 0 · 0 · 0 · 0` with zero-count segments in dim ink
- [ ] Non-zero output counts render in `text-emerald`
- [ ] Hover tooltip on each segment shows `label: count`
- [ ] `bun run build` passes TypeScript-clean
