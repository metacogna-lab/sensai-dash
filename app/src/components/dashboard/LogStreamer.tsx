"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Terminal } from "lucide-react";
import { cn } from "@/lib/cn";
import type { LogRow } from "@/lib/types";

interface TaggedRow extends LogRow {
  engagement: string;
}

const STATUS_COLOR: Record<string, string> = {
  SUCCESS: "text-emerald",
  PASS: "text-emerald",
  FAIL: "text-red-400",
  BLOCKED: "text-red-400",
};

async function fetchLog(engagement: string): Promise<TaggedRow[]> {
  const res = await fetch(`/api/log?engagement=${encodeURIComponent(engagement)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { rows: LogRow[] };
  return (data.rows ?? []).map((r) => ({ ...r, engagement }));
}

/** Read-only, IDE-style streaming view of execution.log across engagements. Polls every 6s. */
export function LogStreamer({ engagements, limit = 40 }: { engagements: string[]; limit?: number }) {
  const [rows, setRows] = useState<TaggedRow[]>([]);
  const [open, setOpen] = useState(true);

  const refresh = useCallback(async () => {
    const all = (await Promise.all(engagements.map(fetchLog))).flat();
    all.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    setRows(all.slice(0, limit));
  }, [engagements, limit]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="overflow-hidden rounded-lg border border-edge bg-void">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <Terminal className="h-4 w-4 text-emerald" />
          Live Log Stream
          <span className="font-mono text-xs text-ink-dim">({rows.length})</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-ink-dim transition-transform", !open && "-rotate-90")} />
      </button>

      {open && (
        <div className="max-h-72 overflow-y-auto border-t border-edge px-4 py-3 font-mono text-xs leading-6">
          {rows.length === 0 ? (
            <p className="text-ink-dim">no telemetry yet…</p>
          ) : (
            rows.map((r, i) => (
              <div key={`${r.engagement}-${r.workBlock}-${i}`} className="flex flex-wrap gap-x-2">
                <span className="text-ink-dim">{r.timestamp}</span>
                <span className="text-emerald/70">[{r.engagement}]</span>
                <span className="text-ink">{r.phase}</span>
                <span className="text-ink-dim">{r.workBlock}</span>
                <span className="truncate text-ink-dim">{r.target}</span>
                <span className={cn("font-semibold", STATUS_COLOR[r.status.toUpperCase()] ?? "text-ink-dim")}>
                  {r.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
