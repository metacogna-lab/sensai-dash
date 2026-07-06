"use client";

import { useEffect, useRef, useState } from "react";
import { useDrawer } from "@/components/dashboard/MarkdownDrawer";
import { PIPELINE } from "@/lib/pipeline";
import type { EngagementSummary, DirEntry } from "@/lib/types";

interface PaletteEntry {
  path: string;
  name: string;
  engagement: string;
  stageKey: string;
  stageLabel: string;
}

let cachedIndex: PaletteEntry[] | null = null;

async function fetchEngagements(): Promise<EngagementSummary[]> {
  const res = await fetch("/api/engagements");
  if (!res.ok) return [];
  const data = (await res.json()) as { engagements: EngagementSummary[] };
  return data.engagements ?? [];
}

async function fetchTree(path: string): Promise<DirEntry[]> {
  const res = await fetch(`/api/tree?path=${encodeURIComponent(path)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { entries: DirEntry[] };
  return data.entries ?? [];
}

async function buildIndex(): Promise<PaletteEntry[]> {
  if (cachedIndex) return cachedIndex;
  const engagements = await fetchEngagements();
  const entries: PaletteEntry[] = [];
  await Promise.all(
    engagements.map(async (eng) => {
      await Promise.all(
        PIPELINE.map(async (stage) => {
          const path = `engagements/${eng.id}/${stage.dir}`;
          const dirEntries = await fetchTree(path);
          for (const e of dirEntries) {
            if (e.type === "file" && e.name.endsWith(".md")) {
              entries.push({
                path: e.path,
                name: e.name.replace(/\.md$/, "").replace(/^[a-z]+--/, "").replace(/[-_]/g, " "),
                engagement: eng.id,
                stageKey: stage.key,
                stageLabel: stage.label,
              });
            }
          }
        }),
      );
    }),
  );
  cachedIndex = entries;
  return entries;
}

/** Global Cmd+K artifact search palette. Must be rendered inside <DrawerProvider>. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<PaletteEntry[]>([]);
  const [indexBuilt, setIndexBuilt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openFile } = useDrawer();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 0);
    if (indexBuilt) return;
    buildIndex().then((entries) => {
      setIndex(entries);
      setIndexBuilt(true);
    });
  }, [open, indexBuilt]);

  const results =
    query.length < 1
      ? index.slice(0, 8)
      : index
          .filter(
            (e) =>
              e.name.toLowerCase().includes(query.toLowerCase()) ||
              e.path.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 8);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-void/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="fixed left-1/2 top-[20%] w-[90vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-edge bg-[#0E1015]/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="w-full border-b border-edge bg-transparent px-4 py-3 font-mono text-sm text-ink outline-none placeholder:text-ink-dim"
          placeholder="Search artifacts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="max-h-72 overflow-y-auto py-1">
          {!indexBuilt && (
            <li className="animate-pulse px-4 py-3 font-mono text-xs text-ink-dim">
              Building index…
            </li>
          )}
          {indexBuilt && results.length === 0 && query.length > 0 && (
            <li className="px-4 py-3 font-mono text-xs text-ink-dim">
              No results for &ldquo;{query}&rdquo;
            </li>
          )}
          {results.map((entry) => (
            <li key={entry.path}>
              <button
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-paper/60"
                onClick={() => {
                  openFile(entry.path);
                  setOpen(false);
                }}
              >
                <span className="shrink-0 rounded bg-edge/40 px-1.5 font-mono text-[10px] text-ink-dim">
                  {entry.stageLabel}
                </span>
                <span className="flex-1 truncate font-mono text-sm text-ink capitalize">
                  {entry.name}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-ink-dim">
                  {entry.engagement}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-edge/30 px-4 py-1.5 font-mono text-[10px] text-ink-dim">
          ↵ open · Esc close · Cmd+K toggle
        </div>
      </div>
    </div>
  );
}
