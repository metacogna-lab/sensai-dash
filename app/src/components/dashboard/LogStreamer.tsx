"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Terminal } from "lucide-react";
import { cn } from "@/lib/cn";
import { STATUS_COLOR, PHASE_ICON, ALL_PHASES } from "@/lib/constants";
import { resolveTargetPath } from "@/lib/logHelpers";
import { useDrawer } from "./MarkdownDrawer";
import type { LogRow } from "@/lib/types";

interface TaggedRow extends LogRow {
  engagement: string;
}

async function fetchLog(engagement: string): Promise<TaggedRow[]> {
  const res = await fetch(`/api/log?engagement=${encodeURIComponent(engagement)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { rows: LogRow[] };
  return (data.rows ?? []).map((r) => ({ ...r, engagement }));
}

function PhaseFilter({
  enabled,
  toggle,
}: {
  enabled: Set<string>;
  toggle: (phase: string) => void;
}) {
  return (
    <details className="mb-2">
      <summary className="cursor-pointer select-none font-mono text-xs text-ink-dim hover:text-ink">
        phases ▾
      </summary>
      <div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px]">
        {ALL_PHASES.map((phase) => (
          <label key={phase} className="flex cursor-pointer items-center gap-1">
            <input
              type="checkbox"
              checked={enabled.has(phase)}
              onChange={() => toggle(phase)}
              className="accent-emerald"
            />
            {phase}
          </label>
        ))}
      </div>
    </details>
  );
}

function LogRow({ row }: { row: TaggedRow }) {
  const { openFile } = useDrawer();
  const Icon = PHASE_ICON[row.phase.toUpperCase()];
  const statusClass = STATUS_COLOR[row.status.toUpperCase()] ?? "text-ink-dim";
  const targetPath = resolveTargetPath(row.engagement, row.phase, row.target);

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
      <span className="text-ink-dim">{row.timestamp}</span>
      <span className="text-emerald/70">[{row.engagement}]</span>
      <span className="flex items-center gap-1 text-ink">
        {Icon && <Icon className="inline h-3 w-3" />}
        {row.phase}
      </span>
      <span className="text-ink-dim">{row.workBlock}</span>
      {targetPath ? (
        <button
          onClick={() => openFile(targetPath)}
          className="truncate underline decoration-dotted text-ink-dim hover:text-emerald transition-colors text-left"
          title={targetPath}
        >
          {row.target}
        </button>
      ) : (
        <span className="truncate text-ink-dim">{row.target}</span>
      )}
      <span className={cn("font-semibold", statusClass)}>{row.status}</span>
    </div>
  );
}

/** Read-only, IDE-style streaming view of execution.log across engagements. Polls every 6s. */
export function LogStreamer({
  engagements,
  limit = 40,
}: {
  engagements: string[];
  limit?: number;
}) {
  const [rows, setRows] = useState<TaggedRow[]>([]);
  const [open, setOpen] = useState(true);
  const [enabledPhases, setEnabledPhases] = useState<Set<string>>(new Set(ALL_PHASES));

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

  const togglePhase = (phase: string) =>
    setEnabledPhases((prev) => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });

  const visible = rows.filter((r) => enabledPhases.has(r.phase.toUpperCase()));

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
          <span className="font-mono text-xs text-ink-dim">({visible.length})</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-ink-dim transition-transform", !open && "-rotate-90")} />
      </button>

      {open && (
        <div className="border-t border-edge px-4 py-3 font-mono text-xs leading-6">
          <PhaseFilter enabled={enabledPhases} toggle={togglePhase} />
          <div className="max-h-72 overflow-y-auto">
            {visible.length === 0 ? (
              <p className="text-ink-dim">no telemetry yet…</p>
            ) : (
              visible.map((r, i) => (
                <LogRow key={`${r.engagement}-${r.workBlock}-${i}`} row={r} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
