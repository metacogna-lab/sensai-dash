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
  /** Parsed milestone completion from goals/active_milestones.md, or null when file absent. */
  milestones: { done: number; total: number } | null;
  /** Counts for non-Kanban sidebar dirs (inbox + archive). */
  sidebarCounts: { inbox: number; archive: number };
}

export interface GlobalTelemetry {
  engagements: number;
  /** ID of the currently active tenant (operations/.active_engagement). */
  activeEngagement: string | null;
  nodes: number;
  theories: number;
  economicModels: number;
  verification: number;
  alignment: number;
  broadcast: number;
  /** Total archive count across all engagements (consumed throughput signal). */
  archived: number;
  /** Total quarantine count across all engagements (HITL backlog). */
  quarantined: number;
}

export interface ArtifactCard {
  name: string;
  path: string;
  frontmatter: Record<string, unknown>;
  /** ISO mtime from fs.stat — used for newest-first sort. */
  modified: string | null;
}

export interface PipelineColumn {
  key: string;
  label: string;
  hint: string;
  cards: ArtifactCard[];
}

// ── Chat session types (TASK-11) ──────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  /** Number of artifact files included in context (user turns only). */
  contextFiles?: number;
  /** Whether artifact context was truncated at MAX_CHARS (user turns only). */
  contextTruncated?: boolean;
  /** Model used to generate this response (assistant turns only). */
  model?: string;
  /** Rough token estimate: content.length / 4 (assistant turns only). */
  tokenEstimate?: number;
}

export interface ChatSession {
  id: string;
  /** First 60 chars of the first user message, set on first message send. */
  title: string;
  /** Engagement IDs in scope when session was created. */
  engagement: string[];
  model: string;
  createdAt: string;
  /** Updated on every new message. */
  updatedAt: string;
  messages: ChatMessage[];
}

export interface SessionMeta {
  id: string;
  title: string;
  engagement: string[];
  model: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}
