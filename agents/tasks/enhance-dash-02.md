# TASK-02: Active Tenant Banner on Home Screen

**Priority:** HIGH  
**Status:** PENDING  
**Depends on:** None  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

Surface the active harness tenant (`operations/.active_engagement`) prominently on the home screen and navigation bar. An operator switching between engagements from the CLI must immediately see which tenant the pipeline will write to.

---

## Context

`FsDataSource.listEngagements()` already reads `operations/.active_engagement` and sets `EngagementSummary.active = true` on the matching engagement. The `GET /api/engagements` response already carries this field. The data is available — it is just not rendered at the home/global level.

Current rendering: `active` is only shown as a small tag inside the engagement detail page header (`engagements/[id]/page.tsx`). The home page and nav have no awareness of the active tenant.

---

## Implementation

### 2a. Home Screen Banner

**File:** `src/app/page.tsx`

Above the `<EngagementGrid>`, find the active engagement from the fetched list and render a full-width aside when one exists:

```tsx
const activeEngagement = engagements.find((e) => e.active);

{activeEngagement && (
  <aside className="flex items-center gap-3 rounded-lg border border-emerald/20 bg-emerald/5 px-4 py-2.5 font-mono text-xs">
    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald shadow-[0_0_6px_var(--color-emerald)]" />
    <span className="text-ink-dim">active tenant</span>
    <span className="text-emerald font-semibold">{activeEngagement.id}</span>
    {activeEngagement.focus && (
      <>
        <span className="text-ink-dim/40">·</span>
        <span className="text-ink-dim">{activeEngagement.focus}</span>
      </>
    )}
    {activeEngagement.recentlyActive && (
      <>
        <span className="text-ink-dim/40">·</span>
        <span className="text-emerald/70">recently active</span>
      </>
    )}
  </aside>
)}
```

Place the aside **before** the engagement grid, after any page header.

### 2b. Navigation Breadcrumb

**File:** `src/components/ui/GlassNav.tsx`

The nav currently renders a static logo or `sensai / studio` text. Modify it to accept the active engagement ID and display a dynamic breadcrumb:

1. Make `GlassNav` accept an optional `activeEngagementId?: string` prop.
2. In `src/app/layout.tsx` (or the root page if nav is rendered there), fetch the active engagement and pass it down.
3. In `GlassNav`, render:
   ```tsx
   <span className="font-mono text-xs text-ink-dim">
     sensai
     {activeEngagementId && (
       <>
         <span className="mx-1 opacity-40">/</span>
         <span className="text-emerald">{activeEngagementId}</span>
       </>
     )}
   </span>
   ```

**Note:** If `GlassNav` is a server component, the active engagement fetch can happen in the parent layout. If it is a client component, lift the prop from the server boundary above it.

---

## Acceptance Criteria

- [ ] Home page shows an emerald-bordered aside banner when any engagement has `active: true`
- [ ] Banner shows: pulse dot · "active tenant" label · engagement id (emerald) · focus text (if present)
- [ ] Nav displays `sensai / <activeId>` instead of static text when active engagement is known
- [ ] When no engagement is active, banner is absent and nav shows `sensai` only
- [ ] `bun run build` passes TypeScript-clean
