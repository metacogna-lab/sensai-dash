import path from "node:path";
import { appendFileSync, mkdirSync } from "node:fs";
import { sensaiRoot } from "./sandbox";

/**
 * Error protocol (PRD-tasks.md §1): read/parse/API failures are logged to
 * `agents/errors/[TIMESTAMP]_[TYPE].md` — never swallowed silently. This is the ONLY
 * place the deck writes to the harness, and it writes strictly to the errors log dir
 * (outside `engagements/`), so the read-only boundary over engagement data holds.
 *
 * logError itself never throws: a failure to log must not cascade into the request.
 */
export function logError(type: string, err: unknown, context?: Record<string, unknown>): void {
  try {
    const dir = path.join(sensaiRoot(), "agents", "errors");
    mkdirSync(dir, { recursive: true });

    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, "-");
    const safeType = type.replace(/[^a-zA-Z0-9_-]/g, "_").toUpperCase();
    const file = path.join(dir, `${stamp}_${safeType}.md`);

    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error && err.stack ? err.stack : "(no stack)";

    const body = [
      `# ${safeType}`,
      "",
      `- **When:** ${now.toISOString()}`,
      `- **Type:** ${safeType}`,
      context
        ? `- **Context:** \`${JSON.stringify(context)}\``
        : "- **Context:** (none)",
      "",
      "## Message",
      "",
      "```",
      message,
      "```",
      "",
      "## Stack",
      "",
      "```",
      stack,
      "```",
      "",
    ].join("\n");

    appendFileSync(file, body, "utf8");
  } catch {
    // Logging must never break the request path. Fall back to stderr only.
    // eslint-disable-next-line no-console
    console.error(`[sensai-studio] failed to write error log for type=${type}`);
  }
}
