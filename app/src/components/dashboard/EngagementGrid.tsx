import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PaperCard } from "@/components/ui/PaperCard";
import { timeAgo } from "@/lib/markdown";
import type { EngagementSummary } from "@/lib/types";

function ProgressBar({ input, output }: { input: number; output: number }) {
  const total = Math.max(input + output, 1);
  const outputPct = Math.round((output / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-void">
        <div className="bg-edge" style={{ width: `${100 - outputPct}%` }} />
        <div className="bg-emerald" style={{ width: `${outputPct}%` }} />
      </div>
      <div className="flex justify-between font-mono text-[10px] text-ink-dim">
        <span>{input} raw+nodes</span>
        <span className="text-emerald">{output} outcomes</span>
      </div>
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

            <ProgressBar input={e.inputCount} output={e.outputCount} />

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
