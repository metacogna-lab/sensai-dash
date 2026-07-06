import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PaperCard } from "@/components/ui/PaperCard";
import { timeAgo } from "@/lib/markdown";
import type { EngagementSummary } from "@/lib/types";

/** 7-segment micro-sparkbar representing per-stage file counts. */
function StageSparkbar({ stages }: { stages: EngagementSummary["stages"] }) {
  const maxCount = Math.max(1, ...stages.map((s) => s.count));
  return (
    <div className="space-y-1">
      <div className="flex h-1.5 w-full items-stretch gap-0.5">
        {stages.map((stage) => {
          const flex = Math.max(stage.count / maxCount, 0.05);
          const isInput = stage.key === "raw" || stage.key === "nodes" || stage.key === "quarantine";
          const color = isInput
            ? stage.count > 0
              ? "bg-edge"
              : "bg-edge/20"
            : stage.count > 0
              ? "bg-emerald"
              : "bg-emerald/10";
          return (
            <div
              key={stage.key}
              className={`min-w-[2px] rounded-sm ${color}`}
              style={{ flex }}
              title={`${stage.label}: ${stage.count}`}
            />
          );
        })}
      </div>
      <p className="font-mono text-[10px] text-ink-dim">
        {stages.map((stage, i) => (
          <span key={stage.key}>
            {i > 0 && <span className="mx-0.5 opacity-40">·</span>}
            <span className={stage.count > 0 && !["raw", "nodes", "quarantine"].includes(stage.key) ? "text-emerald" : ""}>
              {stage.count}
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}

/** Milestone progress inline track. */
function MilestoneLine({ milestones }: { milestones: { done: number; total: number } }) {
  const pct = (milestones.done / milestones.total) * 100;
  return (
    <div className="relative mt-1">
      <div
        className="absolute inset-y-0 left-0 rounded-sm bg-emerald/20"
        style={{ width: `${pct}%` }}
      />
      <p className="relative px-1 font-mono text-[10px] text-ink-dim">
        {milestones.done}/{milestones.total} milestones
      </p>
    </div>
  );
}

/** Masonry-ish responsive grid of engagement Paper Cards. */
export function EngagementGrid({ engagements }: { engagements: EngagementSummary[] }) {
  if (engagements.length === 0) {
    return (
      <PaperCard className="text-sm text-ink-dim">
        No engagements found. Check <code className="font-mono">SENSAI_ROOT</code>.
      </PaperCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {engagements.map((e) => (
        <Link key={e.id} href={`/engagements/${e.id}`} className="group">
          <PaperCard dim active={e.active} className="flex h-full flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {e.recentlyActive && (
                  <span
                    className="h-2 w-2 animate-pulse rounded-full bg-emerald shadow-[0_0_8px_var(--color-emerald)]"
                    title="active in last 24h"
                  />
                )}
                <h3 className="font-mono text-base font-semibold text-ink">{e.id}</h3>
              </div>
              <ArrowUpRight className="h-4 w-4 text-ink-dim transition-colors group-hover:text-emerald" />
            </div>

            <p className="line-clamp-2 min-h-[2.5rem] text-xs text-ink-dim">
              {e.focus ?? "No focus set."}
            </p>

            <StageSparkbar stages={e.stages} />

            {e.milestones && <MilestoneLine milestones={e.milestones} />}

            <div className="mt-auto flex items-center justify-between border-t border-edge pt-2 font-mono text-[10px] text-ink-dim">
              <span>{e.active ? "● active tenant" : e.status ?? "—"}</span>
              <span>{timeAgo(e.lastActivity)}</span>
            </div>
          </PaperCard>
        </Link>
      ))}
    </div>
  );
}
