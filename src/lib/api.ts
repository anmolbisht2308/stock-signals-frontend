// Browser client for the stock-signals admin API (FastAPI, `uv run stock-signals api`).
// Requests go to /api/* on this origin; next.config.ts rewrites them to API_URL.

const TOKEN_KEY = "ss_token";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private mode or blocked storage: the user just has to log in again.
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError(0, "Can't reach the API. Is `uv run stock-signals api` running?");
  }
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { detail?: unknown };
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      // Not JSON (e.g. the rewrite target is down and Next returned an HTML 500).
      if (res.status >= 500) message = "Can't reach the API. Is `uv run stock-signals api` running?";
    }
    if (res.status === 401 && path !== "/api/login") {
      setToken(null);
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};

export async function login(password: string): Promise<void> {
  const { token } = await api.post<{ token: string }>("/api/login", { password });
  setToken(token);
}

export function logout(): void {
  setToken(null);
  window.location.assign("/login");
}

// ---- Response types (mirror src/stock_signals/api.py in the backend repo) ----

export type Mode = "risk_on" | "caution" | "risk_off";

export interface Market {
  date: string;
  mode: Mode;
  nifty_close: number;
  nifty_sma200: number;
  nifty_vs_sma200: number | null;
  breadth50: number | null;
  week_end: boolean;
}

export interface BookSummary {
  variant: string;
  book: "swing" | "positional";
  capital: number;
  cash: number;
  equity: number;
  return: number;
  open_positions: number;
  pending_signals: number;
  last_date: string | null;
}

export interface BasketSummary {
  name: string;
  capital: number;
  value: number;
  return: number;
  invested: number;
  invest_fraction: number;
  holdings: number;
  last_selection: string | null;
  pending_orders: number;
  last_date: string | null;
}

export interface PlannedBuy {
  variant: string;
  id: string;
  symbol: string;
  book: string;
  date: string;
  qty: number;
  ref_price: number;
  entry_low: number;
  entry_high: number;
  stop: number;
  t1: number | null;
  t2: number | null;
  time_stop_days: number | null;
  risk_per_share: number;
  risk_amount: number;
  rule_version: string;
  sector: string;
  score: number;
  reason: string;
}

export interface PlannedSell {
  variant: string;
  symbol: string;
  qty: number;
  reason: string;
}

export interface Plan {
  buys: PlannedBuy[];
  sells: PlannedSell[];
}

export interface DataRun {
  kind: string;
  end: string | null;
  symbols: number;
  rows: number;
  failed: string[];
  refetched: string[];
  issues: number;
  summary: string;
  seconds: number;
  finished_at: string;
}

export interface Dashboard {
  latest_session: string | null;
  market: Market | null;
  books: BookSummary[];
  baskets: BasketSummary[];
  plan: Plan;
  last_data_run: DataRun | null;
  paused: boolean;
  swing_enabled: boolean;
  schedule: Record<string, string>;
}

export interface OpenPosition {
  variant: string;
  id: string;
  book: string;
  symbol: string;
  sector: string;
  rule_version: string;
  entry_date: string;
  entry_price: number;
  initial_qty: number;
  qty: number;
  stop: number;
  initial_stop: number;
  t1: number | null;
  t2: number | null;
  t1_done: boolean;
  time_stop_days: number | null;
  bars_held: number;
  pending_exit: string | null;
  last_close: number;
  unrealised_pnl: number;
  unrealised_pct: number;
}

export interface Trade {
  position_id: string;
  book: string;
  symbol: string;
  sector: string;
  rule_version: string;
  entry_date: string;
  entry_price: number;
  exit_date: string;
  avg_exit_price: number;
  qty: number;
  gross_pnl: number;
  costs: number;
  net_pnl: number;
  r_multiple: number;
  days_held: number;
  exit_reason: string;
}

export interface Positions {
  open: OpenPosition[];
  closed: Trade[];
  plan: Plan;
}

export interface Holding {
  symbol: string;
  qty: number;
  price: number | null;
  weight: number;
  target: number;
  sector: string;
}

export interface BasketEvent {
  name: string;
  date: string;
  kind?: string;
  text: string;
}

export interface BasketDetail extends BasketSummary {
  holdings_detail: Holding[];
  pending: { symbol: string; qty: number }[];
  history: { date: string; value: number }[];
  events: BasketEvent[];
}

export interface Baskets {
  baskets: BasketDetail[];
  capital: Record<string, number>;
}
