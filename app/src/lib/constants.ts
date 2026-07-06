/**
 * Shared colour maps and icon registries. Import from here — never duplicate these
 * records in individual components. TASK-05 origin; extended by TASK-06/TASK-12.
 */
import {
  Play,
  HelpCircle,
  FileText,
  BookOpen,
  Database,
  GitBranch,
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  Layers,
  Radio,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const STATUS_COLOR: Record<string, string> = {
  SUCCESS: "text-emerald",
  PASS: "text-emerald",
  EDIT: "text-amber-400",
  GATED: "text-red-500",
  "GATED-OVERRIDE": "text-orange-400",
  FAIL: "text-red-400",
  BLOCKED: "text-red-400",
};

export const PHASE_ICON: Record<string, LucideIcon> = {
  INIT: Play,
  QUESTION: HelpCircle,
  EXTRACT: FileText,
  CONSUME: BookOpen,
  INDEX: Database,
  ANALYZE: GitBranch,
  QUARANTINE: AlertTriangle,
  EVALUATE: DollarSign,
  VERIFY: ShieldCheck,
  SYNTHESIZE: Layers,
  BROADCAST: Radio,
  LONGITUDINAL: TrendingUp,
  AUDIT: ClipboardList,
};

export const ALL_PHASES = [
  "INIT",
  "QUESTION",
  "EXTRACT",
  "CONSUME",
  "INDEX",
  "ANALYZE",
  "QUARANTINE",
  "EVALUATE",
  "VERIFY",
  "SYNTHESIZE",
  "BROADCAST",
  "LONGITUDINAL",
  "AUDIT",
] as const;

export type Phase = (typeof ALL_PHASES)[number];

export const VERDICT_STYLE: Record<string, string> = {
  PASS: "border-emerald/60 text-emerald bg-emerald/5",
  "PASS-WITH-NOTES": "border-amber-400/60 text-amber-400 bg-amber-400/5",
  "no-viable-vector": "border-ink-dim/40 text-ink-dim",
  FAIL: "border-red-400/60 text-red-400 bg-red-400/5",
  viable: "border-emerald/60 text-emerald bg-emerald/5",
};

export const VERDICT_TEXT_COLOR: Record<string, string> = {
  PASS: "text-emerald",
  "PASS-WITH-NOTES": "text-amber-400",
  "no-viable-vector": "text-ink-dim",
  FAIL: "text-red-400",
  viable: "text-emerald",
  ready: "text-emerald",
};
