/**
 * CLIENT-ONLY Anthropic client for the Admin Synthesis Portal.
 *
 * The key is sourced from the browser's sessionStorage and sent DIRECTLY to
 * api.anthropic.com — it is never posted to, or logged by, the Next.js server.
 * We deliberately use raw fetch (not the SDK) to keep the browser bundle small and
 * to make the single outbound request auditable in the network tab.
 *
 * Requires the `anthropic-dangerous-direct-browser-access` header, which opts into
 * the CORS-enabled browser path. Model ids per CLAUDE.md: default claude-opus-4-8.
 */

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const KEY_STORAGE = "sensai.anthropic_key";

export const SYNTHESIS_MODELS = [
  { id: "claude-opus-4-8", label: "Opus 4.8 (deepest)" },
  { id: "claude-sonnet-5", label: "Sonnet 5 (balanced)" },
  { id: "claude-haiku-4-5", label: "Haiku 4.5 (fast)" },
] as const;

export const DEFAULT_MODEL = SYNTHESIS_MODELS[0].id;

/** sessionStorage helpers — key lives only for the browser session. */
export const keyStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(KEY_STORAGE);
  },
  set(key: string): void {
    window.sessionStorage.setItem(KEY_STORAGE, key.trim());
  },
  clear(): void {
    window.sessionStorage.removeItem(KEY_STORAGE);
  },
};

export interface SynthesisRequest {
  apiKey: string;
  model?: string;
  system: string;
  prompt: string;
  maxTokens?: number;
  signal?: AbortSignal;
}

/**
 * Stream a synthesis response as an async iterator of text deltas. Parses the
 * Anthropic SSE format, yielding `content_block_delta` → `text_delta` chunks.
 */
export async function* streamSynthesis(
  req: SynthesisRequest,
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    signal: req.signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": req.apiKey,
      "anthropic-version": API_VERSION,
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: req.model ?? DEFAULT_MODEL,
      max_tokens: req.maxTokens ?? 16000,
      stream: true,
      system: req.system,
      messages: [{ role: "user", content: req.prompt }],
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Anthropic API error (${res.status}): ${detail.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line.
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const evt of events) {
      const dataLine = evt.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      const json = dataLine.slice(5).trim();
      if (!json || json === "[DONE]") continue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(json);
      } catch {
        continue;
      }
      const p = parsed as {
        type?: string;
        delta?: { type?: string; text?: string };
        error?: { message?: string };
      };
      if (p.type === "content_block_delta" && p.delta?.type === "text_delta") {
        yield p.delta.text ?? "";
      } else if (p.type === "error") {
        throw new Error(p.error?.message ?? "stream error");
      }
    }
  }
}
