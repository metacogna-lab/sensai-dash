# TASK-04: Milestone Progress on Engagement Cards

**Priority:** HIGH  
**Status:** PENDING  
**Depends on:** None  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

Parse `goals/active_milestones.md` from each engagement to extract a completion ratio, then display a milestone progress indicator on each engagement card.

---

## Context

`goals/active_milestones.md` is a GFM task list. Example:

```markdown
- [x] Consume all Phase 1 raw sources
- [x] Index nodes into corpus map
- [ ] Complete economic model evaluation
- [ ] Run verification pass
- [ ] Synthesize final alignment doc
```

The completion ratio is computable as: count lines matching `- [x]` (done) vs total matching `- [x]` or `- [ ]`. No external parser needed — simple regex on the `body` string.

This data is not currently in `EngagementSummary` — it requires a new field and a new fetch inside `FsDataSource.listEngagements()`.

---

## Implementation

### Step 1: Type extension — `src/lib/types.ts`

Add to `EngagementSummary`:

```ts
milestones: { done: number; total: number } | null;
```

`null` = file does not exist or could not be parsed.

### Step 2: Data fetch helper — `src/lib/dataSource.ts`

Add a private helper `parseMilestones(id: string): Promise<{ done: number; total: number } | null>`:

```ts
private async parseMilestones(id: string) {
  try {
    const file = await this.readMarkdown(`engagements/${id}/goals/active_milestones.md`);
    if (!file) return null;
    const done = (file.body.match(/^\s*-\s*\[x\]/gim) ?? []).length;
    const pending = (file.body.match(/^\s*-\s*\[\s\]/gm) ?? []).length;
    const total = done + pending;
    return total > 0 ? { done, total } : null;
  } catch {
    return null;
  }
}
```

Call this inside `listEngagements()` for each engagement and include in the returned `EngagementSummary`. Run milestone fetches in parallel with `Promise.all` — one per engagement.

### Step 3: Card render — `src/components/dashboard/EngagementGrid.tsx`

In the card footer, when `engagement.milestones` is non-null:

```tsx
{engagement.milestones && (
  <div className="relative mt-1">
    <div
      className="absolute inset-0 rounded-sm bg-emerald/20"
      style={{ width: `${(engagement.milestones.done / engagement.milestones.total) * 100}%` }}
    />
    <p className="relative font-mono text-[10px] text-ink-dim px-1">
      {engagement.milestones.done}/{engagement.milestones.total} milestones
    </p>
  </div>
)}
```

The inline progress track is an absolutely positioned emerald tint behind the text — same height as the text line, no separate element needed. The text sits on top via `relative`.

---

## Acceptance Criteria

- [ ] `EngagementSummary.milestones` field present in TypeScript types and API response
- [ ] Engagement cards show `N/M milestones` when file exists and has checkboxes
- [ ] Inline progress track (emerald tint) behind the milestone text
- [ ] Cards where `active_milestones.md` is absent or has no task items show nothing (no error)
- [ ] Milestone fetches run in parallel (no sequential waterfall per engagement)
- [ ] `bun run build` passes TypeScript-clean
