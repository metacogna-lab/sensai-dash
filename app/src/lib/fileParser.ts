import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { resolveSafe, toRelative } from "./sandbox";
import { logError } from "./errors";
import type { DirEntry, LogRow, ParsedFile } from "./types";

/**
 * Native-fs read helpers, all funneled through the sandbox. Every function is
 * read-only and guards its own failure by logging to agents/errors/ and returning a
 * safe empty value rather than throwing into the request (except sandbox escapes,
 * which must propagate as 403).
 */

/** List a directory (harness-root-relative). Returns [] on missing dir. */
export async function listDir(relPath: string): Promise<DirEntry[]> {
  const abs = resolveSafe(relPath);
  let dirents;
  try {
    dirents = await fs.readdir(abs, { withFileTypes: true });
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT" || e.code === "ENOTDIR") return [];
    logError("FS_READDIR", err, { relPath });
    return [];
  }

  const entries = await Promise.all(
    dirents
      .filter((d) => !d.name.startsWith(".")) // hide dotfiles (.git, .gitignore, …)
      .map(async (d): Promise<DirEntry | null> => {
        const childAbs = path.join(abs, d.name);
        try {
          const stat = await fs.stat(childAbs);
          return {
            name: d.name,
            path: toRelative(childAbs),
            type: d.isDirectory() ? "dir" : "file",
            size: stat.size,
            modified: stat.mtime.toISOString(),
          };
        } catch (err) {
          logError("FS_STAT", err, { child: d.name, relPath });
          return null;
        }
      }),
  );

  return entries
    .filter((e): e is DirEntry => e !== null)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

/** Count markdown/text files directly in a directory (non-recursive). */
export async function countFiles(relPath: string): Promise<number> {
  const entries = await listDir(relPath);
  return entries.filter((e) => e.type === "file").length;
}

/** Read + parse a markdown file into frontmatter/body. Returns null on failure. */
export async function readMarkdown(relPath: string): Promise<ParsedFile | null> {
  const abs = resolveSafe(relPath);
  try {
    const raw = await fs.readFile(abs, "utf8");
    const { data, content } = matter(raw);
    return {
      path: toRelative(abs),
      name: path.basename(abs),
      frontmatter: normalizeFrontmatter(data),
      body: content,
      raw,
    };
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code !== "ENOENT") logError("FS_READFILE", err, { relPath });
    return null;
  }
}

/** Frontmatter can contain Dates; coerce to ISO strings so it serializes to the client. */
function normalizeFrontmatter(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = v instanceof Date ? v.toISOString() : v;
  }
  return out;
}

/**
 * Parse an engagement's telemetry ledger. Format:
 *   TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS
 * The header row and blanks are skipped. Newest first.
 */
export async function parseLog(engagement: string): Promise<LogRow[]> {
  const rel = path.posix.join("engagements", engagement, "telemetry", "execution.log");
  const abs = resolveSafe(rel);
  let raw: string;
  try {
    raw = await fs.readFile(abs, "utf8");
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code !== "ENOENT") logError("FS_LOG", err, { engagement });
    return [];
  }

  const rows: LogRow[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split("|").map((p) => p.trim());
    if (parts.length < 5) continue;
    const [timestamp, phase, workBlock, target, status] = parts;
    if (timestamp.toUpperCase() === "TIMESTAMP") continue; // header
    rows.push({ timestamp, phase, workBlock, target, status });
  }
  return rows.reverse();
}
