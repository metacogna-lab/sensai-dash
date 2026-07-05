"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Download, LogOut, Send, Square } from "lucide-react";
import { PaperCard } from "@/components/ui/PaperCard";
import { EnsoLoader } from "@/components/ui/EnsoLoader";
import { renderMarkdown } from "@/lib/markdown";
import {
  DEFAULT_MODEL,
  SYNTHESIS_MODELS,
  keyStore,
  streamSynthesis,
} from "@/lib/anthropic";
import { gatherContext } from "@/lib/synthesisContext";
import type { EngagementSummary } from "@/lib/types";

const SYSTEM_PROMPT =
  "You are the Sensai synthesist. You are given read-only markdown artifacts from one or " +
  "more research engagements (nodes, theories, economic models, verification verdicts). " +
  "Answer the operator's cross-tenant question by synthesizing across the provided context, " +
  "citing artifact paths inline as [[path]]. Be rigorous and concrete. If the context is " +
  "insufficient, say so explicitly rather than inventing facts.";

export function SynthesisTerminal({ onLock }: { onLock: () => void }) {
  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "gathering" | "streaming">("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const outRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/engagements")
      .then((r) => r.json())
      .then((d: { engagements: EngagementSummary[] }) => {
        setEngagements(d.engagements ?? []);
        setSelected(new Set((d.engagements ?? []).map((e) => e.id)));
      })
      .catch(() => setEngagements([]));
  }, []);

  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight });
  }, [output]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const stop = () => {
    abortRef.current?.abort();
    setStatus("idle");
  };

  const run = async () => {
    const apiKey = keyStore.get();
    if (!apiKey || !prompt.trim() || selected.size === 0) return;
    setError(null);
    setOutput("");
    setStatus("gathering");

    try {
      const ctx = await gatherContext([...selected]);
      setStatus("streaming");
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage =
        `# Context (${ctx.fileCount} artifacts` +
        `${ctx.truncated ? ", truncated" : ""})\n\n${ctx.text}\n\n` +
        `# Operator question\n${prompt.trim()}`;

      for await (const delta of streamSynthesis({
        apiKey,
        model,
        system: SYSTEM_PROMPT,
        prompt: userMessage,
        signal: controller.signal,
      })) {
        setOutput((prev) => prev + delta);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message);
      }
    } finally {
      setStatus("idle");
      abortRef.current = null;
    }
  };

  const busy = status !== "idle";

  const copy = () => navigator.clipboard?.writeText(output);
  const exportDoc = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synthesis-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    keyStore.clear();
    onLock();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">The Forge</h1>
        <button
          onClick={logout}
          className="flex min-h-[44px] items-center gap-1.5 text-sm text-ink-dim hover:text-red-400"
        >
          <LogOut className="h-4 w-4" /> Clear key
        </button>
      </div>

      <PaperCard className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {engagements.map((e) => (
            <button
              key={e.id}
              onClick={() => toggle(e.id)}
              className={`min-h-[44px] rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
                selected.has(e.id)
                  ? "border-emerald/50 bg-emerald/10 text-emerald"
                  : "border-edge text-ink-dim hover:text-ink"
              }`}
            >
              {e.id}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="font-mono text-xs text-ink-dim">model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-md border border-edge bg-void px-2 py-1.5 font-mono text-xs text-ink outline-none focus:border-emerald/60"
          >
            {SYNTHESIS_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a cross-tenant orchestration question…"
          rows={3}
          className="w-full resize-y rounded-md border border-edge bg-void px-3 py-2.5 font-mono text-sm text-ink outline-none focus:border-emerald/60"
        />

        <div className="flex items-center gap-2">
          {busy ? (
            <button
              onClick={stop}
              className="flex min-h-[44px] items-center gap-2 rounded-md border border-red-400/40 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10"
            >
              <Square className="h-4 w-4" /> Stop
            </button>
          ) : (
            <button
              onClick={run}
              disabled={!prompt.trim() || selected.size === 0}
              className="flex min-h-[44px] items-center gap-2 rounded-md border border-emerald/50 bg-emerald/10 px-4 py-2 text-sm font-medium text-emerald hover:bg-emerald/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" /> Synthesize
            </button>
          )}
          {output && !busy && (
            <>
              <button onClick={copy} className="flex min-h-[44px] items-center gap-1.5 rounded-md border border-edge px-3 py-2 text-sm text-ink-dim hover:text-emerald">
                <Copy className="h-4 w-4" /> Copy
              </button>
              <button onClick={exportDoc} className="flex min-h-[44px] items-center gap-1.5 rounded-md border border-edge px-3 py-2 text-sm text-ink-dim hover:text-emerald">
                <Download className="h-4 w-4" /> Export
              </button>
            </>
          )}
        </div>
      </PaperCard>

      {error && (
        <PaperCard className="border-red-400/40">
          <p className="font-mono text-sm text-red-400">{error}</p>
        </PaperCard>
      )}

      {(output || busy) && (
        <PaperCard>
          {status === "gathering" && <EnsoLoader label="reading engagement artifacts…" className="my-8" />}
          {status === "streaming" && !output && <EnsoLoader label="synthesizing…" className="my-8" />}
          {output && (
            <div
              ref={outRef}
              className="prose-sensai max-h-[60vh] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
            />
          )}
        </PaperCard>
      )}
    </div>
  );
}
