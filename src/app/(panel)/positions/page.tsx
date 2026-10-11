"use client";

import { useQuery } from "@tanstack/react-query";

import { PlanTable } from "@/components/plan-table";
import { Badge, Card, CardTitle, Empty, ErrorBox, PageHeader, PageSkeleton, Stat, Table, Td, Th, Toned } from "@/components/ui";
import { api, type Positions } from "@/lib/api";
import { day, pct, pnl, rMultiple, rupees, tone, variantLabel } from "@/lib/format";

export default function PositionsPage() {
  const q = useQuery({ queryKey: ["positions"], queryFn: () => api.get<Positions>("/api/positions?limit=200") });
  if (q.isPending) return <PageSkeleton />;
  if (q.isError) return <ErrorBox error={q.error} />;
  const { open, closed, plan } = q.data;
  const unrealised = open.reduce((s, p) => s + p.unrealised_pnl, 0);
  const realised = closed.reduce((s, t) => s + t.net_pnl, 0);
  const wins = closed.filter((t) => t.net_pnl > 0).length;
  const avgR = closed.length ? closed.reduce((s, t) => s + t.r_multiple, 0) / closed.length : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Positions"
        intro="What the paper books hold now, what they plan for the next open, and every closed trade."
      />

      <Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Open positions" value={open.length} />
          <Stat label="Unrealised P&L" term="unrealised" value={pnl(unrealised)} tone={tone(unrealised)} />
          <Stat label="Closed trades" value={closed.length} sub={closed.length ? `${wins} won (${pct(wins / closed.length, 0)})` : undefined} />
          <Stat label="Avg R / trade" term="expectancy" value={rMultiple(avgR)} tone={tone(avgR)} sub={`net ${pnl(realised)}`} />
        </div>
      </Card>

      <Card>
        <CardTitle term="plan">Next open</CardTitle>
        <PlanTable plan={plan} />
      </Card>

      <Card>
        <CardTitle>Open positions</CardTitle>
        {open.length ? (
          <Table>
            <thead>
              <tr>
                <Th>Stock</Th>
                <Th>Book</Th>
                <Th>Since</Th>
                <Th right>Qty</Th>
                <Th right>Entry</Th>
                <Th right>Last close</Th>
                <Th right term="stopLoss">Stop</Th>
                <Th right term="target">Targets</Th>
                <Th right term="unrealised">P&amp;L</Th>
                <Th term="pendingExit">Status</Th>
              </tr>
            </thead>
            <tbody>
              {open.map((p) => (
                <tr key={`${p.variant}-${p.id}`}>
                  <Td className="font-medium">
                    {p.symbol}
                    {p.sector && <div className="text-xs font-normal text-muted">{p.sector}</div>}
                  </Td>
                  <Td className="text-muted">{variantLabel(p.variant)}</Td>
                  <Td>
                    {day(p.entry_date)}
                    <div className="text-xs text-muted">{p.bars_held} days</div>
                  </Td>
                  <Td right>{p.qty}</Td>
                  <Td right>{rupees(p.entry_price, true)}</Td>
                  <Td right>{rupees(p.last_close, true)}</Td>
                  <Td right>
                    <span className="text-bad">{rupees(p.stop, true)}</span>
                    {p.stop !== p.initial_stop && <div className="text-xs text-muted">was {rupees(p.initial_stop, true)}</div>}
                  </Td>
                  <Td right>
                    {p.t1 == null && p.t2 == null
                      ? <span className="text-muted">trend exit</span>
                      : [p.t1, p.t2].filter((t) => t != null).map((t) => rupees(t, true)).join(" / ")}
                    {p.t1_done && <div className="text-xs text-good">T1 hit</div>}
                  </Td>
                  <Td right>
                    <Toned tone={tone(p.unrealised_pnl)}>{pnl(p.unrealised_pnl)}</Toned>
                    <div className="text-xs text-muted">{pct(p.unrealised_pct, 1, true)}</div>
                  </Td>
                  <Td>
                    {p.pending_exit ? <Badge tone="warn">Sell: {p.pending_exit.replaceAll("_", " ")}</Badge> : <Badge>Holding</Badge>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Empty>No open positions. New buys appear after a signal is filled at the next open.</Empty>
        )}
      </Card>

      <Card>
        <CardTitle>Closed trades</CardTitle>
        {closed.length ? (
          <Table>
            <thead>
              <tr>
                <Th>Stock</Th>
                <Th>Book</Th>
                <Th>Entry → exit</Th>
                <Th right>Qty</Th>
                <Th right>Prices</Th>
                <Th right term="costs">Costs</Th>
                <Th right term="netPnl">Net P&amp;L</Th>
                <Th right term="rMultiple">R</Th>
                <Th right term="daysHeld">Days</Th>
                <Th term="exitReason">Exit</Th>
              </tr>
            </thead>
            <tbody>
              {closed.map((t) => (
                <tr key={t.position_id}>
                  <Td className="font-medium">{t.symbol}</Td>
                  <Td className="text-muted">{variantLabel(t.rule_version)}</Td>
                  <Td>
                    {day(t.entry_date)} → {day(t.exit_date)}
                  </Td>
                  <Td right>{t.qty}</Td>
                  <Td right>
                    {rupees(t.entry_price, true)} → {rupees(t.avg_exit_price, true)}
                  </Td>
                  <Td right className="text-muted">{rupees(t.costs)}</Td>
                  <Td right>
                    <Toned tone={tone(t.net_pnl)}>{pnl(t.net_pnl)}</Toned>
                  </Td>
                  <Td right>
                    <Toned tone={tone(t.r_multiple)}>{rMultiple(t.r_multiple)}</Toned>
                  </Td>
                  <Td right>{t.days_held}</Td>
                  <Td className="text-muted">{t.exit_reason.replaceAll("_", " ")}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Empty>No closed trades yet. Give paper trading a few weeks.</Empty>
        )}
      </Card>
    </div>
  );
}
