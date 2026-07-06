import type { DirEntry, ParsedFile } from "./types";

/**
 * Client-side, read-only context gathering for the synthesis portal. Walks an
 * engagement's markdown via the sandboxed GET API and packs it into a single
 * context string, bounded by file count and total characters so we never blow up
 * the browser or the model's context window.
 */

const MAX_FILES = 40;
const MAX_CHARS = 120_000;

// Directories worth feeding the synthesist, in priority order.
const CONTEXT_DIRS = [
  "INDEX.md",
  "goals",
  "research_body/02_nodes",
  "outcomes/01_theories",
  "outcomes/02_economic_models",
  "outcomes/03_verification",
  "outcomes/04_alignment",
];

export interface GatherProgress {
  filesDone: number;
  charsUsed: number;
  maxFiles: number;
  maxChars: number;
}

export type ProgressCallback = (progress: GatherProgress) => void;

async function fetchTree(path: string): Promise<DirEntry[]> {
  const res = await fetch(`/api/tree?path=${encodeURIComponent(path)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { entries: DirEntry[] };
  return data.entries ?? [];
}

async function fetchFile(path: string): Promise<ParsedFile | null> {
  const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) return null;
  return (await res.json()) as ParsedFile;
}

/** Collect .md file paths under a starting path (file or dir), one level deep for dirs. */
async function collectMarkdown(startPath: string): Promise<string[]> {
  if (startPath.endsWith(".md")) return [startPath];
  const entries = await fetchTree(startPath);
  const out: string[] = [];
  for (const e of entries) {
    if (e.type === "file" && e.name.endsWith(".md")) {
      out.push(e.path);
    } else if (e.type === "dir") {
      const nested = await fetchTree(e.path);
      out.push(...nested.filter((n) => n.type === "file" && n.name.endsWith(".md")).map((n) => n.path));
    }
  }
  return out;
}

export interface GatheredContext {
  text: string;
  fileCount: number;
  truncated: boolean;
}

/** Build a single context blob for one engagement. */
export async function gatherEngagementContext(
  id: string,
  onProgress?: ProgressCallback,
): Promise<GatheredContext> {
  const base = `engagements/${id}`;
  const paths: string[] = [];
  for (const dir of CONTEXT_DIRS) {
    paths.push(...(await collectMarkdown(`${base}/${dir}`)));
    if (paths.length >= MAX_FILES) break;
  }

  const chosen = paths.slice(0, MAX_FILES);
  const parts: string[] = [`## Engagement: ${id}`];
  let total = 0;
  let truncated = chosen.length < paths.length;
  let used = 0;

  for (const p of chosen) {
    const file = await fetchFile(p);
    if (!file) continue;
    const block = `\n### ${file.path}\n${file.raw}`;
    if (total + block.length > MAX_CHARS) {
      truncated = true;
      break;
    }
    parts.push(block);
    total += block.length;
    used += 1;
    onProgress?.({ filesDone: used, charsUsed: total, maxFiles: MAX_FILES, maxChars: MAX_CHARS });
  }

  return { text: parts.join("\n"), fileCount: used, truncated };
}

/** Build context across several engagements. */
export async function gatherContext(
  ids: string[],
  onProgress?: ProgressCallback,
): Promise<GatheredContext> {
  let totalFiles = 0;
  let totalChars = 0;

  const results = await Promise.all(
    ids.map((id) =>
      gatherEngagementContext(id, (p) => {
        totalFiles = p.filesDone;
        totalChars = p.charsUsed;
        onProgress?.({
          filesDone: totalFiles,
          charsUsed: totalChars,
          maxFiles: MAX_FILES,
          maxChars: MAX_CHARS,
        });
      }),
    ),
  );

  return {
    text: results.map((r) => r.text).join("\n\n---\n\n"),
    fileCount: results.reduce((n, r) => n + r.fileCount, 0),
    truncated: results.some((r) => r.truncated),
  };
}
