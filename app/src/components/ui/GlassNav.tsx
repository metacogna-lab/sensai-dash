"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, FolderTree, Sparkles } from "lucide-react";

const LINKS = [
  { href: "/", label: "Terminal", icon: Activity },
  { href: "/engagements", label: "Explorer", icon: FolderTree },
  { href: "/admin", label: "Forge", icon: Sparkles },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Legal-glassmorphic navigation. Fixed to the bottom on mobile for thumb reach,
 * pinned to the top on desktop. Every target is ≥44px per the mobile-first mandate.
 */
export function GlassNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-edge bg-glass backdrop-blur-xl md:inset-x-auto md:bottom-auto md:top-0 md:w-full md:border-b md:border-t-0"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* 0.5px emerald top-border to mimic frosted authoritative glass */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-emerald/30" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="hidden items-center gap-2 py-4 font-mono text-sm tracking-tight md:flex"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald shadow-[0_0_8px_var(--color-emerald)]" />
          <span className="font-semibold">sensai</span>
          <span className="text-ink-dim">/ studio</span>
        </Link>

        <ul className="flex w-full items-stretch justify-around gap-1 md:w-auto md:justify-end md:gap-2">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 px-4 py-2 text-[11px] font-medium transition-colors md:flex-row md:gap-2 md:text-sm ${
                    active
                      ? "text-emerald"
                      : "text-ink-dim hover:text-ink"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
