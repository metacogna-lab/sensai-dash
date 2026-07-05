# Phase 4 — Directory Explorer Core + AgenticOS Home

**Goal:** The literal "move through the file system" browser, plus the home dashboard.

## Deliverables
- `FileTree` (client) — collapsible tree fed by `/api/tree`, lazy-drills on expand, sandbox-safe paths;
  selecting a file opens `MarkdownDrawer`.
- `MarkdownDrawer` — Framer Motion slide-out (90% vw mobile / 40% desktop) over a scrim; fetches
  `/api/file`, renders body via `lib/markdown`, frontmatter as `MonospaceTag` row. Esc/scrim closes.
- Home `src/app/page.tsx` (Server Component):
  - `GlobalTelemetry` — aggregate counters (Total Nodes / Theories / Economic Models) from `/api/engagements` data.
  - `EngagementGrid` — masonry of `PaperCard`s (one per tenant): name, last Work Block, raw-vs-outcome
    progress bar, emerald `animate-pulse` dot if `execution.log` touched < 24h.
  - `LogStreamer` — collapsible IDE-style monospace terminal polling `/api/log`, newest first.

## Files
`app/src/components/dashboard/{FileTree,MarkdownDrawer,GlobalTelemetry,EngagementGrid,LogStreamer}.tsx`,
`app/src/lib/markdown.ts`, `app/src/app/page.tsx`.

**Done when:** home renders both tenants with live counts; a node opens in the drawer with rendered md.
