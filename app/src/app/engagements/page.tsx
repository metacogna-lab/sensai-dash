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
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Engagement Explorer</h1>
        <p className="text-xl text-ink-dim max-w-2xl leading-relaxed">
          Drill into any engagement&rsquo;s pipeline, or browse the raw flat-file tree.
        </p>
      </header>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">Engagements</h2>
        <div className="flex flex-wrap gap-3 md:gap-4">
          {engagements.map((e) => (
            <Link
              key={e.id}
              href={`/engagements/${e.id}`}
              className="flex min-h-14 items-center gap-3 rounded-md border border-edge bg-paper px-6 py-3 font-mono text-base md:text-lg font-semibold text-ink transition-colors hover:border-emerald/50 hover:text-emerald hover:bg-paper-2/50"
            >
              {e.recentlyActive && (
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald" />
              )}
              {e.id}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Filesystem
        </h2>
        <PaperCard className="max-h-[70vh] overflow-y-auto p-6 md:p-8">
          <FileTree root="engagements" />
        </PaperCard>
      </section>
    </div>
  );
}
