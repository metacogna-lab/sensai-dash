'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PluginEntry } from '@/lib/pluginSource';
import { PaperCard } from '@/components/ui/PaperCard';

export function PluginsTable({
  skills,
  agents,
}: {
  skills: PluginEntry[];
  agents: PluginEntry[];
}) {
  const [skillsOpen, setSkillsOpen] = useState(true);
  const [agentsOpen, setAgentsOpen] = useState(true);

  const renderPluginSection = (
    title: string,
    plugins: PluginEntry[],
    typeLabel: string,
    badgeColor: string,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
  ) => (
    <section className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 px-1 py-2 group"
      >
        <h2 className="text-2xl md:text-3xl font-semibold text-ink tracking-tight group-hover:text-emerald transition-colors">
          {title}
        </h2>
        <ChevronDown
          className={cn(
            'h-6 w-6 text-ink-dim transition-transform flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          {plugins.length === 0 ? (
            <PaperCard className="text-ink-dim text-base">
              No {typeLabel} found.
            </PaperCard>
          ) : (
            <div className="hidden sm:block">
              <PaperCard className="overflow-x-auto">
                <table className="w-full text-sm md:text-base">
                  <thead>
                    <tr className="border-b border-edge">
                      <th className="text-left px-4 py-4 font-semibold text-ink">Name</th>
                      <th className="text-left px-4 py-4 font-semibold text-ink">Description</th>
                      <th className="text-left px-4 py-4 font-semibold text-ink">Invoke</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plugins.map((plugin, i) => (
                      <tr
                        key={`${plugin.type}-${plugin.name}`}
                        className={`border-b border-edge/50 hover:bg-paper-2/40 transition-colors ${
                          i % 2 === 0 ? '' : 'bg-paper-2/20'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <code
                            className={`font-mono text-xs md:text-sm font-semibold px-3 py-1.5 rounded inline-block ${badgeColor}`}
                          >
                            {plugin.name}
                          </code>
                        </td>
                        <td className="px-4 py-4 text-ink-dim leading-relaxed">
                          <span className="text-base md:text-lg">{plugin.description}</span>
                        </td>
                        <td className="px-4 py-4">
                          <code className="font-mono text-xs md:text-sm bg-void border border-edge rounded px-3 py-1.5 inline-block whitespace-nowrap">
                            {plugin.invocation}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </PaperCard>
            </div>
          )}

          {/* Mobile stacked layout */}
          <div className="sm:hidden space-y-4">
            {plugins.map((plugin) => (
              <PaperCard key={`${plugin.type}-${plugin.name}`} className="space-y-3">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-ink-dim uppercase text-xs tracking-wide font-semibold mb-2">
                      Name
                    </dt>
                    <dd className="font-mono font-semibold">
                      <span className={`${badgeColor} px-3 py-1.5 rounded inline-block text-sm`}>
                        {plugin.name}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-dim uppercase text-xs tracking-wide font-semibold mb-2">
                      Description
                    </dt>
                    <dd className="text-ink-dim text-base leading-relaxed">
                      {plugin.description}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-dim uppercase text-xs tracking-wide font-semibold mb-2">
                      Invoke
                    </dt>
                    <dd>
                      <code className="font-mono text-xs bg-void border border-edge rounded px-3 py-1.5 inline-block">
                        {plugin.invocation}
                      </code>
                    </dd>
                  </div>
                </dl>
              </PaperCard>
            ))}
          </div>
        </>
      )}
    </section>
  );

  return (
    <div className="space-y-10">
      {renderPluginSection(
        'Skills',
        skills,
        'skills',
        'text-emerald bg-emerald/10',
        skillsOpen,
        setSkillsOpen
      )}
      {renderPluginSection(
        'Agents',
        agents,
        'agents',
        'text-ink-dim bg-edge/30',
        agentsOpen,
        setAgentsOpen
      )}
    </div>
  );
}
