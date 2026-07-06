import { dataSource } from "@/lib/dataSource";
import { GlobalTelemetry } from "@/components/dashboard/GlobalTelemetry";
import { EngagementGrid } from "@/components/dashboard/EngagementGrid";
import { LogStreamer } from "@/components/dashboard/LogStreamer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [engagements, telemetry] = await Promise.all([
    dataSource.listEngagements(),
    dataSource.getGlobalTelemetry(),
  ]);

  const activeEngagement = engagements.find((e) => e.active);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          AgenticOS Terminal
        </h1>
        <p className="text-sm text-ink-dim">
          Read-only observability across the Sensai Compilar flat-file ecosystem.
        </p>
      </header>

      {activeEngagement && (
        <aside className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald/20 bg-emerald/5 px-4 py-2.5 font-mono text-xs">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald shadow-[0_0_6px_var(--color-emerald)]" />
          <span className="text-ink-dim">active tenant</span>
          <span className="font-semibold text-emerald">{activeEngagement.id}</span>
          {activeEngagement.focus && (
            <>
              <span className="text-ink-dim/40">·</span>
              <span className="text-ink-dim">{activeEngagement.focus}</span>
            </>
          )}
          {activeEngagement.recentlyActive && (
            <>
              <span className="text-ink-dim/40">·</span>
              <span className="text-emerald/70">recently active</span>
            </>
          )}
        </aside>
      )}

      <section aria-label="Global telemetry">
        <GlobalTelemetry telemetry={telemetry} />
      </section>

      <section aria-label="Engagements" className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-dim">
          Active Engagements
        </h2>
        <EngagementGrid engagements={engagements} />
      </section>

      <section aria-label="Telemetry stream">
        <LogStreamer engagements={engagements.map((e) => e.id)} />
      </section>
    </div>
  );
}
