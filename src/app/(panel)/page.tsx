"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { InfoTip } from "@/components/info-tip";
import { PlanTable } from "@/components/plan-table";
import { Badge, Card, CardTitle, Empty, ErrorBox, PageHeader, PageSkeleton, Stat } from "@/components/ui";
import { api, type Dashboard } from "@/lib/api";
import { day, num, pct, rupees, tone, variantLabel, when } from "@/lib/format";
import { MODE_INFO, marketReading, staleness } from "@/lib/verdict";

export default function DashboardPage() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => api.get<Dashboard>("/api/dashboard") });
  if (q.isPending) return <PageSkeleton />;
  if (q.isError) return <ErrorBox error={q.error} />;
  const d = q.data;
  const fresh = staleness(d.latest_session);
  const mode = d.market ? MODE_INFO[d.market.mode] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        intro="Everything the bot knows today, in one place. Tap any ⓘ for a plain explanation."
      >
        <div className="flex flex-wrap gap-2">
          {d.paused && <Badge tone="warn">Paused</Badge>}
          <Badge tone={fresh.tone}>Data: {day(d.latest_session)}</Badge>
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle term="regime" aside={mode && <Badge tone={mode.tone}>{mode.label}</Badge>}>
            Market today
          </CardTitle>
          {d.market ? (
            <>
              <p className="mb-4 text-sm">{marketReading(d.market)}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Nifty 50" value={num(d.market.nifty_close, 0)} />
                <Stat label="200-day avg" term="sma200" value={num(d.market.nifty_sma200, 0)} />
                <Stat
                  label="Nifty vs avg"
                  value={pct(d.market.nifty_vs_sma200, 1, true)}
                  tone={tone(d.market.nifty_vs_sma200)}
                />
                <Stat label="Breadth" term="breadth" value={pct(d.market.breadth50, 0)} />
              </div>
              <p className="mt-4 flex items-center gap-1 text-xs text-muted">
                {d.market.week_end
                  ? "Today is the last session of the week, so the positional book looked for new buys."
                  : "Not a week-end session: the positional book only checks exits today."}
                <InfoTip term="weekEnd" />
              </p>
            </>
          ) : (
            <Empty>No price data yet. Run `uv run stock-signals backfill` first.</Empty>
          )}
        </Card>

        <Card>
          <CardTitle term="dataRun">Data</CardTitle>
          <p className="mb-3 text-sm">{fresh.text}</p>
          {d.last_data_run ? (
            <dl className="space-y-1 text-sm">
              <Row label="Last run" value={when(d.last_data_run.finished_at)} />
              <Row label="Kind" value={d.last_data_run.kind} />
              <Row label="Symbols" value={num(d.last_data_run.symbols, 0)} />
              <Row
                label="Failed"
                value={
                  d.last_data_run.failed.length ? (
                    <span className="text-warn">{d.last_data_run.failed.length}</span>
                  ) : (
                    "0"
                  )
                }
              />
            </dl>
          ) : (
            <p className="text-sm text-muted">No update recorded yet. The next `update` or evening job will show here.</p>
          )}
          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted">
              Schedule <InfoTip term="schedule" />
            </div>
            <dl className="space-y-1 text-sm">
              {Object.entries(d.schedule).map(([k, v]) => (
                <Row key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v} />
              ))}
            </dl>
          </div>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-1 text-sm font-semibold">
          Paper books <InfoTip term="paper" />
        </h2>
        {d.books.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {d.books.map((b) => (
              <Card key={b.variant}>
                <CardTitle
                  term={b.variant.includes("+") ? "variant" : b.book === "swing" ? "swing" : "positional"}
                  aside={<span className="text-xs text-muted">{day(b.last_date)}</span>}
                >
                  {variantLabel(b.variant)}
                </CardTitle>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Equity" term="equity" value={rupees(b.equity)} />
                  <Stat label="Return" term="return" value={pct(b.return, 2, true)} tone={tone(b.return)} />
                  <Stat label="Cash" term="cash" value={rupees(b.cash)} />
                  <Stat
                    label="Open / planned"
                    value={`${b.open_positions} / ${b.pending_signals}`}
                    sub="positions / new buys"
                  />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty>No paper books yet. They start after the first evening run (`uv run stock-signals evening`).</Empty>
        )}
        {!d.swing_enabled && (
          <p className="mt-2 flex items-center gap-1 text-xs text-muted">
            Swing book is off (SWING_ENABLED=false). <InfoTip term="swing" />
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-1 text-sm font-semibold">
          Baskets <InfoTip term="basket" />
        </h2>
        {d.baskets.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {d.baskets.map((b) => (
              <Card key={b.name}>
                <CardTitle
                  term={b.name === "core" ? "core" : "satellite"}
                  aside={
                    <Link href="/baskets" className="text-xs text-accent hover:underline">
                      Details
                    </Link>
                  }
                >
                  {b.name.charAt(0).toUpperCase() + b.name.slice(1)}
                </CardTitle>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label="Value" value={rupees(b.value)} />
                  <Stat label="Return" value={pct(b.return, 2, true)} tone={tone(b.return)} />
                  <Stat label="Invested" term="investFraction" value={pct(b.invested, 0)} sub={`target ${pct(b.invest_fraction, 0)}`} />
                  <Stat label="Holdings" value={b.holdings} sub={b.pending_orders ? `${b.pending_orders} pending` : undefined} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty>No basket data yet. Baskets start with the first evening run.</Empty>
        )}
      </section>

      <Card>
        <CardTitle
          term="plan"
          aside={
            <Link href="/positions" className="text-xs text-accent hover:underline">
              All positions
            </Link>
          }
        >
          Tomorrow&apos;s plan
        </CardTitle>
        <PlanTable plan={d.plan} />
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
