"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { EnsoLoader } from "@/components/ui/EnsoLoader";
import { MonospaceTag } from "@/components/ui/MonospaceTag";
import { renderMarkdown } from "@/lib/markdown";
import { VERDICT_TEXT_COLOR } from "@/lib/constants";
import type { ParsedFile } from "@/lib/types";

interface DrawerContextValue {
  openFile: (path: string) => void;
  close: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within <DrawerProvider>");
  return ctx;
}

const PRIORITY_KEYS = [
  "type",
  "status",
  "verdict",
  "work_block",
  "model",
  "phase",
  "created",
  "source",
  "slug",
];

function sortFrontmatter(entries: [string, unknown][]): [string, unknown][] {
  const priority = entries
    .filter(([k]) => PRIORITY_KEYS.includes(k))
    .sort(([a], [b]) => PRIORITY_KEYS.indexOf(a) - PRIORITY_KEYS.indexOf(b));
  const rest = entries
    .filter(([k]) => !PRIORITY_KEYS.includes(k))
    .sort(([a], [b]) => a.localeCompare(b));
  return [...priority, ...rest];
}

function valueClass(key: string, value: unknown): string {
  const v = String(value);
  if (key === "status" && v === "ready") return "text-emerald";
  if (key === "verdict") return VERDICT_TEXT_COLOR[v] ?? "text-ink";
  return "text-ink";
}

function isPriorityKey(key: string): boolean {
  return PRIORITY_KEYS.includes(key);
}

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openFile = useCallback((p: string) => setFilePath(p), []);
  const close = useCallback(() => setFilePath(null), []);

  useEffect(() => {
    if (!filePath) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFile(null);
    fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json() as Promise<ParsedFile>;
      })
      .then((data) => {
        if (!cancelled) setFile(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  useEffect(() => {
    if (!filePath) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filePath, close]);

  const allEntries = file ? Object.entries(file.frontmatter) : [];
  const sortedEntries = sortFrontmatter(allEntries);
  const priorityEntries = sortedEntries.filter(([k]) => isPriorityKey(k));
  const restEntries = sortedEntries.filter(([k]) => !isPriorityKey(k));

  return (
    <DrawerContext.Provider value={{ openFile, close }}>
      {children}
      <AnimatePresence>
        {filePath && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-void/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-[61] flex w-[90vw] flex-col border-l border-edge bg-paper md:w-[42vw]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <header className="flex items-start justify-between gap-3 border-b border-edge px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-ink-dim">{filePath}</p>
                  {file && (
                    <h2 className="truncate text-sm font-semibold text-ink">{file.name}</h2>
                  )}
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-edge text-ink-dim hover:text-emerald"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {sortedEntries.length > 0 && (
                <div className="border-b border-edge bg-void/40 px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {priorityEntries.map(([k, v]) => (
                      <span key={k} className="inline-flex items-center gap-1 font-mono text-[11px]">
                        <span className="text-ink-dim">{k}:</span>
                        <span className={valueClass(k, v)}>{String(v)}</span>
                      </span>
                    ))}
                  </div>
                  {restEntries.length > 0 && (
                    <>
                      <hr className="my-2 border-edge/20" />
                      <div className="flex flex-wrap gap-1.5">
                        {restEntries.map(([k, v]) => (
                          <MonospaceTag key={k} label={k} value={String(v)} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {loading && <EnsoLoader label="reading artifact…" className="mt-16" />}
                {error && (
                  <p className="font-mono text-sm text-red-400">{error}</p>
                )}
                {file && (
                  <article
                    className="prose-sensai"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(file.body) }}
                  />
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </DrawerContext.Provider>
  );
}
