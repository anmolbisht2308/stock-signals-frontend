// The buttons on the Run page. Each one runs a `stock-signals` CLI command on the API side
// (src/stock_signals/job_runner.py in the backend repo, which validates the same params).

import type { TermKey } from "./glossary";
import type { JobStatus } from "./api";

export type Field =
  | { name: string; type: "select"; label: string; options: { value: string; label: string }[]; default: string; term?: TermKey }
  | { name: string; type: "date"; label: string; default?: string; placeholder?: string; term?: TermKey }
  | { name: string; type: "checkbox"; label: string; default?: boolean; term?: TermKey; warning?: string };

export interface JobDef {
  kind: string;
  label: string;
  what: string;
  when: string;
  duration: string;
  heavy: boolean;
  term?: TermKey;
  fields: Field[];
  group: "daily" | "research" | "tools";
}

const BOOK: Field = {
  name: "book",
  type: "select",
  label: "Book",
  default: "positional",
  term: "book",
  options: [
    { value: "positional", label: "Positional" },
    { value: "swing", label: "Swing" },
    { value: "all", label: "Both" },
  ],
};

export const JOBS: JobDef[] = [
  {
    kind: "update",
    label: "Update prices",
    what: "Downloads the latest daily prices from Yahoo Finance for every stock and index.",
    when: "When the dashboard says prices are old. The evening run already does this.",
    duration: "1–3 min",
    heavy: true,
    term: "dataRun",
    fields: [],
    group: "daily",
  },
  {
    kind: "evening",
    label: "Evening run",
    what: "Updates prices, runs paper trading for the day (fills, stops, exits, new signals), updates the baskets and sends the result to Telegram.",
    when: "Runs by itself at 16:30 IST while the bot is on. Use this if the bot was off or the run failed.",
    duration: "2–5 min",
    heavy: true,
    term: "paper",
    fields: [{ name: "no_update", type: "checkbox", label: "Skip the price download (use prices already saved)" }],
    group: "daily",
  },
  {
    kind: "scan",
    label: "Scan",
    what: "Checks which stocks the rules would buy on one day, as if the portfolio were empty. Nothing is traded; the list goes to Telegram.",
    when: "To see today's candidates, or to check a past date.",
    duration: "under 1 min",
    heavy: true,
    term: "signal",
    fields: [{ name: "date", type: "date", label: "Date", placeholder: "latest session" }],
    group: "daily",
  },
  {
    kind: "backtest",
    label: "Backtest",
    what: "Replays the rules over past prices, trade by trade with real costs, and saves a report.",
    when: "To see how the rules would have done over a period you pick.",
    duration: "1–5 min",
    heavy: true,
    term: "backtest",
    fields: [BOOK, { name: "start", type: "date", label: "From", default: "2016-01-01" }, { name: "end", type: "date", label: "To", placeholder: "latest" }],
    group: "research",
  },
  {
    kind: "walkforward",
    label: "Walk-forward",
    what: "Backtests the 2014–21 tuning years and the 2022–24 test years separately, so you can see if the rules still work on years they weren't tuned on.",
    when: "After changing a rule, to check it isn't just fitted to the past.",
    duration: "2–8 min",
    heavy: true,
    term: "walkforward",
    fields: [
      BOOK,
      {
        name: "final",
        type: "checkbox",
        label: "Also run the final period (2025–now)",
        term: "finalPeriod",
        warning: "The final period is meant to be looked at once. Every extra look makes it less of a fair test.",
      },
    ],
    group: "research",
  },
  {
    kind: "basket-backtest",
    label: "Basket backtest",
    what: "Replays the core and satellite baskets over past prices and saves a report for each, plus both combined.",
    when: "To see how the long-term baskets would have done.",
    duration: "2–6 min",
    heavy: true,
    term: "basket",
    fields: [{ name: "start", type: "date", label: "From", default: "2016-01-01" }, { name: "end", type: "date", label: "To", placeholder: "latest" }],
    group: "research",
  },
  {
    kind: "review",
    label: "Paper review",
    what: "Compares the paper results with what a backtest says for the same weeks and writes docs/paper-review-N.md with a go / no-go.",
    when: "After 4+ weeks of paper trading, before thinking about real money.",
    duration: "1–3 min",
    heavy: true,
    term: "review",
    fields: [],
    group: "research",
  },
  {
    kind: "telegram-test",
    label: "Telegram test",
    what: "Sends a hello message to your Telegram chat.",
    when: "To check the bot token and chat id work.",
    duration: "a few seconds",
    heavy: false,
    fields: [],
    group: "tools",
  },
];

export const GROUPS: { key: JobDef["group"]; title: string }[] = [
  { key: "daily", title: "Daily" },
  { key: "research", title: "Research" },
  { key: "tools", title: "Tools" },
];

export function jobDef(kind: string): JobDef | undefined {
  return JOBS.find((j) => j.kind === kind);
}

export type FieldValues = Record<string, string | boolean>;

export function defaults(job: JobDef): FieldValues {
  const out: FieldValues = {};
  for (const f of job.fields) {
    out[f.name] = f.type === "checkbox" ? (f.default ?? false) : (f.default ?? "");
  }
  return out;
}

/** Form values → API params: empty dates are left out so the backend uses its default. */
export function toParams(job: JobDef, values: FieldValues): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const f of job.fields) {
    const v = values[f.name];
    if (f.type === "checkbox") out[f.name] = v === true;
    else if (typeof v === "string" && v.trim()) out[f.name] = v.trim();
  }
  return out;
}

export function isActive(status: JobStatus): boolean {
  return status === "running" || status === "cancelling";
}

export const STATUS_INFO: Record<JobStatus, { label: string; tone: "good" | "warn" | "bad" | "muted" }> = {
  running: { label: "Running", tone: "warn" },
  cancelling: { label: "Stopping", tone: "warn" },
  succeeded: { label: "Done", tone: "good" },
  failed: { label: "Failed", tone: "bad" },
  cancelled: { label: "Cancelled", tone: "muted" },
};

/** "1m 05s" between two ISO timestamps (or until now). */
export function elapsed(start: string | null, end: string | null, now: number = Date.now()): string {
  if (!start) return "–";
  const t0 = Date.parse(start.endsWith("Z") || start.includes("+") ? start : `${start}Z`);
  const t1 = end ? Date.parse(end.endsWith("Z") || end.includes("+") ? end : `${end}Z`) : now;
  if (Number.isNaN(t0) || Number.isNaN(t1)) return "–";
  const s = Math.max(0, Math.round((t1 - t0) / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}
