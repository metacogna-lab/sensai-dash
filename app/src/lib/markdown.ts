import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/**
 * Render a markdown body to HTML for the drawer. The harness produces trusted,
 * deterministic markdown (no user-authored HTML injection surface), so we render
 * directly; wrap output in `.prose-sensai` for Shunyata typography.
 */
export function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false }) as string;
}

/** Format an ISO timestamp for compact display; falls back to the raw string. */
export function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Relative "3h ago" style string. */
export function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
