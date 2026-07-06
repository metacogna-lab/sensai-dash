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
    <div className="space-y-20">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          AgenticOS Terminal
        </h1>
        <p className="text-xl text-ink-dim max-w-2xl leading-relaxed">
          Read-only observability across the Sensai Compilar flat-file ecosystem.
        </p>
      </header>

      {activeEngagement && (
        <aside className="flex flex-col gap-4 rounded-lg border border-emerald/20 bg-emerald/5 px-8 py-6 font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="h-3 w-3 animate-pulse rounded-full bg-emerald shadow-[0_0_8px_var(--color-emerald)]" />
            <span className="text-base text-ink-dim">active tenant</span>
            <span className="text-2xl font-bold text-emerald">{activeEngagement.id}</span>
          </div>
          {activeEngagement.focus && (
            <div className="text-lg text-ink-dim">
              <span className="text-ink-dim/60">focus: </span>
              <span className="text-ink">{activeEngagement.focus}</span>
            </div>
          )}
          {activeEngagement.recentlyActive && (
            <div className="text-base text-emerald/80">
              ✓ recently active
            </div>
          )}
        </aside>
      )}

      <section aria-label="Global telemetry" className="space-y-4">
        <h2 className="text-2xl font-semibold text-ink tracking-tight md:text-3xl">
          Pipeline Funnel
        </h2>
        <GlobalTelemetry telemetry={telemetry} />
      </section>

      <section aria-label="Engagements" className="space-y-6">
        <h2 className="text-2xl font-semibold text-ink tracking-tight md:text-3xl">
          Active Engagements
        </h2>
        <EngagementGrid engagements={engagements} />
      </section>

      <section aria-label="Telemetry stream" className="space-y-6">
        <h2 className="text-2xl font-semibold text-ink tracking-tight md:text-3xl">
          Telemetry Stream
        </h2>
        <LogStreamer engagements={engagements.map((e) => e.id)} />
      </section>
    </div>
  );
}
