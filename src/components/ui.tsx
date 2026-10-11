import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/cn";
import type { TermKey } from "@/lib/glossary";
import type { Tone } from "@/lib/verdict";

import { InfoTip } from "./info-tip";

export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {intro && <p className="mt-1 max-w-2xl text-sm text-muted">{intro}</p>}
      </div>
      {children}
    </header>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-xl border border-border bg-surface p-4", className)}>{children}</section>;
}

export function CardTitle({ children, term, aside }: { children: React.ReactNode; term?: TermKey; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-1 text-sm font-semibold">
        {children}
        {term && <InfoTip term={term} />}
      </h2>
      {aside}
    </div>
  );
}

const toneText: Record<Tone, string> = {
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
  muted: "text-muted",
};

const toneBadge: Record<Tone, string> = {
  good: "bg-good-bg text-good",
  warn: "bg-warn-bg text-warn",
  bad: "bg-bad-bg text-bad",
  muted: "bg-surface-2 text-muted",
};

export function Stat({
  label,
  value,
  term,
  tone,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  term?: TermKey;
  tone?: Tone;
  sub?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex h-5 items-center gap-1 text-xs text-muted">
        {label}
        {term && <InfoTip term={term} />}
      </div>
      <div className={cn("mt-0.5 truncate text-lg font-semibold", tone && toneText[tone])}>{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", toneBadge[tone])}>
      {children}
    </span>
  );
}

export function Toned({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={toneText[tone]}>{children}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg bg-surface-2 px-3 py-4 text-sm text-muted">{children}</p>;
}

export function ErrorBox({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg bg-bad-bg p-3 text-sm text-bad">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-surface-2", className)} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

/** Column header with an optional ⓘ. */
export function Th({ children, term, right }: { children: React.ReactNode; term?: TermKey; right?: boolean }) {
  return (
    <th className={cn("px-3 py-2 text-xs font-medium whitespace-nowrap text-muted", right ? "text-right" : "text-left")}>
      <span className={cn("inline-flex items-center gap-1", right && "flex-row-reverse")}>
        {children}
        {term && <InfoTip term={term} />}
      </span>
    </th>
  );
}

export function Td({ children, right, className }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return <td className={cn("px-3 py-2 whitespace-nowrap", right && "text-right", className)}>{children}</td>;
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative -mx-4 overflow-x-auto px-4">
      <table className="w-full border-collapse text-sm [&_tbody_tr]:border-t [&_tbody_tr]:border-border">{children}</table>
    </div>
  );
}
