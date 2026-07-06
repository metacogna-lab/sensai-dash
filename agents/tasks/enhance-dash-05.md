# TASK-05: Log Full-Coverage — Status Colours, Phase Icons, Target Links, Phase Filter

**Priority:** HIGH  
**Status:** PENDING  
**Depends on:** None (creates `src/lib/constants.ts` — TASK-06 and TASK-12 import from it)  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

The log streamer (`LogStreamer.tsx`) renders all 13 phases and 5 status values identically. This task adds:
- Full status colour coverage for all 5 status values
- Phase icons for all 13 canonical phases
- Clickable target links that open the artifact in the file drawer
- Client-side phase filter toggle

---

## Context

`LogRow` shape:
```ts
interface LogRow {
  timestamp: string;
  phase: string;       // 13 values: INIT QUESTION EXTRACT CONSUME INDEX ANALYZE
                       // QUARANTINE EVALUATE VERIFY SYNTHESIZE BROADCAST LONGITUDINAL AUDIT
  workBlock: string;   // "WB-001"
  target: string;      // harness-root-relative artifact path or filename
  status: string;      // SUCCESS | FAIL | EDIT | GATED | GATED-OVERRIDE
}
```

`LogStreamer.tsx` is a client component — it already receives `rows: LogRow[]` from a server fetch. The file drawer is opened via a hook (likely `useDrawer()` or a context with `openFile(path: string)`).

---

## Implementation

### Step 1: Create `src/lib/constants.ts`

This file is the single source of truth for all colour and icon maps shared across components. Other tasks (TASK-06, TASK-12) import from here — never duplicate.

```ts
import type { LucideIcon } from "lucide-react";
import {
  Play, HelpCircle, FileText, BookOpen, Database, GitBranch,
  AlertTriangle, DollarSign, ShieldCheck, Layers, Radio,
  TrendingUp, ClipboardList,
} from "lucide-react";

export const STATUS_COLOR: Record<string, string> = {
  SUCCESS:          "text-emerald",
  PASS:             "text-emerald",
  EDIT:             "text-amber-400",
  GATED:            "text-red-500",
  "GATED-OVERRIDE": "text-orange-400",
  FAIL:             "text-red-400",
  BLOCKED:          "text-red-400",
};

export const PHASE_ICON: Record<string, LucideIcon> = {
  INIT:         Play,
  QUESTION:     HelpCircle,
  EXTRACT:      FileText,
  CONSUME:      BookOpen,
  INDEX:        Database,
  ANALYZE:      GitBranch,
  QUARANTINE:   AlertTriangle,
  EVALUATE:     DollarSign,
  VERIFY:       ShieldCheck,
  SYNTHESIZE:   Layers,
  BROADCAST:    Radio,
  LONGITUDINAL: TrendingUp,
  AUDIT:        ClipboardList,
};

export const VERDICT_STYLE: Record<string, string> = {
  PASS:              "border-emerald/60 text-emerald bg-emerald/5",
  "PASS-WITH-NOTES": "border-amber-400/60 text-amber-400 bg-amber-400/5",
  "no-viable-vector":"border-ink-dim/40 text-ink-dim",
  FAIL:              "border-red-400/60 text-red-400 bg-red-400/5",
  viable:            "border-emerald/60 text-emerald bg-emerald/5",
};
```

### Step 2: Status colour and phase icons in `LogStreamer.tsx`

Import `STATUS_COLOR` and `PHASE_ICON` from `src/lib/constants.ts`.

For each row:
- Status cell: `className={STATUS_COLOR[row.status] ?? "text-ink-dim"}`
- Phase cell: look up `PHASE_ICON[row.phase]`, render as `<Icon className="inline h-3 w-3 mr-1" />` before the phase text label. Icon uses the same colour class as the phase text.

### Step 3: Target as drawer link

Add a `resolveTargetPath(row: LogRow): string | null` helper (in `src/lib/logHelpers.ts`, new file):

```ts
// Maps phase names to the pipeline directory containing their output artifacts
const PHASE_DIR: Record<string, string> = {
  CONSUME:    "research_body/02_nodes",
  ANALYZE:    "outcomes/01_theories",
  EVALUATE:   "outcomes/02_economic_models",
  VERIFY:     "outcomes/03_verification",
  SYNTHESIZE: "outcomes/04_alignment",
  BROADCAST:  "outcomes/05_broadcast",
  QUARANTINE: "research_body/04_quarantine",
};

export function resolveTargetPath(engagement: string, phase: string, target: string): string | null {
  if (!target || target === "—") return null;
  const dir = PHASE_DIR[phase];
  if (!dir) return null;
  return `engagements/${engagement}/${dir}/${target}`;
}
```

In `LogStreamer.tsx`, for each row's target cell:
```tsx
const path = resolveTargetPath(row.engagement, row.phase, row.target);
{path ? (
  <button
    onClick={() => openFile(path)}
    className="truncate underline decoration-dotted text-ink-dim hover:text-emerald transition-colors"
    title={path}
  >
    {row.target}
  </button>
) : (
  <span className="truncate text-ink-dim">{row.target}</span>
)}
```

`openFile` comes from `useDrawer()` or equivalent drawer context hook.

### Step 4: Phase filter

Above the log table, add a collapsible filter:

```tsx
<details className="mb-2">
  <summary className="cursor-pointer font-mono text-xs text-ink-dim select-none">
    phases ▾
  </summary>
  <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px]">
    {ALL_PHASES.map((phase) => (
      <label key={phase} className="flex items-center gap-1 cursor-pointer">
        <input
          type="checkbox"
          checked={enabledPhases.has(phase)}
          onChange={() => togglePhase(phase)}
          className="accent-emerald"
        />
        {phase}
      </label>
    ))}
  </div>
</details>
```

`ALL_PHASES` is the 13-item constant array. `enabledPhases` is a `Set<string>` in `useState`, initialised with all 13. `togglePhase` updates the set immutably. Filter the `rows` array before rendering: `rows.filter(r => enabledPhases.has(r.phase))`. No API call — pure client state.

---

## Acceptance Criteria

- [ ] `src/lib/constants.ts` created with `STATUS_COLOR`, `PHASE_ICON`, `VERDICT_STYLE`
- [ ] `EDIT` → amber, `GATED` → red-500, `GATED-OVERRIDE` → orange in log rows
- [ ] Phase icon renders inline before phase text for all 13 phases
- [ ] Resolvable `target` values render as clickable buttons opening the file drawer
- [ ] Non-resolvable targets (INIT, INDEX, EXTRACT, etc.) render as plain dim text
- [ ] Phase filter `<details>` appears above log; unchecking a phase hides its rows
- [ ] No API calls triggered by filter toggle — pure client-side
- [ ] `bun run build` passes TypeScript-clean
