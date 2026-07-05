# Phase 6 — Admin Synthesis Portal (The Forge)

**Goal:** Client-side cross-tenant synthesis over the flat files. Key never touches our server.

## Deliverables
- `KeyGate` — prompts for `ANTHROPIC_API_KEY`, stored ONLY in `sessionStorage`; masked input; clearable.
- `SynthesisTerminal` — conversational input; on submit, client reads selected engagements' `.md`
  (via `/api/file`+`/api/tree`), packs context, and calls `lib/anthropic.ts` directly from the browser.
  Streams the response into a copyable/exportable "Synthesis Document". `EnsoLoader` during the fetch.
- `lib/anthropic.ts` — CLIENT-ONLY fetch to `api.anthropic.com` with
  `anthropic-dangerous-direct-browser-access`; key sourced from sessionStorage; never posted to,
  or logged by, the Next.js server. Latest model id from CLAUDE.md guidance.
- `src/app/admin/page.tsx` — `'use client'`, composes `KeyGate` → `SynthesisTerminal`.

## Safeguards (PRD §5.4)
- No route handler receives the key. Verify via network tab: only `api.anthropic.com` sees it.
- Read-only boundary intact — synthesis only reads engagement files, never writes.

## Files
`app/src/app/admin/page.tsx`, `app/src/components/admin/{KeyGate,SynthesisTerminal}.tsx`,
`app/src/lib/anthropic.ts`.

**Done when:** no key → gate; with key → a query streams a synthesis doc; server never sees the key.
