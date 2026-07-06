# TASK-10: Cmd+K Command Palette (Global Artifact Search)

**Priority:** MEDIUM  
**Status:** PENDING  
**Depends on:** None  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

Add a keyboard-triggered command palette that lets operators search and open any pipeline artifact from anywhere in the dashboard. Trigger: `Cmd+K` / `Ctrl+K`.

---

## Context

The drawer (`MarkdownDrawer`) already exists and can be opened programmatically via a context hook (`useDrawer()` or similar) with a file path argument. The `/api/engagements` and `/api/tree` routes provide all data needed to index artifacts.

---

## Implementation

### New component: `src/components/ui/CommandPalette.tsx`

This is a **client component** (`"use client"`).

**State:**
```ts
const [open, setOpen] = useState(false);
const [query, setQuery] = useState("");
const [index, setIndex] = useState<PaletteEntry[]>([]);
const [indexBuilt, setIndexBuilt] = useState(false);
```

```ts
interface PaletteEntry {
  path: string;        // harness-root-relative path to the file
  name: string;        // filename without extension
  engagement: string;  // engagement id
  stage: string;       // stage key ("nodes", "theories", etc.)
  stageLabel: string;  // human label
}
```

**Keyboard trigger:**
```ts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
    if (e.key === "Escape") setOpen(false);
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

**Index build** (lazy — only on first open):
```ts
useEffect(() => {
  if (!open || indexBuilt) return;
  buildIndex().then((entries) => {
    setIndex(entries);
    setIndexBuilt(true);
  });
}, [open, indexBuilt]);
```

`buildIndex()`:
1. `GET /api/engagements` → engagement list.
2. For each engagement + each of the 7 pipeline stages, `GET /api/tree?path=engagements/<id>/<stage.dir>`.
3. Flatten all `DirEntry` items into `PaletteEntry[]`.
4. Cache result in a module-level `let cachedIndex: PaletteEntry[] | null = null` — survives re-renders without re-fetching.

**Search** (client-side, no API):
```ts
const results = query.length < 1
  ? index.slice(0, 8)
  : index
      .filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.path.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);
```

**Render** (modal overlay):

```tsx
{open && (
  <div
    className="fixed inset-0 z-[60] bg-void/60 backdrop-blur-sm"
    onClick={() => setOpen(false)}
  >
    <div
      className="fixed left-1/2 top-[20%] w-[90vw] max-w-xl -translate-x-1/2 rounded-xl border border-[#2B303B] bg-[#0E1015]/95 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        autoFocus
        className="w-full border-b border-[#2B303B] bg-transparent px-4 py-3 font-mono text-sm text-ink outline-none placeholder:text-ink-dim"
        placeholder="Search artifacts…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="max-h-72 overflow-y-auto py-1">
        {results.map((entry) => (
          <li key={entry.path}>
            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-paper/60"
              onClick={() => { openFile(entry.path); setOpen(false); }}
            >
              <span className="rounded bg-edge/40 px-1 font-mono text-[10px] text-ink-dim">
                {entry.stageLabel}
              </span>
              <span className="font-mono text-sm text-ink">{entry.name}</span>
              <span className="ml-auto font-mono text-[10px] text-ink-dim">{entry.engagement}</span>
            </button>
          </li>
        ))}
        {results.length === 0 && query.length > 0 && (
          <li className="px-4 py-3 font-mono text-xs text-ink-dim">No results for "{query}"</li>
        )}
        {!indexBuilt && (
          <li className="px-4 py-3 font-mono text-xs text-ink-dim animate-pulse">Building index…</li>
        )}
      </ul>
    </div>
  </div>
)}
```

### Integration in `src/app/layout.tsx`

Import `CommandPalette` and render it at the root layout level (client boundary wrapper if layout is server):

```tsx
// In the body, after nav:
<CommandPalette />
```

If `layout.tsx` is a server component, create a `src/components/ui/ClientProviders.tsx` wrapper that is `"use client"` and renders `CommandPalette` alongside any existing client providers.

---

## Acceptance Criteria

- [ ] `Cmd+K` / `Ctrl+K` opens the palette; `Escape` closes it
- [ ] Index is built lazily on first open (no fetch on page load)
- [ ] Index is cached in module scope — second open is instant
- [ ] Search filters by `name` and `path` substrings, case-insensitive
- [ ] Maximum 8 results rendered
- [ ] Each result shows: stage chip · artifact name · engagement id
- [ ] Selecting a result opens the artifact in the file drawer and closes palette
- [ ] Clicking the backdrop closes the palette
- [ ] `bun run build` passes TypeScript-clean
