# Phase 3 — Core UI Library (Shunyata primitives)

**Goal:** The reusable neo-brutalist components; motion via Framer Motion.

## Deliverables
- `PaperCard` — `bg-paper border border-border shadow-none`; unfocused `opacity-60`, hover/tap/focus
  `opacity-100` at 0ms; ≥44px hit area; optional `stacked` overlap variant.
- `GlassTooltip` — Framer Motion popover, legal-glass styling (`bg-glass backdrop-blur-xl`, 0.5px
  emerald top-border); opens on hover AND tap (mobile); renders arbitrary metadata rows.
- `MonospaceTag` — JetBrains-Mono badge for a `key: value` frontmatter pair; status values color-mapped
  (e.g. `ready`/`active` → emerald), unknown keys render neutral (frontmatter-driven, no hardcoding).
- `EnsoLoader` — animated SVG Enso circle stroke-drawing in emerald (Framer Motion `pathLength`),
  sizes `sm|md|lg`, used for all async/synthesis loading states.

## Files
`app/src/components/ui/{PaperCard,GlassTooltip,MonospaceTag,EnsoLoader}.tsx`.

**Done when:** a scratch page renders each primitive; tooltip opens on tap; Enso animates.
