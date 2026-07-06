import { cn } from "@/lib/cn";

interface MonospaceTagProps {
  label: string;
  value: React.ReactNode;
  /** "highlight" renders emerald accent — for work block and active-state tags. */
  variant?: "default" | "highlight";
  /** When provided, wraps the tag in a button. Caller must stopPropagation if needed. */
  onClick?: (e: React.MouseEvent) => void;
}

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
export function MonospaceTag({ label, value, variant = "default", onClick }: MonospaceTagProps) {
  const text = String(value);
  const accentClass =
    variant === "highlight"
      ? "text-emerald border-emerald/40 hover:bg-emerald/10"
      : accentFor(text);

  const inner = (
    <>
      <span className="text-ink-dim">{label}:</span>
      <span className="font-medium">{text}</span>
    </>
  );

  const base = cn(
    "inline-flex items-center gap-1.5 rounded border bg-void/50 px-2 py-0.5 font-mono text-[11px] leading-5",
    accentClass,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(base, "cursor-pointer transition-colors")}>
        {inner}
      </button>
    );
  }

  return <span className={base}>{inner}</span>;
}
