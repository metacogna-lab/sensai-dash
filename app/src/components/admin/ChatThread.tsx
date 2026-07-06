"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Square, Copy, Download, RefreshCw, Paperclip } from "lucide-react";
import { EnsoLoader } from "@/components/ui/EnsoLoader";
import { renderMarkdown, timeAgo } from "@/lib/markdown";
import { SYNTHESIS_MODELS, DEFAULT_MODEL, keyStore, streamSynthesis } from "@/lib/anthropic";
import { gatherContext, type GatherProgress } from "@/lib/synthesisContext";
import type { ChatSession, ChatMessage } from "@/lib/types";

const SYSTEM_PROMPT_BASE =
  "You are the Sensai synthesist with read-only access to markdown artifacts from research engagements. " +
  "Answer questions by synthesizing across the provided context, citing artifact paths inline as [[path]]. " +
  "Be rigorous and concrete. If context is insufficient, say so explicitly. " +
  "This is an ongoing conversation — you may refer to earlier messages in this thread.";

function buildSystemPrompt(engagements: string[], active: string | null): string {
  return (
    SYSTEM_PROMPT_BASE +
    ` Engagements in scope: ${engagements.join(", ")}.` +
    (active ? ` Active tenant: ${active}.` : "")
  );
}

function MessageBubble({ msg, isStreaming }: { msg: ChatMessage; isStreaming?: boolean }) {
  const copy = () => navigator.clipboard?.writeText(msg.content).catch(() => {});

  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-xl rounded-tr-none border border-edge/30 bg-paper px-4 py-2.5">
          <p className="font-mono text-sm text-ink whitespace-pre-wrap">{msg.content}</p>
          {msg.contextFiles != null && (
            <details className="mt-1">
              <summary className="cursor-pointer font-mono text-[10px] text-ink-dim">
                {msg.contextFiles} artifacts in context{msg.contextTruncated ? " (truncated)" : ""}
              </summary>
            </details>
          )}
          <p className="mt-1 text-right font-mono text-[9px] text-ink-dim">{timeAgo(msg.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div
        className="prose-sensai text-sm"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content || (isStreaming ? "…" : "")) }}
      />
      <div className="mt-1 flex items-center gap-2">
        {msg.model && (
          <span className="rounded bg-edge/40 px-1 font-mono text-[9px] text-ink-dim">{msg.model}</span>
        )}
        {msg.tokenEstimate != null && (
          <span className="font-mono text-[9px] text-ink-dim">~{msg.tokenEstimate} tokens</span>
        )}
        <span className="font-mono text-[9px] text-ink-dim">{timeAgo(msg.timestamp)}</span>
        <button
          onClick={copy}
          className="ml-auto hidden text-ink-dim hover:text-emerald group-hover:block"
          title="Copy"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

interface Props {
  session: ChatSession | null;
  activeEngagement: string | null;
  onSessionUpdate: (session: ChatSession) => void;
}

export function ChatThread({ session, activeEngagement, onSessionUpdate }: Props) {
  const [streamingContent, setStreamingContent] = useState("");
  const [status, setStatus] = useState<"idle" | "gathering" | "streaming">("idle");
  const [gatherProgress, setGatherProgress] = useState<GatherProgress | null>(null);
  const [prompt, setPrompt] = useState("");
  const [includeContext, setIncludeContext] = useState(true);
  const [contextText, setContextText] = useState<string | null>(null);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      setModel(session.model as typeof DEFAULT_MODEL);
      setContextText(null);
    }
  }, [session?.id]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [session?.messages.length, streamingContent]);

  const stop = () => {
    abortRef.current?.abort();
    setStatus("idle");
    setStreamingContent("");
  };

  const send = async () => {
    if (!session || !prompt.trim() || status !== "idle") return;
    const apiKey = keyStore.get();
    if (!apiKey) { setError("No API key — enter one in the Forge."); return; }

    setError(null);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt.trim(),
      timestamp: new Date().toISOString(),
    };
    setPrompt("");

    await fetch(`/api/sessions/${session.id}/message`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userMsg),
    });

    let ctx = contextText;
    let ctxFileCount = 0;
    let ctxTruncated = false;

    if (includeContext && ctx === null) {
      setStatus("gathering");
      try {
        const gathered = await gatherContext(session.engagement, (p) => setGatherProgress(p));
        ctx = gathered.text;
        ctxFileCount = gathered.fileCount;
        ctxTruncated = gathered.truncated;
        setContextText(ctx);
        userMsg.contextFiles = ctxFileCount;
        userMsg.contextTruncated = ctxTruncated;
      } catch (err) {
        setError(`Context gathering failed: ${err instanceof Error ? err.message : "Unknown"}`);
        setStatus("idle");
        return;
      } finally {
        setGatherProgress(null);
      }
    }

    const history = [...session.messages, userMsg];
    const anthropicMessages = history.map((m) => ({ role: m.role, content: m.content }));

    if (ctx && anthropicMessages.length > 0) {
      anthropicMessages[0] = {
        ...anthropicMessages[0],
        content: `# Context (${ctxFileCount} artifacts${ctxTruncated ? ", truncated" : ""})\n\n${ctx}\n\n---\n\n${anthropicMessages[0].content}`,
      };
    }

    setStatus("streaming");
    const controller = new AbortController();
    abortRef.current = controller;
    let fullContent = "";

    try {
      for await (const delta of streamSynthesis({
        apiKey,
        model,
        system: buildSystemPrompt(session.engagement, activeEngagement),
        messages: anthropicMessages,
        signal: controller.signal,
      })) {
        fullContent += delta;
        setStreamingContent(fullContent);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message);
      }
    } finally {
      setStreamingContent("");
      setStatus("idle");
      abortRef.current = null;
    }

    if (!fullContent) return;

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: fullContent,
      timestamp: new Date().toISOString(),
      model,
      tokenEstimate: Math.round(fullContent.length / 4),
    };

    const res = await fetch(`/api/sessions/${session.id}/message`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(assistantMsg),
    });
    if (res.ok) {
      const data = (await res.json()) as { session: { updatedAt: string; title: string } };
      onSessionUpdate({
        ...session,
        messages: [...history, assistantMsg],
        updatedAt: data.session.updatedAt,
        title: data.session.title,
      });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const exportMd = () => {
    if (!session) return;
    const lines = [
      `# ${session.title}`,
      `Engagements: ${session.engagement.join(", ")}`,
      `Model: ${session.model}`,
      "",
      "---",
      "",
      ...session.messages.map(
        (m) => `### ${m.role === "user" ? "You" : "Sensai"}\n\n${m.content}`,
      ),
    ];
    const blob = new Blob([lines.join("\n\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${session.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshContext = () => setContextText(null);

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-sm text-ink-dim">
        Select a session or create a new chat.
      </div>
    );
  }

  const busy = status !== "idle";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-edge px-4 py-2.5">
        <h2 className="flex-1 truncate font-mono text-sm font-medium text-ink">{session.title}</h2>
        {session.engagement.map((id) => (
          <span key={id} className="rounded bg-edge/50 px-1.5 font-mono text-[10px] text-ink-dim">{id}</span>
        ))}
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as typeof DEFAULT_MODEL)}
          className="rounded border border-edge bg-void px-2 py-1 font-mono text-[10px] text-ink outline-none focus:border-emerald/60"
        >
          {SYNTHESIS_MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        <button onClick={exportMd} className="text-ink-dim hover:text-emerald" title="Export MD">
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Thread */}
      <div ref={threadRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {session.messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {gatherProgress && (
          <p className="animate-pulse font-mono text-xs text-ink-dim">
            reading artifacts… {gatherProgress.filesDone} / {gatherProgress.maxFiles} files ·{" "}
            {gatherProgress.charsUsed.toLocaleString()} / {gatherProgress.maxChars.toLocaleString()} chars
          </p>
        )}
        {status === "streaming" && (
          <MessageBubble
            msg={{ id: "streaming", role: "assistant", content: streamingContent, timestamp: new Date().toISOString() }}
            isStreaming
          />
        )}
      </div>

      {error && (
        <p className="border-t border-red-400/20 px-4 py-2 font-mono text-xs text-red-400">{error}</p>
      )}

      {/* Input area */}
      <div className="border-t border-edge/30 bg-void/50 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about the research…"
            rows={1}
            className="flex-1 resize-none rounded-md border border-edge bg-paper px-3 py-2 font-mono text-sm text-ink outline-none focus:border-emerald/60"
            style={{ maxHeight: "9rem" }}
          />
          <button
            onClick={() => setIncludeContext((v) => !v)}
            className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${includeContext ? "border-emerald/50 text-emerald" : "border-edge text-ink-dim hover:text-ink"}`}
            title={includeContext ? "Context on (click to disable)" : "Context off (click to enable)"}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            onClick={refreshContext}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-edge text-ink-dim hover:text-emerald"
            title="Re-gather context on next send"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {busy ? (
            <button
              onClick={stop}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-red-400/40 text-red-400 hover:bg-red-400/10"
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!prompt.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-emerald/50 bg-emerald/10 text-emerald hover:bg-emerald/20 disabled:cursor-not-allowed disabled:opacity-40"
              title="Send (Enter)"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
        {status === "gathering" && <EnsoLoader size="sm" label="reading artifacts…" className="mt-2" />}
      </div>
    </div>
  );
}
