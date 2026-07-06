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
    <details className="mb-4">
      <summary className="cursor-pointer select-none font-mono text-base text-ink-dim hover:text-ink font-semibold">
        phases ▾
      </summary>
      <div className="mt-3 flex flex-wrap gap-3 font-mono text-base">
        {ALL_PHASES.map((phase) => (
          <label key={phase} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={enabled.has(phase)}
              onChange={() => toggle(phase)}
              className="accent-emerald w-4 h-4"
            />
            <span>{phase}</span>
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
    <div className="flex flex-wrap gap-x-3 gap-y-1 py-1.5">
      <span className="text-ink-dim">{row.timestamp}</span>
      <span className="text-emerald/70 font-mono font-semibold">[{row.engagement}]</span>
      <span className="flex items-center gap-1.5 text-ink font-semibold">
        {Icon && <Icon className="inline h-4 w-4" />}
        {row.phase}
      </span>
      <span className="text-ink-dim font-mono">{row.workBlock}</span>
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
      <span className={cn("font-bold text-base", statusClass)}>{row.status}</span>
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
        className="flex min-h-16 w-full items-center justify-between px-6 py-4 text-left hover:bg-paper-2/30 transition-colors"
      >
        <span className="flex items-center gap-3 text-lg font-semibold text-ink">
          <Terminal className="h-5 w-5 text-emerald" />
          Live Log Stream
          <span className="font-mono text-base text-ink-dim">({visible.length})</span>
        </span>
        <ChevronDown className={cn("h-5 w-5 text-ink-dim transition-transform", !open && "-rotate-90")} />
      </button>

      {open && (
        <div className="border-t border-edge px-6 py-4 font-mono text-base leading-7">
          <PhaseFilter enabled={enabledPhases} toggle={togglePhase} />
          <div className="max-h-96 overflow-y-auto space-y-0.5">
            {visible.length === 0 ? (
              <p className="text-ink-dim py-4">no telemetry yet…</p>
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
