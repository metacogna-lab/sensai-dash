import { getPlugins } from '@/lib/pluginSource';
import { PluginsTable } from '@/components/dashboard/PluginsTable';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function PluginsPage() {
  const { skills, agents } = await getPlugins();

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          Plugins
        </h1>
        <p className="text-xl text-ink-dim max-w-2xl leading-relaxed">
          All available skills, agents, and how to invoke them across the Sensai Compilar pipeline.
        </p>
      </header>

      <PluginsTable skills={skills} agents={agents} />
    </div>
  );
}
