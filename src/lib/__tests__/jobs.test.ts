import { describe, expect, it } from "vitest";

import { GLOSSARY } from "../glossary";
import { JOBS, defaults, elapsed, isActive, jobDef, toParams } from "../jobs";

describe("jobs", () => {
  it("builds params from form values, leaving out empty dates", () => {
    const bt = jobDef("backtest")!;
    const values = defaults(bt);
    expect(values).toEqual({ book: "positional", start: "2016-01-01", end: "" });
    expect(toParams(bt, values)).toEqual({ book: "positional", start: "2016-01-01" });
    expect(toParams(bt, { ...values, end: " 2024-12-31 " })).toMatchObject({ end: "2024-12-31" });
  });

  it("always sends checkboxes as booleans", () => {
    const wf = jobDef("walkforward")!;
    expect(toParams(wf, defaults(wf))).toEqual({ book: "positional", final: false });
    expect(toParams(wf, { book: "all", final: true })).toEqual({ book: "all", final: true });
  });

  it("only offers the jobs the API accepts", () => {
    const allowed = ["update", "evening", "scan", "backtest", "walkforward", "basket-backtest", "review", "telegram-test"];
    expect(JOBS.map((j) => j.kind).sort()).toEqual([...allowed].sort());
    expect(JOBS.filter((j) => !j.heavy).map((j) => j.kind)).toEqual(["telegram-test"]);
  });

  it("points every ⓘ at a real glossary term", () => {
    for (const j of JOBS) {
      if (j.term) expect(GLOSSARY, j.kind).toHaveProperty(j.term);
      for (const f of j.fields) if (f.term) expect(GLOSSARY, `${j.kind}.${f.name}`).toHaveProperty(f.term);
    }
  });

  it("formats elapsed time and status", () => {
    expect(elapsed("2026-10-11T10:00:00Z", "2026-10-11T10:00:42Z")).toBe("42s");
    expect(elapsed("2026-10-11T10:00:00", "2026-10-11T10:01:05")).toBe("1m 05s");
    expect(elapsed(null, null)).toBe("–");
    expect(isActive("cancelling")).toBe(true);
    expect(isActive("failed")).toBe(false);
  });
});
