"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDrawer } from "./MarkdownDrawer";
import type { DirEntry } from "@/lib/types";

async function fetchTree(path: string): Promise<DirEntry[]> {
  const res = await fetch(`/api/tree?path=${encodeURIComponent(path)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { entries: DirEntry[] };
  return data.entries ?? [];
}

/** One row in the tree; directories lazy-load children on first expand. */
function TreeNode({ entry, depth }: { entry: DirEntry; depth: number }) {
  const { openFile } = useDrawer();
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<DirEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (entry.type === "file") {
      openFile(entry.path);
      return;
    }
    const next = !open;
    setOpen(next);
    if (next && children === null) {
      setLoading(true);
      setChildren(await fetchTree(entry.path));
      setLoading(false);
    }
  }, [entry, open, children, openFile]);

  const isMd = entry.name.endsWith(".md");

  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={cn(
          "flex min-h-[40px] w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-paper-2",
          entry.type === "file" ? "text-ink-dim hover:text-ink" : "text-ink",
        )}
      >
        {entry.type === "dir" ? (
          <>
            <ChevronRight
              className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-90")}
            />
            {open ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-emerald" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-ink-dim" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <File className={cn("h-4 w-4 shrink-0", isMd ? "text-emerald/70" : "text-ink-dim")} />
          </>
        )}
        <span className="truncate font-mono text-[13px]">{entry.name}</span>
      </button>

      {open && (
        <ul>
          {loading && (
            <li
              style={{ paddingLeft: `${(depth + 1) * 14 + 26}px` }}
              className="py-1 font-mono text-xs text-ink-dim"
            >
              loading…
            </li>
          )}
          {children?.map((child) => (
            <TreeNode key={child.path} entry={child} depth={depth + 1} />
          ))}
          {children?.length === 0 && !loading && (
            <li
              style={{ paddingLeft: `${(depth + 1) * 14 + 26}px` }}
              className="py-1 font-mono text-xs text-ink-dim"
            >
              empty
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

/** Read-only filesystem browser rooted at `root` (harness-root-relative). */
export function FileTree({ root }: { root: string }) {
  const [entries, setEntries] = useState<DirEntry[] | null>(null);

  useEffect(() => {
    fetchTree(root).then(setEntries);
  }, [root]);

  if (entries === null) {
    return <p className="px-2 py-4 font-mono text-xs text-ink-dim">loading tree…</p>;
  }

  return (
    <ul className="py-1">
      {entries.map((e) => (
        <TreeNode key={e.path} entry={e} depth={0} />
      ))}
    </ul>
  );
}
