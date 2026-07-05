import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { dataSource } from "@/lib/dataSource";
import { PipelineBoard } from "@/components/dashboard/PipelineBoard";
import { LogStreamer } from "@/components/dashboard/LogStreamer";
import { formatTime } from "@/lib/markdown";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EngagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const engagement = await dataSource.getEngagement(id);
  if (!engagement) notFound();

  const columns = await dataSource.getPipeline(id);

  return (
    <div className="space-y-6">
      <Link
        href="/engagements"
        className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-emerald"
      >
        <ArrowLeft className="h-4 w-4" /> Explorer
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          {engagement.recentlyActive && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald shadow-[0_0_8px_var(--color-emerald)]" />
          )}
          <h1 className="font-mono text-2xl font-semibold tracking-tight">{engagement.id}</h1>
          {engagement.active && (
            <span className="rounded border border-emerald/40 px-2 py-0.5 font-mono text-[10px] text-emerald">
              active tenant
            </span>
          )}
        </div>
        <p className="text-sm text-ink-dim">{engagement.focus ?? "No focus set."}</p>
        <p className="font-mono text-xs text-ink-dim">
          checkpoint {engagement.lastCheckpoint ?? "—"} · last activity{" "}
          {formatTime(engagement.lastActivity)}
        </p>
      </header>

      <section aria-label="Pipeline">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-dim">
          Pipeline
        </h2>
        <PipelineBoard columns={columns} />
      </section>

      <section aria-label="Telemetry">
        <LogStreamer engagements={[engagement.id]} />
      </section>
    </div>
  );
}
