import path from "node:path";
import { promises as fs } from "node:fs";
import { resolveSafe } from "./sandbox";
import { listDir, countFiles, readMarkdown, parseLog } from "./fileParser";
import { logError } from "./errors";
import { PIPELINE, PIPELINE_SIDEBAR, INPUT_STAGES, OUTPUT_STAGES } from "./pipeline";
import type {
  ArtifactCard,
  DirEntry,
  EngagementSummary,
  GlobalTelemetry,
  LogRow,
  ParsedFile,
  PipelineColumn,
  StageCount,
} from "./types";

/**
 * Repository interface for the flat-file ecosystem. Components depend on this, never on
 * `fs` directly — so a future `StaticSnapshotDataSource` (build-time JSON for static
 * hosting) can be swapped in without touching any component.
 */
export interface DataSource {
  listEngagements(): Promise<EngagementSummary[]>;
  getEngagement(id: string): Promise<EngagementSummary | null>;
  getTree(relPath: string): Promise<DirEntry[]>;
  readFile(relPath: string): Promise<ParsedFile | null>;
  getLog(engagement: string): Promise<LogRow[]>;
  getGlobalTelemetry(): Promise<GlobalTelemetry>;
  getPipeline(engagement: string): Promise<PipelineColumn[]>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Live filesystem-backed source (read-only, sandboxed). */
class FsDataSource implements DataSource {
  private async activeEngagement(): Promise<string | null> {
    try {
      const abs = resolveSafe(path.posix.join("operations", ".active_engagement"));
      const raw = await fs.readFile(abs, "utf8");
      return raw.trim() || null;
    } catch {
      return null;
    }
  }

  private async engagementIds(): Promise<string[]> {
    const entries = await listDir("engagements");
    return entries.filter((e) => e.type === "dir").map((e) => e.name);
  }

  private async parseMilestones(
    id: string,
  ): Promise<{ done: number; total: number } | null> {
    try {
      const file = await readMarkdown(
        path.posix.join("engagements", id, "goals", "active_milestones.md"),
      );
      if (!file) return null;
      const done = (file.body.match(/^\s*-\s*\[x\]/gim) ?? []).length;
      const pending = (file.body.match(/^\s*-\s*\[\s\]/gm) ?? []).length;
      const total = done + pending;
      return total > 0 ? { done, total } : null;
    } catch {
      return null;
    }
  }

  private async summarize(id: string, active: string | null): Promise<EngagementSummary> {
    const base = path.posix.join("engagements", id);

    // Stage counts from the pipeline registry (includes quarantine now).
    const [stages, sidebarRaw, milestones] = await Promise.all([
      Promise.all(
        PIPELINE.map(async (s) => ({
          key: s.key,
          label: s.label,
          count: await countFiles(path.posix.join(base, s.dir)),
        })),
      ),
      Promise.all(
        PIPELINE_SIDEBAR.map(async (s) => ({
          key: s.key,
          count: await countFiles(path.posix.join(base, s.dir)),
        })),
      ),
      this.parseMilestones(id),
    ]);

    const countFor = (keys: readonly { key: string }[]) =>
      stages.filter((s) => keys.some((k) => k.key === s.key)).reduce((n, s) => n + s.count, 0);

    const sidebarCounts = {
      inbox: sidebarRaw.find((s) => s.key === "inbox")?.count ?? 0,
      archive: sidebarRaw.find((s) => s.key === "archive")?.count ?? 0,
    };

    // INDEX.md frontmatter for focus/status/checkpoint.
    const index = await readMarkdown(path.posix.join(base, "INDEX.md"));
    const fm = index?.frontmatter ?? {};

    // Last activity from the telemetry ledger (newest row first).
    const log = await parseLog(id);
    const lastActivity = log.length > 0 ? isoOrNull(log[0].timestamp) : null;
    const recentlyActive =
      lastActivity !== null && Date.now() - new Date(lastActivity).getTime() < DAY_MS;

    return {
      id,
      path: base,
      focus: asString(fm.current_focus),
      status: asString(fm.status),
      lastCheckpoint: asString(fm.last_checkpoint),
      active: id === active,
      stages: stages as StageCount[],
      inputCount: countFor(INPUT_STAGES),
      outputCount: countFor(OUTPUT_STAGES),
      lastActivity,
      recentlyActive,
      milestones,
      sidebarCounts,
    };
  }

  async listEngagements(): Promise<EngagementSummary[]> {
    try {
      const active = await this.activeEngagement();
      const ids = await this.engagementIds();
      const summaries = await Promise.all(ids.map((id) => this.summarize(id, active)));
      return summaries.sort((a, b) => a.id.localeCompare(b.id));
    } catch (err) {
      logError("DATASOURCE_LIST", err);
      return [];
    }
  }

  async getEngagement(id: string): Promise<EngagementSummary | null> {
    const ids = await this.engagementIds();
    if (!ids.includes(id)) return null;
    const active = await this.activeEngagement();
    return this.summarize(id, active);
  }

  async getTree(relPath: string): Promise<DirEntry[]> {
    return listDir(relPath);
  }

  async readFile(relPath: string): Promise<ParsedFile | null> {
    return readMarkdown(relPath);
  }

  async getLog(engagement: string): Promise<LogRow[]> {
    return parseLog(engagement);
  }

  async getPipeline(engagement: string): Promise<PipelineColumn[]> {
    const base = path.posix.join("engagements", engagement);
    const columns = await Promise.all(
      PIPELINE.map(async (stage): Promise<PipelineColumn> => {
        const entries = await this.getTree(path.posix.join(base, stage.dir));
        const cards: ArtifactCard[] = await Promise.all(
          entries
            .filter((e) => e.type === "file" && e.name.endsWith(".md"))
            .map(async (e): Promise<ArtifactCard> => {
              const file = await readMarkdown(e.path);
              return {
                name: e.name,
                path: e.path,
                frontmatter: file?.frontmatter ?? {},
                modified: e.modified,
              };
            }),
        );
        // Sort newest-first by mtime.
        const sorted = [...cards].sort((a, b) => {
          if (!a.modified && !b.modified) return 0;
          if (!a.modified) return 1;
          if (!b.modified) return -1;
          return new Date(b.modified).getTime() - new Date(a.modified).getTime();
        });
        return { key: stage.key, label: stage.label, hint: stage.hint, cards: sorted };
      }),
    );
    return columns;
  }

  async getGlobalTelemetry(): Promise<GlobalTelemetry> {
    const engagements = await this.listEngagements();
    const sumStage = (key: string) =>
      engagements.reduce(
        (n, e) => n + (e.stages.find((s) => s.key === key)?.count ?? 0),
        0,
      );
    return {
      engagements: engagements.length,
      activeEngagement: engagements.find((e) => e.active)?.id ?? null,
      nodes: sumStage("nodes"),
      theories: sumStage("theories"),
      economicModels: sumStage("economic"),
      verification: sumStage("verification"),
      alignment: sumStage("alignment"),
      broadcast: sumStage("broadcast"),
      quarantined: sumStage("quarantine"),
      archived: engagements.reduce((n, e) => n + e.sidebarCounts.archive, 0),
    };
  }
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : v == null ? null : String(v);
}

function isoOrNull(ts: string): string | null {
  // execution.log timestamps look like "2026-07-05 17:52:12" — coerce to ISO.
  const d = new Date(ts.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Singleton live source. Swap here to change the backing store app-wide. */
export const dataSource: DataSource = new FsDataSource();
