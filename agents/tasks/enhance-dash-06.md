# TASK-06: Verdict Badge + Work Block Tag on Pipeline Cards

**Priority:** HIGH  
**Status:** PENDING  
**Depends on:** TASK-05 (creates `src/lib/constants.ts` with `VERDICT_STYLE`)  
**Build check:** `bun run build` must pass TypeScript-clean on completion.

---

## Objective

Surface `verdict`, `work_block`, and `type` frontmatter fields on pipeline artifact cards in `PipelineBoard.tsx`. Currently only `status` appears on the card face; all other load-bearing frontmatter keys are buried in the hover tooltip.

---

## Context

`ArtifactCard.frontmatter` is `Record<string, unknown>`. The known load-bearing keys per template schema (`operations/templates/`):

| Template | `type` | `verdict` | `work_block` |
|----------|--------|-----------|--------------|
| `standard_node.md` | `node` | — | `WB-NNN` |
| `theory.md` | `theory` | — | `WB-NNN` |
| `economic_model.md` | `economic_model` | `viable` \| `no-viable-vector` | `WB-NNN` |
| `verification.md` | `verification` | `PASS` \| `PASS-WITH-NOTES` \| `FAIL` | `WB-NNN` |
| `alignment.md` | `alignment` | — | `WB-NNN` |
| `broadcast_post.md` | `broadcast` | — | `WB-NNN` |
| `conflict.md` | `conflict` | — | `WB-NNN` |

`VERDICT_STYLE` is defined in `src/lib/constants.ts` (created by TASK-05). Import from there — do not duplicate.

---

## Implementation

### `src/components/ui/MonospaceTag.tsx`

Extend with a `highlight` variant:

```tsx
interface MonospaceTagProps {
  label: string;
  value: string;
  variant?: "default" | "highlight";
  onClick?: () => void;
}
```

`highlight` variant: `border-emerald/40 text-emerald`. Existing `default` variant unchanged.

Add `onClick` prop: when provided, render as `<button>` with `cursor-pointer hover:bg-emerald/10` instead of `<span>`.

### `src/components/dashboard/PipelineBoard.tsx`

In the `Card` component render, access frontmatter fields with explicit narrowing:

```ts
const verdict    = frontmatter.verdict    as string | undefined;
const workBlock  = frontmatter.work_block as string | undefined;
const artifactType = frontmatter.type     as string | undefined;
```

**Verdict badge** (render above `status` tag, if present):

```tsx
{verdict && VERDICT_STYLE[verdict] && (
  <span
    className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${VERDICT_STYLE[verdict]}`}
  >
    {verdict}
  </span>
)}
```

**Work block tag** (render as `MonospaceTag` with `highlight` if work_block exists):

```tsx
{workBlock && (
  <MonospaceTag
    label="wb"
    value={workBlock}
    variant="highlight"
    onClick={() => {
      window.dispatchEvent(
        new CustomEvent("sensai:open-log-wb", { detail: { workBlock } })
      );
    }}
  />
)}
```

The `sensai:open-log-wb` event can be consumed by `LogStreamer` to scroll to and highlight the matching work block row.

**Type label** (right-aligned in card header, subtle):

```tsx
{artifactType && (
  <span className="ml-auto font-mono text-[10px] text-ink-dim">{artifactType}</span>
)}
```

Place this in the same flex row as the card name.

---

## Acceptance Criteria

- [ ] Verdict badge visible on verification and economic model cards where `verdict` is set
- [ ] Verdict badge colour matches `VERDICT_STYLE` from `src/lib/constants.ts` (no duplication)
- [ ] `work_block` tag renders in emerald highlight when present
- [ ] Clicking `work_block` tag dispatches `sensai:open-log-wb` custom event
- [ ] `type` label renders right-aligned in card header in dim ink
- [ ] Cards without these frontmatter fields render without any empty placeholder
- [ ] `MonospaceTag` `highlight` variant and `onClick` prop added
- [ ] `bun run build` passes TypeScript-clean
