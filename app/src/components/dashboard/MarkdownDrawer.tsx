"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { EnsoLoader } from "@/components/ui/EnsoLoader";
import { MonospaceTag } from "@/components/ui/MonospaceTag";
import { renderMarkdown } from "@/lib/markdown";
import type { ParsedFile } from "@/lib/types";

interface DrawerContextValue {
  openFile: (path: string) => void;
  close: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

/** Any client component can call `useDrawer().openFile(path)` to slide the artifact in. */
export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within <DrawerProvider>");
  return ctx;
}

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState<string | null>(null);
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openFile = useCallback((p: string) => setPath(p), []);
  const close = useCallback(() => setPath(null), []);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFile(null);
    fetch(`/api/file?path=${encodeURIComponent(path)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json() as Promise<ParsedFile>;
      })
      .then((data) => {
        if (!cancelled) setFile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  // Esc closes.
  useEffect(() => {
    if (!path) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [path, close]);

  const frontmatterEntries = file ? Object.entries(file.frontmatter) : [];

  return (
    <DrawerContext.Provider value={{ openFile, close }}>
      {children}
      <AnimatePresence>
        {path && (
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
                  <p className="truncate font-mono text-xs text-ink-dim">{path}</p>
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

              {frontmatterEntries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-b border-edge bg-void/40 px-4 py-3">
                  {frontmatterEntries.map(([k, v]) => (
                    <MonospaceTag key={k} label={k} value={String(v)} />
                  ))}
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
