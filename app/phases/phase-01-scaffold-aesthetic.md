# Phase 1 — Scaffold & Aesthetic

**Goal:** A booting Next.js App Router project inside `app/` wearing the Shunyata theme.

## Deliverables
- `bun create next-app` in `app/` — App Router, TypeScript, Tailwind, `src/` dir, ESLint.
- `tailwind.config.ts` extended with Shunyata tokens:
  - `void #0E1015`, `paper #181B21`, `border #2B303B`, `emerald #00FF9D`, `glass rgba(14,16,21,.6)`.
  - fonts: `sans` → Inter/Geist, `mono` → JetBrains Mono.
- `src/app/globals.css` — void background, emerald selection, CSS vars mirroring the tokens.
- `src/app/layout.tsx` — `<html class="dark">`, font wiring via `next/font`, and a `GlassNav`
  (glassmorphic bottom-fixed on mobile, top on desktop; links Home / Explorer / Admin; ≥44px targets).
- `.env.example` documenting `SENSAI_ROOT`.

## Files
`app/package.json`, `app/tailwind.config.ts`, `app/src/app/{layout.tsx,globals.css}`,
`app/src/components/ui/GlassNav.tsx`.

**Done when:** `bun run dev` serves a void-black page with the glass nav at `localhost:3000`.
