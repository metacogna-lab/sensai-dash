# TASK-13: Context Assembly Progress Callback in Chat + Synthesis

**Priority:** MEDIUM  
**Status:** PENDING  
**Depends on:** None (can be done independently; TASK-11 can stub progress if this is not yet done)  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

Surface real-time progress during artifact context gathering in both `ChatThread` (TASK-11) and the legacy `SynthesisTerminal`. Currently gathering up to 40 files / 120,000 chars is silent — operators see a blank loader with no indication of how much context is being assembled.

---

## Context

`src/lib/synthesisContext.ts` exports:
- `gatherEngagementContext(id: string): Promise<{ text: string; fileCount: number; truncated: boolean }>`
- `gatherContext(ids: string[]): Promise<...>` (calls `gatherEngagementContext` for each id)

Constants: `MAX_FILES = 40`, `MAX_CHARS = 120_000`.

The function currently builds context silently — no callbacks, no events. Adding an `onProgress` callback is a non-breaking addition (optional parameter).

---

## Implementation

### Step 1: Add `onProgress` to `gatherEngagementContext` — `src/lib/synthesisContext.ts`

```ts
interface GatherProgress {
  filesDone: number;
  charsUsed: number;
  maxFiles: number;
  maxChars: number;
}

type ProgressCallback = (progress: GatherProgress) => void;

export async function gatherEngagementContext(
  id: string,
  onProgress?: ProgressCallback
): Promise<{ text: string; fileCount: number; truncated: boolean }> {
  // ... existing implementation ...
  // After each file is appended to the context buffer, call:
  onProgress?.({
    filesDone: currentFileCount,
    charsUsed: currentCharCount,
    maxFiles: MAX_FILES,
    maxChars: MAX_CHARS,
  });
  // ... continue ...
}
```

Locate the inner loop where files are read and appended. Insert the `onProgress` call after each successful file append. The call is a no-op when `onProgress` is `undefined` — no change to existing callers.

### Step 2: Thread `onProgress` through `gatherContext` — `src/lib/synthesisContext.ts`

```ts
export async function gatherContext(
  ids: string[],
  onProgress?: ProgressCallback
): Promise<{ text: string; fileCount: number; truncated: boolean }> {
  // existing multi-engagement aggregation, but thread onProgress through
  // to gatherEngagementContext for each id
}
```

The callback fires once per file across all engagements, accumulating `filesDone` across the full gathering run.

### Step 3: Progress display in `ChatThread.tsx` — `src/components/admin/ChatThread.tsx`

Add `gatherProgress` state:

```ts
const [gatherProgress, setGatherProgress] = useState<GatherProgress | null>(null);
```

Pass `setGatherProgress` as the `onProgress` callback during context assembly:

```ts
const context = await gatherContext(session.engagement, setGatherProgress);
setGatherProgress(null); // clear when done
```

Render between the last message and the input area, when `gatherProgress` is non-null:

```tsx
{gatherProgress && (
  <p className="font-mono text-xs text-ink-dim px-4 py-1 animate-pulse">
    reading artifacts… {gatherProgress.filesDone} / {gatherProgress.maxFiles} files
    &nbsp;·&nbsp;
    {gatherProgress.charsUsed.toLocaleString()} / {gatherProgress.maxChars.toLocaleString()} chars
  </p>
)}
```

### Step 4: Same display in `SynthesisTerminal.tsx` (legacy)

Apply the same `gatherProgress` state + render pattern to the existing `SynthesisTerminal` component so context gathering is visible there too. This is a small addition — do not refactor the terminal beyond this.

---

## Acceptance Criteria

- [ ] `gatherEngagementContext` accepts optional `onProgress` callback
- [ ] `gatherContext` threads `onProgress` to each `gatherEngagementContext` call
- [ ] Existing callers with no `onProgress` argument are unaffected
- [ ] `ChatThread` displays `reading artifacts… N / 40 files · N,NNN / 120,000 chars` during gathering
- [ ] Progress line disappears once gathering is complete and streaming begins
- [ ] `SynthesisTerminal` shows the same progress line during context assembly
- [ ] Char counts formatted with `toLocaleString()` (e.g., `48,203` not `48203`)
- [ ] `bun run build` passes TypeScript-clean
