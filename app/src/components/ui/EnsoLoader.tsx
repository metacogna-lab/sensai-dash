"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const SIZES = { sm: 24, md: 48, lg: 96 } as const;

interface EnsoLoaderProps {
  size?: keyof typeof SIZES;
  className?: string;
  label?: string;
}

/**
 * The Enso — a minimalist Zen circle drawing itself in neuropunk emerald, symbolizing
 * the continuous cycle of thought and compilation. Used for every async/synthesis state.
 */
export function EnsoLoader({ size = "md", className, label }: EnsoLoaderProps) {
  const px = SIZES[size];
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)} role="status">
      <motion.svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        {/* faint full ring */}
        <circle cx="50" cy="50" r="40" stroke="var(--color-edge)" strokeWidth="3" />
        {/* kinetic emerald arc, brush-like open circle */}
        <motion.path
          d="M 50 10 A 40 40 0 1 1 18 30"
          stroke="var(--color-emerald)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.4 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 4px var(--color-emerald))" }}
        />
      </motion.svg>
      {label ? (
        <span className="font-mono text-xs text-ink-dim">{label}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
