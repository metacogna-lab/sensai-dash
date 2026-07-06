import { PaperCard } from "@/components/ui/PaperCard";
import type { GlobalTelemetry as Telemetry } from "@/lib/types";

function Metric({
  label,
  value,
  emerald = false,
  amber = false,
}: {
  label: string;
  value: number;
  emerald?: boolean;
  amber?: boolean;
}) {
  const color = amber ? "text-amber-400" : emerald ? "text-emerald" : "text-ink-dim";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`font-mono text-4xl md:text-5xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="font-mono text-sm md:text-base text-ink-dim uppercase tracking-wide">{label}</span>
    </div>
  );
}

/** Top-level counters aggregated across all engagements. */
export function GlobalTelemetry({ telemetry: t }: { telemetry: Telemetry }) {
  return (
    <div className="space-y-6">
      {/* Pipeline funnel row */}
      <PaperCard className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
        <Metric label="nodes" value={t.nodes} />
        <span className="text-2xl text-ink-dim/40">▸</span>
        <Metric label="theories" value={t.theories} emerald={t.theories > 0} />
        <Metric label="models" value={t.economicModels} emerald={t.economicModels > 0} />
        <Metric label="verified" value={t.verification} emerald={t.verification > 0} />
        <Metric label="aligned" value={t.alignment} emerald={t.alignment > 0} />
        <Metric label="broadcast" value={t.broadcast} emerald={t.broadcast > 0} />
        <span className="text-2xl text-ink-dim/30">|</span>
        <Metric label="archived" value={t.archived} />
        <Metric label="engagements" value={t.engagements} />
      </PaperCard>

      {/* Health signals row */}
      {(t.quarantined > 0 || t.activeEngagement) && (
        <div className="flex flex-wrap items-center gap-6 px-2 font-mono text-base md:text-lg">
          {t.quarantined > 0 && (
            <span className="flex items-center gap-2.5 text-amber-400">
              <span className="text-xl">⚠</span>
              <span className="text-lg">{t.quarantined} quarantined</span>
            </span>
          )}
          {t.activeEngagement && (
            <span className="flex items-center gap-2.5 text-ink-dim">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald" />
              <span className="text-lg font-semibold text-emerald">{t.activeEngagement}</span>
              <span>active tenant</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
