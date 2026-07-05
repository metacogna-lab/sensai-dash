import path from "node:path";
import { realpathSync } from "node:fs";

/**
 * The single read-only chokepoint. Every filesystem access in this app resolves a
 * caller-supplied relative path through `resolveSafe`, which confines it under the
 * harness root (SENSAI_ROOT). Any path that escapes — via `..`, an absolute path, or
 * a symlink pointing outside — throws SandboxError, which handlers surface as HTTP 403.
 *
 * There are deliberately NO write helpers in this module: the deck is read-only.
 */
export class SandboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SandboxError";
  }
}

/** Absolute harness root — the folder containing `engagements/`. */
export function sensaiRoot(): string {
  const configured = process.env.SENSAI_ROOT?.trim();
  const root = configured && configured.length > 0
    ? configured
    : path.resolve(process.cwd(), "..");
  return path.resolve(root);
}

/**
 * Resolve `relPath` (relative to the harness root) to an absolute path, guaranteeing
 * the result stays inside the root. Throws SandboxError otherwise.
 */
export function resolveSafe(relPath: string): string {
  const root = sensaiRoot();

  // Normalize the request; reject absolute inputs outright.
  const cleaned = (relPath ?? "").replace(/^\/+/, "");
  if (path.isAbsolute(cleaned)) {
    throw new SandboxError("absolute paths are not permitted");
  }

  const candidate = path.resolve(root, cleaned);

  // Lexical containment check first (catches `..` traversal without touching disk).
  const rel = path.relative(root, candidate);
  if (rel === ".." || rel.startsWith(`..${path.sep}`)) {
    throw new SandboxError("path escapes the harness root");
  }

  // Symlink-aware check: resolve real paths where they exist and re-verify containment.
  try {
    const realRoot = realpathSync(root);
    const realCandidate = realpathSync(candidate);
    const realRel = path.relative(realRoot, realCandidate);
    if (realRel === ".." || realRel.startsWith(`..${path.sep}`)) {
      throw new SandboxError("resolved path escapes the harness root");
    }
    return realCandidate;
  } catch (err) {
    if (err instanceof SandboxError) throw err;
    // Target doesn't exist yet (ENOENT) — lexical check already passed, so the
    // *intended* location is safe. Return the lexically-resolved candidate.
    return candidate;
  }
}

/** Convert an absolute path back to a harness-root-relative POSIX path (for API responses). */
export function toRelative(absPath: string): string {
  return path.relative(sensaiRoot(), absPath).split(path.sep).join("/");
}
