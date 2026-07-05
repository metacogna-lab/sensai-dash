"use client";

import { PaperCard } from "@/components/ui/PaperCard";
import { GlassTooltip, type TooltipRow } from "@/components/ui/GlassTooltip";
import { MonospaceTag } from "@/components/ui/MonospaceTag";
import { useDrawer } from "./MarkdownDrawer";
import type { ArtifactCard, PipelineColumn } from "@/lib/types";

/** Pull the most useful frontmatter into tooltip rows (model, work block, status, created). */
function tooltipRows(fm: Record<string, unknown>): TooltipRow[] {
  const keys = ["type", "status", "model", "work_block", "source", "created"];
  const rows: TooltipRow[] = [];
  for (const k of keys) {
    if (fm[k] != null) rows.push({ label: k, value: String(fm[k]) });
  }
  return rows;
}

/** Strip the `node--`/`theory--` prefix and `.md` for a readable card title. */
function titleOf(name: string): string {
  return name.replace(/\.md$/, "").replace(/^[a-z]+--/, "").replace(/[-_]/g, " ");
}

function Card({ card }: { card: ArtifactCard }) {
  const { openFile } = useDrawer();
  const status = card.frontmatter.status;
  const rows = tooltipRows(card.frontmatter);

  return (
    <GlassTooltip rows={rows} className="w-full">
      <PaperCard
        as="div"
        dim
        onClick={() => openFile(card.path)}
        className="w-full cursor-pointer"
      >
        <p className="mb-2 text-sm font-medium capitalize leading-snug text-ink">
          {titleOf(card.name)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {status != null && <MonospaceTag label="status" value={String(status)} />}
        </div>
      </PaperCard>
    </GlassTooltip>
  );
}

function Column({ column }: { column: PipelineColumn }) {
  return (
    <section className="flex w-[78vw] shrink-0 snap-start flex-col gap-3 sm:w-72 md:w-64">
      <header className="flex items-baseline justify-between border-b border-edge pb-2">
        <h3 className="text-sm font-semibold text-ink">{column.label}</h3>
        <span className="font-mono text-xs text-ink-dim">{column.cards.length}</span>
      </header>
      <p className="-mt-1 font-mono text-[10px] text-ink-dim">{column.hint}</p>
      <div className="flex flex-col gap-2">
        {column.cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-edge px-3 py-6 text-center font-mono text-xs text-ink-dim">
            empty
          </div>
        ) : (
          column.cards.map((c) => <Card key={c.path} card={c} />)
        )}
      </div>
    </section>
  );
}

/** Horizontal, swipeable Kanban of pipeline stages. snap-x for iPhone thumb-scroll. */
export function PipelineBoard({ columns }: { columns: PipelineColumn[] }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      {columns.map((col) => (
        <Column key={col.key} column={col} />
      ))}
    </div>
  );
}
