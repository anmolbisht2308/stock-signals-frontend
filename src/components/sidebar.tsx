"use client";

import { Briefcase, LayoutDashboard, LogOut, PieChart, Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/lib/api";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/positions", label: "Positions", icon: Briefcase },
  { href: "/baskets", label: "Baskets", icon: PieChart },
  { href: "/run", label: "Run", icon: Play },
];

function isActive(path: string, href: string): boolean {
  return href === "/" ? path === "/" : path.startsWith(href);
}

/** Side navigation on desktop; a top bar plus a bottom tab bar on phones. */
export function Sidebar() {
  const path = usePathname();
  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface px-4 py-2 md:hidden">
        <Link href="/" className="font-semibold">
          Stock Signals
        </Link>
        <LogoutButton />
      </header>

      <nav
        aria-label="Main"
        className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-56 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface md:p-4"
      >
        <Link href="/" className="mb-4 px-2 text-base font-semibold">
          Stock Signals
        </Link>
        <div className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(path, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-text",
                  active && "bg-surface-2 font-medium text-text",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </div>
        <LogoutButton withLabel />
      </nav>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted",
                active && "font-medium text-accent",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function LogoutButton({ withLabel = false }: { withLabel?: boolean }) {
  return (
    <button
      type="button"
      onClick={logout}
      aria-label="Log out"
      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted hover:bg-surface-2 hover:text-text md:px-3"
    >
      <LogOut className="size-4" />
      {withLabel && <span>Log out</span>}
    </button>
  );
}
