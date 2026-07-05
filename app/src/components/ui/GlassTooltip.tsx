"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface TooltipRow {
  label: string;
  value: React.ReactNode;
}

interface GlassTooltipProps {
  rows: TooltipRow[];
  children: React.ReactNode;
  className?: string;
}

/**
 * Legal-glassmorphic popover for agentic metadata (model, Work Block ID, status).
 * Opens on hover (desktop) AND tap (mobile), driven by Framer Motion. Touch-friendly:
 * the trigger toggles, and the panel floats above with a frosted emerald top-border.
 */
export function GlassTooltip({ rows, children, className }: GlassTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-[44px] items-center text-left"
      >
        {children}
      </button>

      <AnimatePresence>
        {open && rows.length > 0 && (
          <motion.div
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute bottom-full left-0 z-50 mb-2 min-w-[200px] overflow-hidden rounded-lg border border-edge bg-glass p-3 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-emerald/40" />
            <dl className="space-y-1.5">
              {rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4">
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">
                    {r.label}
                  </dt>
                  <dd className="font-mono text-xs text-ink">{r.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
