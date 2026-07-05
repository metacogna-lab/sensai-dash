/**
 * The pipeline phase registry. The Kanban columns, corpus counts, and phase→directory
 * mapping are DATA, not hardcoded JSX. When the harness adds a phase (per
 * operations/SKILL.md), a new column appears by adding one entry here — the UI never
 * needs to change. `dir` is relative to an engagement root.
 */
export interface PipelineStage {
  key: string;
  label: string;
  /** Directory relative to `engagements/<name>/`. */
  dir: string;
  /** Which side of the raw→outcome funnel this stage sits on (for the progress bar). */
  side: "input" | "output";
  /** Short glyph/description for the column header. */
  hint: string;
}

export const PIPELINE: readonly PipelineStage[] = [
  { key: "raw", label: "Raw", dir: "research_body/01_raw", side: "input", hint: "ingested text" },
  { key: "nodes", label: "Nodes", dir: "research_body/02_nodes", side: "input", hint: "structured extractions" },
  { key: "theories", label: "Theories", dir: "outcomes/01_theories", side: "output", hint: "synthesized" },
  { key: "economic", label: "Economic Models", dir: "outcomes/02_economic_models", side: "output", hint: "monetization" },
  { key: "verification", label: "Verification", dir: "outcomes/03_verification", side: "output", hint: "stress-tested" },
  { key: "alignment", label: "Alignment", dir: "outcomes/04_alignment", side: "output", hint: "unified deliverable" },
  { key: "broadcast", label: "Broadcast", dir: "outcomes/05_broadcast", side: "output", hint: "external copy" },
] as const;

/** Stages that count as "economic outcomes" for global telemetry. */
export const OUTPUT_STAGES = PIPELINE.filter((s) => s.side === "output");
export const INPUT_STAGES = PIPELINE.filter((s) => s.side === "input");
