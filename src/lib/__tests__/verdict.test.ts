import { describe, expect, it } from "vitest";

import { GLOSSARY } from "../glossary";
import { marketReading, performanceReading, staleness } from "../verdict";

describe("verdict", () => {
  it("reads the market", () => {
    const text = marketReading({
      date: "2026-10-09",
      mode: "caution",
      nifty_close: 25100,
      nifty_sma200: 24000,
      nifty_vs_sma200: 0.0458,
      breadth50: 0.45,
      week_end: true,
    });
    expect(text).toContain("half size");
    expect(text).toContain("4.6% above");
  });

  it("refuses to judge too few trades", () => {
    expect(performanceReading(5, 0.5).tone).toBe("muted");
    expect(performanceReading(40, 0.5).tone).toBe("good");
    expect(performanceReading(40, -0.1).tone).toBe("bad");
  });

  it("flags stale data", () => {
    const today = new Date(Date.UTC(2026, 9, 11));
    expect(staleness("2026-10-09", today).tone).toBe("good");
    expect(staleness("2026-10-05", today).tone).toBe("warn");
    expect(staleness("2026-09-01", today).tone).toBe("bad");
    expect(staleness(null, today).tone).toBe("bad");
  });

  it("has a title and short text for every glossary term", () => {
    for (const [key, term] of Object.entries(GLOSSARY)) {
      expect(term.title, key).toBeTruthy();
      expect(term.short.length, key).toBeGreaterThan(10);
    }
  });
});
