/** Parse the Run Status markdown table from an engagement's INDEX.md body. */

export interface RunStatusRow {
  phase: string;
  command: string;
  agent: string;
  queue: string;
  done: number;
  blockers: string;
}

function cells(line: string): string[] {
  return line
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function isDataRow(line: string): boolean {
  return line.trim().startsWith("|") && !line.includes("---") && !line.includes(":---");
}

export function parseRunStatusTable(body: string): RunStatusRow[] {
  const lines = body.split("\n");
  const headerIdx = lines.findIndex((l) => /\|\s*Phase\s*\|/i.test(l));
  if (headerIdx === -1) return [];

  const rows: RunStatusRow[] = [];
  // Skip header (headerIdx) and separator (headerIdx + 1), start from headerIdx + 2
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!isDataRow(line)) break;
    const c = cells(line);
    if (c.length < 2) continue;
    const done = parseInt(c[4] ?? "0", 10);
    rows.push({
      phase: c[0] ?? "",
      command: c[1] ?? "",
      agent: c[2] ?? "",
      queue: c[3] ?? "—",
      done: Number.isNaN(done) ? 0 : done,
      blockers: c[5] ?? "None",
    });
  }
  return rows.filter((r) => r.phase.length > 0);
}

export function hasBlocker(row: RunStatusRow): boolean {
  const b = row.blockers.trim();
  return b.length > 0 && b !== "None" && b !== "—";
}

export function queueHasWork(queue: string): boolean {
  return /[1-9]/.test(queue);
}
