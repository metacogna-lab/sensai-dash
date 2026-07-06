import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PaperCard } from "@/components/ui/PaperCard";
import { timeAgo } from "@/lib/markdown";
import type { EngagementSummary } from "@/lib/types";

/** 7-segment micro-sparkbar representing per-stage file counts. */
function StageSparkbar({ stages }: { stages: EngagementSummary["stages"] }) {
  const maxCount = Math.max(1, ...stages.map((s) => s.count));
  return (
    <div className="space-y-2.5">
      <div className="flex h-3 w-full items-stretch gap-1">
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
      <p className="font-mono text-base text-ink-dim">
        {stages.map((stage, i) => (
          <span key={stage.key}>
            {i > 0 && <span className="mx-1 opacity-40">·</span>}
            <span className={stage.count > 0 && !["raw", "nodes", "quarantine"].includes(stage.key) ? "text-emerald font-semibold" : ""}>
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
    <div className="relative mt-2">
      <div
        className="absolute inset-y-0 left-0 rounded-md bg-emerald/30"
        style={{ width: `${pct}%` }}
      />
      <p className="relative px-3 py-2 font-mono text-base text-ink-dim">
        <span className="font-bold text-emerald">{milestones.done}/{milestones.total}</span> milestones
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
    <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
      {engagements.map((e) => (
        <Link key={e.id} href={`/engagements/${e.id}`} className="group">
          <PaperCard dim active={e.active} className="flex h-full flex-col gap-5 p-8 md:p-10 lg:p-12">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {e.recentlyActive && (
                  <span
                    className="h-3 w-3 animate-pulse rounded-full bg-emerald shadow-[0_0_8px_var(--color-emerald)]"
                    title="active in last 24h"
                  />
                )}
                <h3 className="font-mono text-2xl md:text-3xl font-bold text-ink">{e.id}</h3>
              </div>
              <ArrowUpRight className="h-6 w-6 text-ink-dim transition-colors group-hover:text-emerald flex-shrink-0" />
            </div>

            <p className="line-clamp-2 min-h-[3rem] text-base md:text-lg text-ink-dim leading-relaxed">
              {e.focus ?? "No focus set."}
            </p>

            <StageSparkbar stages={e.stages} />

            {e.milestones && <MilestoneLine milestones={e.milestones} />}

            <div className="mt-auto flex items-center justify-between border-t border-edge pt-4 font-mono text-base text-ink-dim">
              <span>{e.active ? "● active tenant" : e.status ?? "—"}</span>
              <span>{timeAgo(e.lastActivity)}</span>
            </div>
          </PaperCard>
        </Link>
      ))}
    </div>
  );
}
