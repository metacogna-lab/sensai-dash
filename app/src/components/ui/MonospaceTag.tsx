import { cn } from "@/lib/cn";

interface MonospaceTagProps {
  label: string;
  value: React.ReactNode;
}

/** Status/type values that should glow emerald. Frontmatter-driven — unknown keys stay neutral. */
const EMERALD_VALUES = new Set(["ready", "active", "success", "pass", "verified", "done"]);
const AMBER_VALUES = new Set(["draft", "pending", "queue", "wip", "pass-with-notes"]);
const RED_VALUES = new Set(["fail", "blocked", "rejected", "error", "quarantine"]);

function accentFor(value: string): string {
  const v = value.toLowerCase();
  if (EMERALD_VALUES.has(v)) return "text-emerald border-emerald/40";
  if (AMBER_VALUES.has(v)) return "text-amber-300 border-amber-300/30";
  if (RED_VALUES.has(v)) return "text-red-400 border-red-400/30";
  return "text-ink-dim border-edge";
}

/**
 * A JetBrains-Mono badge for a single `key: value` frontmatter pair. Renders whatever
 * keys a file carries — no per-artifact-type hardcoding.
 */
export function MonospaceTag({ label, value }: MonospaceTagProps) {
  const text = String(value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border bg-void/50 px-2 py-0.5 font-mono text-[11px] leading-5",
        accentFor(text),
      )}
    >
      <span className="text-ink-dim">{label}:</span>
      <span className="font-medium">{text}</span>
    </span>
  );
}
