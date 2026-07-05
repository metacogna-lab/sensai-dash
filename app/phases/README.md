# Sensai Studio — Build Phases

Sensai Studio is the **read-only observability deck** for the Sensai Compilar harness. It renders the
flat-file engagement ecosystem (`engagements/<name>/…`) as a mobile-first "AgenticOS" dashboard in the
Shunyata UI aesthetic (deep-void dark paper, neuropunk-emerald highlights, legal glassmorphism).

- **Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · bun.
- **Data path:** read-only Next.js Route Handlers + Server Components over native `fs`, sandboxed to
  the harness root (`SENSAI_ROOT`, default the repo root one level above `app/`).
- **Hard boundary:** this deck NEVER mutates the harness, `engagements/`, or telemetry. Every fs read
  passes through one path-sandbox chokepoint; all fs routes are GET-only.

Phases build strictly bottom-up: scaffold → data layer → UI primitives → explorer/home → engagement
Kanban → admin synthesis. Each `phase-NN-*.md` lists its deliverables, files, and a done-check.

| Phase | File | Theme |
| :-- | :-- | :-- |
| 0 | `phase-00-scaffold-plan.md` | Phase docs + error-log dir (this pass) |
| 1 | `phase-01-scaffold-aesthetic.md` | Next.js scaffold + Shunyata theme + nav |
| 2 | `phase-02-data-layer.md` | Sandbox, parser, DataSource, routes |
| 3 | `phase-03-ui-library.md` | PaperCard / GlassTooltip / MonospaceTag / EnsoLoader |
| 4 | `phase-04-explorer-home.md` | FileTree + drawer + AgenticOS home |
| 5 | `phase-05-engagement-explorer.md` | Kanban pipeline board |
| 6 | `phase-06-admin-synthesis.md` | Client-side Anthropic synthesis portal |
