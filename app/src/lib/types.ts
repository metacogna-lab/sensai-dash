/** Shared serializable shapes passed from server (fs) to client components. */

export interface DirEntry {
  name: string;
  /** Harness-root-relative POSIX path. */
  path: string;
  type: "dir" | "file";
  size: number;
  /** ISO mtime, or null if unavailable. */
  modified: string | null;
}

export interface ParsedFile {
  path: string;
  name: string;
  frontmatter: Record<string, unknown>;
  body: string;
  raw: string;
}

export interface LogRow {
  timestamp: string;
  phase: string;
  workBlock: string;
  target: string;
  status: string;
}

export interface StageCount {
  key: string;
  label: string;
  count: number;
}

export interface EngagementSummary {
  id: string;
  /** Harness-root-relative path to the engagement folder. */
  path: string;
  focus: string | null;
  status: string | null;
  lastCheckpoint: string | null;
  active: boolean;
  stages: StageCount[];
  inputCount: number;
  outputCount: number;
  /** ISO timestamp of the most recent execution.log entry, or null. */
  lastActivity: string | null;
  /** True when lastActivity is within 24h. */
  recentlyActive: boolean;
}

export interface GlobalTelemetry {
  engagements: number;
  nodes: number;
  theories: number;
  economicModels: number;
}

export interface ArtifactCard {
  name: string;
  path: string;
  frontmatter: Record<string, unknown>;
}

export interface PipelineColumn {
  key: string;
  label: string;
  hint: string;
  cards: ArtifactCard[];
}
