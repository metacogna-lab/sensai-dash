import { PaperCard } from "@/components/ui/PaperCard";
import type { GlobalTelemetry as Telemetry } from "@/lib/types";

const METRICS: { key: keyof Telemetry; label: string }[] = [
  { key: "engagements", label: "Engagements" },
  { key: "nodes", label: "Nodes Consumed" },
  { key: "theories", label: "Theories Synthesized" },
  { key: "economicModels", label: "Economic Models" },
];

/** Top-level counters aggregated across all engagements. */
export function GlobalTelemetry({ telemetry }: { telemetry: Telemetry }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {METRICS.map((m) => (
        <PaperCard key={m.key} className="flex flex-col gap-1">
          <span className="font-mono text-3xl font-semibold tabular-nums text-emerald md:text-4xl">
            {telemetry[m.key]}
          </span>
          <span className="text-xs text-ink-dim">{m.label}</span>
        </PaperCard>
      ))}
    </div>
  );
}
