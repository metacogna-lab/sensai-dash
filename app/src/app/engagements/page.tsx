import Link from "next/link";
import { dataSource } from "@/lib/dataSource";
import { PaperCard } from "@/components/ui/PaperCard";
import { FileTree } from "@/components/dashboard/FileTree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The Archive: the literal "move through the file system" browser + engagement jump list.
export default async function ExplorerPage() {
  const engagements = await dataSource.listEngagements();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Engagement Explorer</h1>
        <p className="text-sm text-ink-dim">
          Drill into any engagement&rsquo;s pipeline, or browse the raw flat-file tree.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-dim">Engagements</h2>
        <div className="flex flex-wrap gap-2">
          {engagements.map((e) => (
            <Link
              key={e.id}
              href={`/engagements/${e.id}`}
              className="flex min-h-[44px] items-center gap-2 rounded-md border border-edge bg-paper px-4 py-2 font-mono text-sm text-ink transition-colors hover:border-emerald/50 hover:text-emerald"
            >
              {e.recentlyActive && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald" />
              )}
              {e.id}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-dim">
          Filesystem
        </h2>
        <PaperCard className="max-h-[60vh] overflow-y-auto p-2">
          <FileTree root="engagements" />
        </PaperCard>
      </section>
    </div>
  );
}
