"use client";

import { Briefcase, LayoutDashboard, LogOut, PieChart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/lib/api";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/positions", label: "Positions", icon: Briefcase },
  { href: "/baskets", label: "Baskets", icon: PieChart },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-20 flex items-center gap-1 border-b border-border bg-surface px-3 py-2 md:h-screen md:w-56 md:shrink-0 md:flex-col md:items-stretch md:border-r md:border-b-0 md:p-4"
    >
      <Link href="/" className="hidden px-2 text-base font-semibold md:mb-4 md:block">
        Stock Signals
      </Link>
      <div className="flex flex-1 gap-1 overflow-x-auto md:flex-col">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm whitespace-nowrap md:gap-2 md:px-3 text-muted hover:bg-surface-2 hover:text-text",
                active && "bg-surface-2 font-medium text-text",
              )}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted hover:bg-surface-2 hover:text-text md:px-3"
      >
        <LogOut className="size-4" />
        <span className="hidden md:inline">Log out</span>
      </button>
    </nav>
  );
}
