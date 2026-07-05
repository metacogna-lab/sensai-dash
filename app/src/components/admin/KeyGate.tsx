"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { PaperCard } from "@/components/ui/PaperCard";
import { keyStore } from "@/lib/anthropic";

/**
 * Client-side key entry. The key is written to sessionStorage ONLY — it never
 * reaches the Next.js server. Calls `onUnlock` once a non-empty key is stored.
 */
export function KeyGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    keyStore.set(trimmed);
    onUnlock();
  };

  return (
    <PaperCard className="mx-auto max-w-md">
      <div className="mb-4 flex items-center gap-2 text-emerald">
        <KeyRound className="h-5 w-5" />
        <h2 className="text-base font-semibold text-ink">Unlock the Forge</h2>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-ink-dim">
        Paste an <code className="font-mono text-emerald">ANTHROPIC_API_KEY</code>. It is held only
        in this browser tab&rsquo;s <span className="font-mono">sessionStorage</span> and sent
        directly to Anthropic — never to this app&rsquo;s server, never to disk.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-ant-…"
          className="w-full rounded-md border border-edge bg-void px-3 py-2.5 font-mono text-sm text-ink outline-none focus:border-emerald/60"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-emerald/50 bg-emerald/10 px-4 py-2 text-sm font-medium text-emerald transition-colors hover:bg-emerald/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShieldCheck className="h-4 w-4" />
          Store key for this session
        </button>
      </form>
    </PaperCard>
  );
}
