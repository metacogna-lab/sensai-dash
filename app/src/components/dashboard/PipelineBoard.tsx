"use client";

import { PaperCard } from "@/components/ui/PaperCard";
import { GlassTooltip, type TooltipRow } from "@/components/ui/GlassTooltip";
import { MonospaceTag } from "@/components/ui/MonospaceTag";
import { useDrawer } from "./MarkdownDrawer";
import { VERDICT_STYLE } from "@/lib/constants";
import { timeAgo } from "@/lib/markdown";
import type { ArtifactCard, PipelineColumn } from "@/lib/types";

function tooltipRows(fm: Record<string, unknown>): TooltipRow[] {
  const keys = ["type", "status", "model", "work_block", "source", "created"];
  const rows: TooltipRow[] = [];
  for (const k of keys) {
    if (fm[k] != null) rows.push({ label: k, value: String(fm[k]) });
  }
  return rows;
}

function titleOf(name: string): string {
  return name.replace(/\.md$/, "").replace(/^[a-z]+--/, "").replace(/[-_]/g, " ");
}

function Card({ card }: { card: ArtifactCard }) {
  const { openFile } = useDrawer();
  const fm = card.frontmatter;
  const status = fm.status as string | undefined;
  const verdict = fm.verdict as string | undefined;
  const workBlock = fm.work_block as string | undefined;
  const artifactType = fm.type as string | undefined;
  const rows = tooltipRows(fm);

  const handleWbClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("sensai:open-log-wb", { detail: { workBlock } }),
    );
  };

  return (
    <GlassTooltip rows={rows} className="w-full">
      <PaperCard
        as="div"
        dim
        onClick={() => openFile(card.path)}
        className="w-full cursor-pointer"
      >
        <div className="mb-1.5 flex items-start justify-between gap-1">
          <p className="text-sm font-medium capitalize leading-snug text-ink">
            {titleOf(card.name)}
          </p>
          {artifactType && (
            <span className="shrink-0 font-mono text-[10px] text-ink-dim">{artifactType}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {verdict && VERDICT_STYLE[verdict] && (
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${VERDICT_STYLE[verdict]}`}>
              {verdict}
            </span>
          )}
          {status != null && <MonospaceTag label="status" value={String(status)} />}
          {workBlock && (
            <MonospaceTag
              label="wb"
              value={String(workBlock)}
              variant="highlight"
              onClick={handleWbClick}
            />
          )}
        </div>

        {card.modified && (
          <p className="mt-1.5 text-right font-mono text-[10px] text-ink-dim">
            {timeAgo(card.modified)}
          </p>
        )}
      </PaperCard>
    </GlassTooltip>
  );
}

function Column({ column }: { column: PipelineColumn }) {
  const isQuarantine = column.key === "quarantine";
  const hasWarning = isQuarantine && column.cards.length > 0;

  return (
    <section
      id={`pipeline-col-${column.key}`}
      className="flex w-[78vw] shrink-0 snap-start flex-col gap-3 sm:w-72 md:w-64"
    >
      <header
        className={`flex items-baseline justify-between border-b pb-2 ${
          hasWarning ? "border-amber-400/30" : "border-edge"
        }`}
      >
        <h3
          className={`text-sm font-semibold ${hasWarning ? "text-amber-400" : "text-ink"}`}
        >
          {column.label}
        </h3>
        <span
          className={`font-mono text-xs ${
            hasWarning
              ? "animate-pulse rounded-full bg-amber-400/20 px-1.5 text-amber-400"
              : "text-ink-dim"
          }`}
        >
          {column.cards.length}
        </span>
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
