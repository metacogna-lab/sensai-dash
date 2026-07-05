# Phase 5 — Engagement Explorer (Pipeline Kanban)

**Goal:** Drill-down per-engagement pipeline view, mobile-swipeable.

## Deliverables
- `src/app/engagements/[id]/page.tsx` — resolves the tenant, loads each pipeline stage's dir via
  `dataSource`, guards unknown ids (404-style empty state).
- `PipelineBoard` — horizontal columns generated from `lib/pipeline.ts` registry (Raw / Nodes /
  Theories / Econ Models / …). `snap-x snap-mandatory overflow-x-auto` for iPhone swiping; each card
  is a `PaperCard` with a `GlassTooltip` (model, Work Block, status from frontmatter).
- Reuse `MarkdownDrawer` — tapping any card opens the artifact.
- Header strip: engagement name, INDEX.md `current_focus`, last checkpoint, pulse dot.

## Files
`app/src/app/engagements/[id]/page.tsx`, `app/src/components/dashboard/PipelineBoard.tsx`.

**Done when:** `/engagements/compilar` shows `node--demo-corpus.md` under **Nodes**; card tap opens
the drawer; columns snap-scroll at 390px width.
