# stock-signals-frontend

Admin panel for my personal NSE signal bot ([stock-signals](https://github.com/anmolbisht2308/stock-signals)).
It shows what the bot knows (market mode, paper books, positions, baskets, tomorrow's plan) and explains every
term in plain language: tap any ⓘ.

Personal use only. It runs on my machine next to the bot; it is not a public site.

## Run

1. In the **stock-signals** repo, set a password in `.env` and start the API (listens on 127.0.0.1:8000 only):

   ```bash
   echo "ADMIN_PASSWORD=pick-something" >> .env
   uv run stock-signals api
   ```

2. Here:

   ```bash
   npm install
   npm run dev        # http://localhost:3000
   ```

3. Log in with the `ADMIN_PASSWORD`.

The browser calls `/api/*` on this site and Next rewrites it to the API (`API_URL`, default
`http://127.0.0.1:8000`). Set `API_URL` in `.env.local` if the API runs elsewhere. If you change the panel's
port, also set `FRONTEND_ORIGIN` in the bot's `.env`.

## Pages

| Page | What it shows |
| --- | --- |
| Dashboard | Market mode (traffic light), data freshness, schedule, each paper book, both baskets, tomorrow's plan |
| Positions | Open positions with stop/targets and P&L, the next-open plan, every closed trade with R and costs |
| Baskets | Core and satellite: value, return, invested %, holdings with weight vs target, pending orders, activity |

Coming next (stock-signals `docs/PLAN.md`, Phase 10): job buttons with live logs (10.3), charts and the
performance/backtest/data-health/stock pages (10.4), editable settings and a Learn page (10.5).

## Develop

```bash
npm test           # vitest (formatting, verdicts, glossary)
npm run lint
npm run typecheck
npm run build
```

Stack: Next.js 15 (App Router), React 19, Tailwind CSS 4, TanStack Query 5, lucide-react, vitest.

## Known audit notes

`npm audit` reports advisories in build-time tooling only: `postcss` bundled inside Next 15 (fixed in Next 16)
and `braces` through `eslint-config-next` (no fixed release yet). Neither ships to the browser, and the panel
only runs on localhost. Revisit when moving to Next 16.
