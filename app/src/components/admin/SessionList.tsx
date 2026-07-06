"use client";

import { useState } from "react";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/markdown";
import type { SessionMeta } from "@/lib/types";

interface Props {
  sessions: SessionMeta[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: SessionMeta;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <div
      className={`group relative cursor-pointer border-l-2 px-3 py-2.5 transition-colors hover:bg-paper/40 ${
        isActive ? "border-emerald bg-paper/30" : "border-transparent"
      }`}
      onClick={onSelect}
    >
      <p className="truncate font-mono text-xs text-ink">{session.title}</p>
      <div className="mt-0.5 flex items-center gap-1.5">
        {session.engagement.map((id) => (
          <span
            key={id}
            className="rounded bg-edge/50 px-1 font-mono text-[9px] text-ink-dim"
          >
            {id}
          </span>
        ))}
        <span className="ml-auto shrink-0 font-mono text-[9px] text-ink-dim">
          {timeAgo(session.updatedAt)}
        </span>
      </div>
      <button
        onClick={handleDelete}
        className="absolute right-2 top-2 hidden text-ink-dim hover:text-red-400 group-hover:block"
        title={confirmDelete ? "Click again to confirm" : "Delete session"}
      >
        {confirmDelete ? (
          <span className="font-mono text-[9px] text-red-400">confirm?</span>
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}

export function SessionList({ sessions, activeId, onSelect, onCreate, onDelete }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-edge p-3">
        <button
          onClick={onCreate}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-2 font-mono text-xs text-emerald transition-colors hover:bg-emerald/20"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <p className="px-3 py-4 font-mono text-xs text-ink-dim">No sessions yet.</p>
        ) : (
          sessions.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              isActive={s.id === activeId}
              onSelect={() => onSelect(s.id)}
              onDelete={() => onDelete(s.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
