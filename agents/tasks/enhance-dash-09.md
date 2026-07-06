# TASK-09: Artifact Sort by Recency + Modified Timestamp on Cards

**Priority:** MEDIUM  
**Status:** PENDING  
**Depends on:** None  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

Pipeline artifact cards currently render in filesystem order. Sort them newest-first using the file modification timestamp, and surface a relative time (`timeAgo`) on each card footer.

---

## Context

`DirEntry` from `FsDataSource.getTree()` already carries a `modified` field (ISO string or null) from `fs.stat().mtime`. This value is available when building `ArtifactCard[]` in `getPipeline()`, but it is not currently included in `ArtifactCard` and not used for sorting.

`ArtifactCard` shape today:
```ts
interface ArtifactCard {
  name: string;
  path: string;
  frontmatter: Record<string, unknown>;
}
```

`timeAgo` is either already implemented in `src/lib/markdown.ts` (check first) or needs a small helper.

---

## Implementation

### Step 1: Extend `ArtifactCard` — `src/lib/types.ts`

```ts
interface ArtifactCard {
  name: string;
  path: string;
  frontmatter: Record<string, unknown>;
  modified: string | null;   // ISO timestamp from fs.stat().mtime
}
```

### Step 2: Populate and sort — `src/lib/dataSource.ts`

In `getPipeline(id)`, when building each stage's `cards` array:

1. Include `modified: entry.modified ?? null` from the `DirEntry`.
2. Sort the `cards` array descending by `modified` before returning:

```ts
cards.sort((a, b) => {
  if (!a.modified && !b.modified) return 0;
  if (!a.modified) return 1;
  if (!b.modified) return -1;
  return new Date(b.modified).getTime() - new Date(a.modified).getTime();
});
```

Cards with no `modified` date sort to the bottom.

### Step 3: `timeAgo` helper — `src/lib/markdown.ts`

Check if `timeAgo` already exists. If not, add:

```ts
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)   return "just now";
  if (minutes < 60)  return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)      return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}
```

### Step 4: Card footer timestamp — `src/components/dashboard/PipelineBoard.tsx`

In the `Card` component, add a right-aligned footer line:

```tsx
{card.modified && (
  <p className="mt-1 text-right font-mono text-[10px] text-ink-dim">
    {timeAgo(card.modified)}
  </p>
)}
```

This appears below the verdict badge (TASK-06) and status tag.

---

## Acceptance Criteria

- [ ] `ArtifactCard.modified` field present in type definition and populated from `DirEntry.modified`
- [ ] Cards within each Kanban column are sorted newest-first (by `modified` descending)
- [ ] Cards with no `modified` sort to the bottom of their column
- [ ] Each card with a `modified` date shows `timeAgo(card.modified)` in the footer
- [ ] `timeAgo` function exists in `src/lib/markdown.ts` (created if absent)
- [ ] `bun run build` passes TypeScript-clean
