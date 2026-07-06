/** Utilities for log row rendering. Used by client components only — no Node.js imports. */

const PHASE_DIR: Record<string, string> = {
  CONSUME: "research_body/02_nodes",
  ANALYZE: "outcomes/01_theories",
  EVALUATE: "outcomes/02_economic_models",
  VERIFY: "outcomes/03_verification",
  SYNTHESIZE: "outcomes/04_alignment",
  BROADCAST: "outcomes/05_broadcast",
  QUARANTINE: "research_body/04_quarantine",
};

/**
 * Attempt to reconstruct a harness-root-relative path from a log row's target and phase.
 * Returns null when the phase has no known output directory (e.g. INIT, INDEX, EXTRACT).
 */
export function resolveTargetPath(
  engagement: string,
  phase: string,
  target: string,
): string | null {
  if (!target || target === "—" || target === "-") return null;
  const dir = PHASE_DIR[phase.toUpperCase()];
  if (!dir) return null;
  return `engagements/${engagement}/${dir}/${target}`;
}
