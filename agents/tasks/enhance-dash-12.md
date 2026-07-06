# TASK-12: Frontmatter Priority Ordering in Markdown Drawer

**Priority:** LOW  
**Status:** PENDING  
**Depends on:** TASK-05 (creates `VERDICT_STYLE` in `src/lib/constants.ts`)  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

The markdown drawer (`MarkdownDrawer.tsx`) currently renders frontmatter keys in arbitrary order and without semantic colouring. Priority-order the fields to surface the most diagnostic keys first, and apply colour to verdict/status values.

---

## Context

`MarkdownDrawer.tsx` renders `ParsedFile.frontmatter` (a `Record<string, unknown>`) as a flat key-value list. The drawer is the primary inspection surface for individual artifacts.

Load-bearing frontmatter keys and their diagnostic priority:

| Priority | Key | Semantic colour |
|----------|-----|-----------------|
| 1 | `type` | — |
| 2 | `status` | `ready` → `text-emerald` |
| 3 | `verdict` | see `VERDICT_STYLE` |
| 4 | `work_block` | — |
| 5 | `model` | — |
| 6 | `phase` | — |
| 7 | `created` | — |
| 8 | `source` | — |
| 9 | `slug` | — |
| rest | all other keys | — (alphabetical) |

`VERDICT_STYLE` is defined in `src/lib/constants.ts` (created by TASK-05). Import from there — no duplication.

---

## Implementation

**File:** `src/components/dashboard/MarkdownDrawer.tsx`

### Priority sort

```ts
const PRIORITY_KEYS = [
  "type", "status", "verdict", "work_block", "model",
  "phase", "created", "source", "slug",
];

function sortFrontmatter(
  entries: [string, unknown][]
): [string, unknown][] {
  const priority = entries.filter(([k]) => PRIORITY_KEYS.includes(k))
    .sort(([a], [b]) => PRIORITY_KEYS.indexOf(a) - PRIORITY_KEYS.indexOf(b));
  const rest = entries
    .filter(([k]) => !PRIORITY_KEYS.includes(k))
    .sort(([a], [b]) => a.localeCompare(b));
  return [...priority, ...rest];
}
```

Use `sortFrontmatter(Object.entries(parsedFile.frontmatter))` in place of the current unsorted entries.

### Value colour

```ts
function valueClass(key: string, value: unknown): string {
  const v = String(value);
  if (key === "status" && v === "ready") return "text-emerald";
  if (key === "verdict") {
    return VERDICT_STYLE[v]?.split(" ").find((c) => c.startsWith("text-")) ?? "text-ink";
  }
  return "text-ink";
}
```

Apply `valueClass(key, value)` to the value span in each frontmatter row.

### Optional: separator between priority and rest

After the last priority key and before the first "rest" key, insert a thin `<hr className="border-edge/20 my-1" />` to visually separate the diagnostic fields from the metadata tail.

---

## Acceptance Criteria

- [ ] Frontmatter rows ordered: type → status → verdict → work_block → model → phase → created → source → slug → (alphabetical rest)
- [ ] Keys absent from the file are simply absent from the list (no empty rows)
- [ ] `status: "ready"` renders `text-emerald`
- [ ] `verdict: "PASS"` renders emerald; `"PASS-WITH-NOTES"` renders amber; `"FAIL"` renders red; `"no-viable-vector"` renders dim
- [ ] Colour values extracted from `VERDICT_STYLE` in `src/lib/constants.ts` (not duplicated inline)
- [ ] Separator `<hr>` between priority and rest sections
- [ ] `bun run build` passes TypeScript-clean
