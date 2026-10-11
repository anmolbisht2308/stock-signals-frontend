// Plain-language explanations shown by the ⓘ buttons. Keep each one short and concrete.

export interface Term {
  title: string;
  short: string;
  more?: string;
}

export const GLOSSARY = {
  regime: {
    title: "Market mode",
    short:
      "A traffic light for the whole market, based on the Nifty 50 trend and how many stocks are rising.",
    more: "Green (risk-on): Nifty is above its 200-day average and most stocks are healthy, so the bot takes full-size trades. Yellow (caution): mixed, so trades are half size. Red (risk-off): Nifty is below its 200-day average, so no new buys.",
  },
  sma200: {
    title: "200-day average",
    short: "The average closing price of the last 200 trading days (about 10 months).",
    more: "Price above it means the long-term trend is up. It is the main line the bot uses to decide if the market is healthy.",
  },
  breadth: {
    title: "Breadth",
    short: "The share of stocks trading above their own 50-day average.",
    more: "60% means 6 in 10 stocks are in a short-term uptrend. A rising Nifty with low breadth means only a few big stocks are carrying the index.",
  },
  weekEnd: {
    title: "Week-end session",
    short: "The positional book only looks for new buys on the last trading day of each week.",
    more: "Checking once a week avoids reacting to daily noise. Exits (stop losses) are still checked every day.",
  },
  paper: {
    title: "Paper trading",
    short: "Pretend trading with fake money, using real prices. No orders go to a broker.",
    more: "The bot buys at the next day's open and applies real Indian costs, so the results are close to what real trading would have given. This is how we judge the strategy before risking money.",
  },
  book: {
    title: "Book",
    short: "A separate pot of paper money with its own rules: swing (days to weeks) or positional (weeks to months).",
  },
  variant: {
    title: "Variant",
    short:
      "Which version of the rules a book trades. “+ LightGBM” or “+ Kronos” books are shadow copies that let a model filter the same signals.",
    more: "Shadow books only exist to compare. A model is kept only if its shadow book beats the plain rules (the keep rule).",
  },
  swing: {
    title: "Swing trades",
    short: "Short trades held for days to a few weeks. Turned off because backtests showed no edge after costs.",
  },
  positional: {
    title: "Positional trades",
    short: "Trades held for weeks to months: the top-20 momentum stocks above their 200-day average, bought on the last session of the week. Exits on a 3×ATR stop, a weekly close below the 50-day average, or the stock dropping out of the top 100.",
  },
  equity: {
    title: "Equity",
    short: "What the book is worth right now: cash plus open positions at the latest close.",
  },
  capital: {
    title: "Starting capital",
    short: "The fake money the book started with. Return is measured against this.",
  },
  cash: {
    title: "Cash",
    short: "Money not in any stock right now, available for new buys.",
  },
  return: {
    title: "Return",
    short: "How much the book is up or down since it started, as a percentage of starting capital.",
  },
  signal: {
    title: "Signal",
    short: "A buy idea from the rules: which stock, how many shares, the entry range, the stop loss and the targets.",
  },
  plan: {
    title: "Tomorrow's plan",
    short: "Orders the paper trader will place at the next market open: new buys from signals and planned sells.",
  },
  entryRange: {
    title: "Entry range",
    short: "The price band the bot is happy to buy in. If the stock opens outside it, the buy is skipped.",
  },
  stopLoss: {
    title: "Stop loss",
    short: "The price where the trade is closed to cap the loss. It is set below the entry using ATR (3× ATR for positional).",
    more: "Checked every day. If a trade has already booked part profit at T1, the stop moves up to the entry price (breakeven), so a winner can't turn into a loss.",
  },
  target: {
    title: "Targets (T1, T2)",
    short: "Prices where profit is taken. At T1 half the position is sold; the rest rides towards T2. Positional trades have no fixed targets and exit on trend breaks instead.",
  },
  timeStop: {
    title: "Time stop",
    short: "If a trade goes nowhere for this many days, it is closed so the money can be used elsewhere.",
  },
  atr: {
    title: "ATR (Average True Range)",
    short: "How much a stock usually moves in a day, in rupees. Used to set stops that suit each stock.",
    more: "A stock that moves ₹20 a day needs a wider stop than one that moves ₹5, otherwise normal wiggles knock you out.",
  },
  rsi: {
    title: "RSI",
    short: "A 0–100 score of recent buying pressure. Above 70 is often called overbought, below 30 oversold.",
  },
  momentum: {
    title: "Momentum (ROC)",
    short: "How much a stock has gone up over the last 6 or 12 months. Stocks that have risen tend to keep rising for a while.",
  },
  risk: {
    title: "Risk per trade",
    short: "The most money one trade can lose if the stop loss is hit, set as a % of the book (1% by default).",
    more: "Shares = risk amount ÷ (entry − stop). A wide stop means fewer shares, so every trade risks about the same rupees.",
  },
  rMultiple: {
    title: "R-multiple",
    short: "Profit or loss measured in units of the risk taken. +2R = made twice what was risked, −1R = lost the planned amount.",
    more: "It lets you compare trades of different sizes. A full stop-loss hit is about −1R.",
  },
  expectancy: {
    title: "Expectancy",
    short: "The average R per trade. Above 0 means the rules make money over many trades; below 0 means they lose.",
  },
  winRate: {
    title: "Win rate",
    short: "The share of closed trades that made money. Trend systems often win under 50% but make more on winners than they lose on losers.",
  },
  profitFactor: {
    title: "Profit factor",
    short: "Total money won ÷ total money lost. Above 1 is profitable; 1.5+ is good.",
  },
  drawdown: {
    title: "Max drawdown",
    short: "The biggest fall from a peak to a low. It tells you the worst losing stretch you'd have had to sit through.",
  },
  cagr: {
    title: "CAGR",
    short: "Yearly growth rate, as if the return were spread evenly over every year.",
  },
  exposure: {
    title: "Exposure",
    short: "On average, how much of the money was actually in stocks rather than cash.",
  },
  costs: {
    title: "Costs",
    short: "Real Indian trading charges (STT, stamp duty, exchange, SEBI, GST, DP) plus slippage, already taken out of the P&L.",
  },
  unrealised: {
    title: "Unrealised P&L",
    short: "Profit or loss on an open position at the latest close. It becomes real only when the position is sold.",
  },
  netPnl: {
    title: "Net P&L",
    short: "Profit or loss after all costs.",
  },
  daysHeld: {
    title: "Days held",
    short: "How many trading days the position was open.",
  },
  exitReason: {
    title: "Exit reason",
    short: "Why the trade was closed: stop loss, target, trailing stop, time stop, or the rule's own exit.",
  },
  pendingExit: {
    title: "Planned exit",
    short: "The rules decided to sell this at the next open. The reason is shown next to it.",
  },
  basket: {
    title: "Baskets",
    short: "Long-term portfolios like a smallcase. Core is the steady base; satellite chases momentum.",
  },
  core: {
    title: "Core basket",
    short: "The 20 calmest (lowest-volatility) Nifty 100 stocks, equal weight. Re-picked once a year; weights restored monthly if they drift more than 5 points.",
  },
  satellite: {
    title: "Satellite basket",
    short: "The 30 strongest-momentum Nifty 200 stocks, re-picked every June and December. Cut to 50% invested when the market mode is red.",
  },
  investFraction: {
    title: "Invested target",
    short: "How much of the basket should be in stocks right now. The satellite drops this in bad markets to protect capital.",
  },
  weight: {
    title: "Weight",
    short: "What share of the basket's value sits in this stock today, against its target share.",
  },
  rebalance: {
    title: "Rebalance",
    short: "Buying and selling to bring each stock back to its target weight and swap in newly selected stocks.",
  },
  pendingOrders: {
    title: "Pending orders",
    short: "Basket trades that will be placed at the next market open.",
  },
  dataRun: {
    title: "Data update",
    short: "The download of the latest daily prices from Yahoo Finance. Everything else depends on it being fresh.",
  },
  latestSession: {
    title: "Latest session",
    short: "The most recent trading day we have prices for. Signals and the plan are based on this day's close.",
  },
  paused: {
    title: "Paused",
    short: "When paused (via /pause in Telegram), the bot sends no new buy signals. Exits still run.",
  },
  schedule: {
    title: "Schedule",
    short: "When the bot runs on its own while `stock-signals serve` is running.",
  },
  keepRule: {
    title: "Keep rule",
    short: "A model (LightGBM, Kronos) stays only if its paper book clearly beats the plain rules. Otherwise it's dropped.",
  },
  backtest: {
    title: "Backtest",
    short: "Running the rules on past prices to see what would have happened, with real costs and next-day fills.",
    more: "A good backtest doesn't guarantee future profit, but a bad one is a strong sign the rules don't work.",
  },
  walkforward: {
    title: "Walk-forward",
    short: "Testing on years the rules were not tuned on. Rules were tuned on 2014–21; 2022–24 is the honest check.",
    more: "If results hold up in the test years, the rules are less likely to be fitted to past noise.",
  },
  finalPeriod: {
    title: "Final period",
    short: "2025 to now: years kept aside for one last check. Looking at it again and again turns it into tuning data.",
  },
  review: {
    title: "Paper review",
    short: "A go / no-go check after some weeks of paper trading: does the paper ledger match a replay, and are the numbers good enough?",
  },
  heavyJob: {
    title: "Heavy job",
    short: "A job that downloads data or replays years of prices. Only one runs at a time so they don't slow each other down or clash.",
  },
  job: {
    title: "Jobs",
    short: "Each button runs the same command you would type in the terminal (e.g. `stock-signals evening`). The result also goes to Telegram.",
  },
} satisfies Record<string, Term>;

export type TermKey = keyof typeof GLOSSARY;
