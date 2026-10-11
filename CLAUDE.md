# CLAUDE.md

Admin panel (Next.js) for the personal stock-signals bot. Backend repo: `stock-signals` (Python, FastAPI admin
API in `src/stock_signals/api.py`). The roadmap lives there in `docs/PLAN.md` (Phase 10). Work one sub-phase at a
time.

## Rules

- Personal use only, localhost only. Never add sign-up, subscriber, payment or public sharing features.
- The API is the only data source. Types in `src/lib/api.ts` mirror the API responses; update both together.
- Never show or store secrets (bot token, Mongo URI). The only thing stored in the browser is the login token
  (`localStorage` key `ss_token`).
- Every number or term a non-trader might not know gets an ⓘ (`<InfoTip term=...>`) backed by
  `src/lib/glossary.ts`. Keep explanations short, concrete and true to the backend rules.
- Money is shown in rupees, Indian grouping (`rupees()` in `src/lib/format.ts`). Dates are IST `YYYY-MM-DD`.
- Every page needs loading, error and empty states. Check at 390px width.
- Write vitest tests for lib helpers.

## Layout

`src/app/login` · `src/app/(panel)/*` (behind `AuthGate`, with `Sidebar`) · `src/components/ui.tsx` (Card, Stat,
Badge, Table, Empty, ErrorBox, skeletons) · `src/components/info-tip.tsx` · `src/lib/{api,format,glossary,verdict}.ts`.

## Commands

`npm run dev` · `npm test` · `npm run lint` · `npm run typecheck` · `npm run build`
