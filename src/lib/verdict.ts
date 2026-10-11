// One-line "what does this mean" readings for the numbers on the dashboard.

import type { Market, Mode } from "./api";

export type Tone = "good" | "warn" | "bad" | "muted";

export const MODE_INFO: Record<Mode, { label: string; tone: Tone; meaning: string }> = {
  risk_on: {
    label: "Risk-on",
    tone: "good",
    meaning: "Market is healthy. New buys are allowed at full size.",
  },
  caution: {
    label: "Caution",
    tone: "warn",
    meaning: "Market is mixed. New buys are allowed at half size.",
  },
  risk_off: {
    label: "Risk-off",
    tone: "bad",
    meaning: "Market is weak. No new buys; existing trades keep their stops.",
  },
};

export function marketReading(m: Market): string {
  const parts = [MODE_INFO[m.mode]?.meaning ?? m.mode];
  if (m.nifty_vs_sma200 != null) {
    const p = Math.abs(m.nifty_vs_sma200 * 100).toFixed(1);
    parts.push(`Nifty is ${p}% ${m.nifty_vs_sma200 >= 0 ? "above" : "below"} its 200-day average.`);
  }
  return parts.join(" ");
}

/** Plain reading of a book's track record. Needs enough trades before it says anything firm. */
export function performanceReading(trades: number, expectancy: number | undefined): { tone: Tone; text: string } {
  if (trades < 20 || expectancy == null) {
    return {
      tone: "muted",
      text: `Only ${trades} closed trade${trades === 1 ? "" : "s"} so far. Wait for at least 20–30 before judging.`,
    };
  }
  if (expectancy > 0.2) return { tone: "good", text: "The rules are making money per trade on average." };
  if (expectancy > 0) return { tone: "warn", text: "Slightly profitable per trade. Costs could wipe this out; keep watching." };
  return { tone: "bad", text: "Losing money per trade on average. Don't trade this with real money." };
}

export function staleness(latest: string | null, today: Date = new Date()): { tone: Tone; text: string } {
  if (!latest) return { tone: "bad", text: "No price data yet. Run the backfill first." };
  const [y, m, d] = latest.split("-").map(Number);
  const age = Math.floor((today.getTime() - Date.UTC(y, m - 1, d)) / 86_400_000);
  if (age <= 3) return { tone: "good", text: "Prices are up to date." };
  if (age <= 7) return { tone: "warn", text: `Prices are ${age} days old. Run an update.` };
  return { tone: "bad", text: `Prices are ${age} days old. Signals are stale until you update.` };
}
