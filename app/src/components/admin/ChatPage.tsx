"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { SessionList } from "./SessionList";
import { ChatThread } from "./ChatThread";
import { LogOut } from "lucide-react";
import { keyStore, DEFAULT_MODEL } from "@/lib/anthropic";
import type { ChatSession, SessionMeta, EngagementSummary } from "@/lib/types";

interface Props {
  onLock: () => void;
}

async function fetchSessions(): Promise<SessionMeta[]> {
  const res = await fetch("/api/sessions");
  if (!res.ok) return [];
  const data = (await res.json()) as { sessions: SessionMeta[] };
  return data.sessions ?? [];
}

async function fetchEngagements(): Promise<EngagementSummary[]> {
  const res = await fetch("/api/engagements");
  if (!res.ok) return [];
  const data = (await res.json()) as { engagements: EngagementSummary[] };
  return data.engagements ?? [];
}

async function loadSession(id: string): Promise<ChatSession | null> {
  const res = await fetch(`/api/sessions/${id}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { session: ChatSession };
  return data.session;
}

export function ChatPage({ onLock }: Props) {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    Promise.all([fetchSessions(), fetchEngagements()]).then(([s, e]) => {
      setSessions(s);
      setEngagements(e);
    });
  }, []);

  const activeEngagement = engagements.find((e) => e.active)?.id ?? null;

  const selectSession = async (id: string) => {
    const session = await loadSession(id);
    setActiveSession(session);
  };

  const createSession = async () => {
    const engagementIds = engagements.map((e) => e.id);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ engagement: engagementIds, model: DEFAULT_MODEL }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { session: ChatSession };
    setActiveSession(data.session);
    const refreshed = await fetchSessions();
    setSessions(refreshed);
  };

  const deleteSession = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (activeSession?.id === id) setActiveSession(null);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSessionUpdate = (updated: ChatSession) => {
    setActiveSession(updated);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === updated.id
          ? { ...s, title: updated.title, updatedAt: updated.updatedAt, messageCount: updated.messages.length }
          : s,
      ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <MessageSquare className="h-6 w-6 text-emerald" />
          The Forge
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar((v) => !v)}
            className="flex min-h-[44px] items-center gap-1.5 rounded-md border border-edge px-3 py-1.5 font-mono text-xs text-ink-dim hover:text-ink md:hidden"
          >
            Sessions
          </button>
          <button
            onClick={onLock}
            className="flex min-h-[44px] items-center gap-1.5 text-sm text-ink-dim hover:text-red-400"
          >
            <LogOut className="h-4 w-4" /> Clear key
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-lg border border-edge bg-paper"
        style={{ height: "calc(100vh - 12rem)" }}
      >
        <div className="flex h-full">
          <aside
            className={`w-56 shrink-0 border-r border-edge overflow-y-auto ${showSidebar ? "block" : "hidden"} md:block`}
          >
            <SessionList
              sessions={sessions}
              activeId={activeSession?.id ?? null}
              onSelect={selectSession}
              onCreate={createSession}
              onDelete={deleteSession}
            />
          </aside>
          <main className="flex flex-1 flex-col overflow-hidden">
            <ChatThread
              session={activeSession}
              activeEngagement={activeEngagement}
              onSessionUpdate={handleSessionUpdate}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
