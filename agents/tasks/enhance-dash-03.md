# TASK-03: Run Status Matrix on Engagement Detail Page

**Priority:** HIGH  
**Status:** PENDING  
**Depends on:** None  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

Parse the 11-row Run Status table from each engagement's `INDEX.md` and render it as a compact phase matrix above the Kanban board on the engagement detail page. This is the most operationally dense artifact in the harness — it shows queue sizes, done counts, and blockers for all 11 pipeline phases.

---

## Context

Every `engagements/<id>/INDEX.md` contains a markdown table that looks like:

```markdown
| Phase | Command | Agent (model) | Queue | Done | Blockers |
|-------|---------|---------------|-------|------|----------|
| QUESTION | `/question` | strategist (fable) | — | 0 | Awaiting stated outcome |
| EXTRACT  | `/extract`  | — | 0 | 0 | None |
| CONSUME  | `/consume`  | consumer (haiku) | 0 raw | 1 | None |
| INDEX    | `/index`    | indexer (sonnet) | — | 0 | None |
...
```

This table has 11 rows: QUESTION, EXTRACT, CONSUME, INDEX, ANALYZE, QUARANTINE, EVALUATE, VERIFY, SYNTHESIZE, BROADCAST, LONGITUDINAL, AUDIT.

The `GET /api/file?path=engagements/<id>/INDEX.md` route returns a `ParsedFile` with `body` (raw markdown string) and `frontmatter`. The body parsing must happen in the component.

---

## Implementation

### New Component: `src/components/dashboard/RunStatusMatrix.tsx`

This is a **server component** (no `"use client"` directive). Accepts `engagementId: string`.

```ts
interface RunStatusRow {
  phase: string;
  command: string;
  agent: string;
  queue: string;
  done: number;
  blockers: string;
}
```

**Parsing logic** (pure function, extract to `src/lib/parseRunStatus.ts`):

```ts
export function parseRunStatusTable(body: string): RunStatusRow[] {
  const lines = body.split("\n");
  const headerIdx = lines.findIndex((l) => /\|\s*Phase\s*\|/i.test(l));
  if (headerIdx === -1) return [];
  // skip header and separator row
  return lines
    .slice(headerIdx + 2)
    .filter((l) => l.trim().startsWith("|") && l.trim().endsWith("|"))
    .map((l) => {
      const cells = l.split("|").map((c) => c.trim()).filter(Boolean);
      return {
        phase:    cells[0] ?? "",
        command:  cells[1] ?? "",
        agent:    cells[2] ?? "",
        queue:    cells[3] ?? "—",
        done:     parseInt(cells[4] ?? "0", 10) || 0,
        blockers: cells[5] ?? "None",
      };
    })
    .filter((r) => r.phase.length > 0);
}
```

**Render:**

- Container: `overflow-x-auto rounded-lg border border-edge/30 font-mono text-xs`
- Column layout: phase (120px fixed), command (90px), done (40px), queue (50px), blockers (fill)
- Row colouring:
  - `done > 0` → phase cell: `text-emerald`
  - `blockers !== "None" && blockers !== "—"` → blockers cell: `text-amber-400`
  - `queue` contains a digit > 0 → queue cell: `text-ink` (work pending)
  - zero-done, no blockers → all cells: `text-ink-dim`
- Clicking a row where `done > 0`: emit `sensai:jump-stage` custom event with `{ phase }` detail — `PipelineBoard` listens and scrolls the matching column into view.

### Integration in `src/app/engagements/[id]/page.tsx`

Import and render `RunStatusMatrix` **above** the `<PipelineBoard>` section:

```tsx
<section aria-label="Run Status">
  <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-dim">
    Run Status
  </h2>
  <RunStatusMatrix engagementId={id} />
</section>
```

Data fetch: inside `RunStatusMatrix`, call `dataSource.readFile(\`engagements/${engagementId}/INDEX.md\`)` server-side, parse with `parseRunStatusTable`, render the table.

---

## Acceptance Criteria

- [ ] Run Status table appears above Kanban on engagement detail page
- [ ] All 11 phases rendered (missing phases render as empty row, no crash)
- [ ] Done > 0 rows show emerald phase name
- [ ] Non-"None" blockers text renders amber
- [ ] Queue cells with numeric content render in `text-ink` (not dim)
- [ ] Clicking a done > 0 row emits `sensai:jump-stage` event
- [ ] Empty INDEX.md or missing table → component renders nothing (no error)
- [ ] `bun run build` passes TypeScript-clean
