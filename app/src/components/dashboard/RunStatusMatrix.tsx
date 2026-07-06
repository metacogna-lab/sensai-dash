import { dataSource } from "@/lib/dataSource";
import { parseRunStatusTable, hasBlocker, queueHasWork } from "@/lib/parseRunStatus";

interface Props {
  engagementId: string;
}

/** Server component — parses and renders the Run Status table from INDEX.md. */
export async function RunStatusMatrix({ engagementId }: Props) {
  const file = await dataSource.readFile(`engagements/${engagementId}/INDEX.md`);
  if (!file) return null;
  const rows = parseRunStatusTable(file.body);
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-edge/30">
      <table className="w-full font-mono text-xs">
        <thead>
          <tr className="border-b border-edge/30 text-left text-ink-dim">
            <th className="px-3 py-2 font-medium">Phase</th>
            <th className="px-3 py-2 font-medium">Command</th>
            <th className="hidden px-3 py-2 font-medium sm:table-cell">Agent</th>
            <th className="px-3 py-2 font-medium">Done</th>
            <th className="px-3 py-2 font-medium">Queue</th>
            <th className="px-3 py-2 font-medium">Blockers</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.phase}
              className="border-b border-edge/20 last:border-0 hover:bg-paper/30"
            >
              <td
                className={`px-3 py-1.5 font-semibold ${row.done > 0 ? "text-emerald" : "text-ink-dim"}`}
              >
                {row.phase}
              </td>
              <td className="px-3 py-1.5 text-ink-dim">{row.command}</td>
              <td className="hidden px-3 py-1.5 text-ink-dim/70 sm:table-cell">{row.agent}</td>
              <td className={`px-3 py-1.5 ${row.done > 0 ? "text-emerald" : "text-ink-dim"}`}>
                {row.done}
              </td>
              <td className={`px-3 py-1.5 ${queueHasWork(row.queue) ? "text-ink" : "text-ink-dim"}`}>
                {row.queue}
              </td>
              <td
                className={`px-3 py-1.5 ${hasBlocker(row) ? "text-amber-400" : "text-ink-dim"}`}
              >
                {row.blockers}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
