// Number formatting for the panel. The backend stores rupees as floats; we only display them.

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function rupees(value: number | null | undefined, decimals = false): string {
  if (value == null || !Number.isFinite(value)) return "–";
  const sign = value < 0 ? "−" : "";
  return `${sign}₹${(decimals ? inr2 : inr).format(Math.abs(value))}`;
}

/** Signed rupees for P&L: +₹1,200 / −₹800. */
export function pnl(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "–";
  return value > 0 ? `+${rupees(value)}` : rupees(value);
}

/** Fraction → percent: 0.1234 → "12.3%". */
export function pct(value: number | null | undefined, digits = 1, signed = false): string {
  if (value == null || !Number.isFinite(value)) return "–";
  const text = `${Math.abs(value * 100).toFixed(digits)}%`;
  if (value < 0) return `−${text}`;
  return signed && value > 0 ? `+${text}` : text;
}

export function rMultiple(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "–";
  const text = `${Math.abs(value).toFixed(2)}R`;
  return value < 0 ? `−${text}` : value > 0 ? `+${text}` : text;
}

export function num(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "–";
  return value.toLocaleString("en-IN", { maximumFractionDigits: digits });
}

/** "2026-10-09" → "9 Oct 2026". */
export function day(value: string | null | undefined): string {
  if (!value) return "–";
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return value;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]} ${y}`;
}

/** ISO timestamp → "9 Oct, 16:42" in IST. */
export function when(value: string | null | undefined): string {
  if (!value) return "–";
  const t = new Date(value.endsWith("Z") || value.includes("+") ? value : `${value}Z`);
  if (Number.isNaN(t.getTime())) return value;
  return t.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** "positional-v1+lgbm" style variants → "Positional + LightGBM". */
export function variantLabel(variant: string): string {
  const [book, ...rest] = variant.split("+");
  const base = book.split("-")[0];
  const name = base.charAt(0).toUpperCase() + base.slice(1);
  const extras = rest.map((r) => (r === "lgbm" ? "LightGBM" : r.replace("lgbm_kronos", "LightGBM + Kronos")));
  return [name, ...extras].join(" + ");
}

export function tone(value: number | null | undefined): "good" | "bad" | "muted" {
  if (value == null || !Number.isFinite(value) || value === 0) return "muted";
  return value > 0 ? "good" : "bad";
}
