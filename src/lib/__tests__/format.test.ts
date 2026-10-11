import { describe, expect, it } from "vitest";

import { day, pct, pnl, rMultiple, rupees, variantLabel } from "../format";

describe("format", () => {
  it("formats rupees in the Indian style", () => {
    expect(rupees(1234567)).toBe("₹12,34,567");
    expect(rupees(-800)).toBe("−₹800");
    expect(rupees(12.5, true)).toBe("₹12.50");
    expect(rupees(null)).toBe("–");
    expect(rupees(Number.NaN)).toBe("–");
  });

  it("signs P&L, percents and R", () => {
    expect(pnl(1200)).toBe("+₹1,200");
    expect(pnl(-50)).toBe("−₹50");
    expect(pct(0.1234)).toBe("12.3%");
    expect(pct(0.05, 1, true)).toBe("+5.0%");
    expect(pct(-0.02)).toBe("−2.0%");
    expect(rMultiple(2)).toBe("+2.00R");
    expect(rMultiple(-1)).toBe("−1.00R");
  });

  it("formats dates and variants", () => {
    expect(day("2026-10-09")).toBe("9 Oct 2026");
    expect(day(null)).toBe("–");
    expect(variantLabel("positional-v1")).toBe("Positional");
    expect(variantLabel("positional-v1+lgbm")).toBe("Positional + LightGBM");
    expect(variantLabel("swing-v1+lgbm_kronos")).toBe("Swing + LightGBM + Kronos");
  });
});
