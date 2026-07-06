"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Activity, FolderTree, Sparkles } from "lucide-react";
import type { GlobalTelemetry, EngagementSummary } from "@/lib/types";

const LINKS = [
  { href: "/", label: "Terminal", icon: Activity },
  { href: "/engagements", label: "Explorer", icon: FolderTree },
  { href: "/admin", label: "Forge", icon: Sparkles },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavData {
  activeEngagement: string | null;
  quarantineCount: number;
}

async function fetchNavData(): Promise<NavData> {
  try {
    const res = await fetch("/api/engagements");
    if (!res.ok) return { activeEngagement: null, quarantineCount: 0 };
    const data = (await res.json()) as {
      engagements: EngagementSummary[];
      telemetry: GlobalTelemetry;
    };
    return {
      activeEngagement: data.telemetry.activeEngagement ?? null,
      quarantineCount: data.telemetry.quarantined ?? 0,
    };
  } catch {
    return { activeEngagement: null, quarantineCount: 0 };
  }
}

/**
 * Legal-glassmorphic navigation. Fixed to the bottom on mobile for thumb reach,
 * pinned to the top on desktop. Every target is ≥44px per the mobile-first mandate.
 */
export function GlassNav() {
  const pathname = usePathname();
  const [navData, setNavData] = useState<NavData>({ activeEngagement: null, quarantineCount: 0 });

  useEffect(() => {
    fetchNavData().then(setNavData);
  }, []);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-edge bg-glass backdrop-blur-xl md:inset-x-auto md:bottom-auto md:top-0 md:w-full md:border-b md:border-t-0"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-emerald/30" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="hidden items-center gap-2 py-4 font-mono text-sm tracking-tight md:flex"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald shadow-[0_0_8px_var(--color-emerald)]" />
          <span className="font-semibold">sensai</span>
          {navData.activeEngagement ? (
            <>
              <span className="text-ink-dim">/</span>
              <span className="text-emerald">{navData.activeEngagement}</span>
            </>
          ) : (
            <span className="text-ink-dim">/ studio</span>
          )}
        </Link>

        <ul className="flex w-full items-stretch justify-around gap-1 md:w-auto md:justify-end md:gap-2">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            const showBadge = label === "Explorer" && navData.quarantineCount > 0;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 px-4 py-2 text-[11px] font-medium transition-colors md:flex-row md:gap-2 md:text-sm ${
                    active ? "text-emerald" : "text-ink-dim hover:text-ink"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                  <span>{label}</span>
                  {showBadge && (
                    <span className="absolute right-1 top-1 rounded-full bg-amber-400 px-1 font-mono text-[9px] text-void md:static md:ml-0.5">
                      {navData.quarantineCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
