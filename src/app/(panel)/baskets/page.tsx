"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardTitle, Empty, ErrorBox, PageHeader, PageSkeleton, Stat, Table, Td, Th } from "@/components/ui";
import { api, type BasketDetail, type Baskets } from "@/lib/api";
import { day, pct, rupees, tone } from "@/lib/format";

export default function BasketsPage() {
  const q = useQuery({ queryKey: ["baskets"], queryFn: () => api.get<Baskets>("/api/baskets") });
  if (q.isPending) return <PageSkeleton />;
  if (q.isError) return <ErrorBox error={q.error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Baskets"
        intro="Two long-term paper portfolios. Core is the steady base, satellite chases momentum. Orders fill at the next open, like the trade books."
      />
      {q.data.baskets.length ? (
        q.data.baskets.map((b) => <BasketCard key={b.name} basket={b} />)
      ) : (
        <Empty>No basket data yet. Baskets start with the first evening run (`uv run stock-signals evening`).</Empty>
      )}
    </div>
  );
}

function BasketCard({ basket: b }: { basket: BasketDetail }) {
  const title = b.name.charAt(0).toUpperCase() + b.name.slice(1);
  return (
    <Card>
      <CardTitle term={b.name === "core" ? "core" : "satellite"} aside={<span className="text-xs text-muted">{day(b.last_date)}</span>}>
        {title} basket
      </CardTitle>
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Stat label="Value" value={rupees(b.value)} sub={`started ${rupees(b.capital)}`} />
        <Stat label="Return" term="return" value={pct(b.return, 2, true)} tone={tone(b.return)} />
        <Stat label="Invested" term="investFraction" value={pct(b.invested, 0)} sub={`target ${pct(b.invest_fraction, 0)}`} />
        <Stat label="Holdings" value={b.holdings} />
        <Stat label="Last re-pick" term="rebalance" value={day(b.last_selection)} />
      </div>

      {b.pending.length > 0 && (
        <div className="mb-4">
          <CardTitle term="pendingOrders">Next open</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm">
            {b.pending.map((o) => (
              <span key={o.symbol} className={o.qty > 0 ? "rounded bg-good-bg px-2 py-0.5 text-good" : "rounded bg-bad-bg px-2 py-0.5 text-bad"}>
                {o.qty > 0 ? "Buy" : "Sell"} {Math.abs(o.qty)} {o.symbol}
              </span>
            ))}
          </div>
        </div>
      )}

      {b.holdings_detail.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Stock</Th>
              <Th>Sector</Th>
              <Th right>Qty</Th>
              <Th right>Price</Th>
              <Th right>Value</Th>
              <Th right term="weight">Weight / target</Th>
            </tr>
          </thead>
          <tbody>
            {b.holdings_detail.map((h) => (
              <tr key={h.symbol}>
                <Td className="font-medium">{h.symbol}</Td>
                <Td className="text-muted">{h.sector || "–"}</Td>
                <Td right>{h.qty}</Td>
                <Td right>{rupees(h.price, true)}</Td>
                <Td right>{rupees(h.price == null ? null : h.price * h.qty)}</Td>
                <Td right>
                  <WeightBar weight={h.weight} target={h.target} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Empty>No holdings yet. The first selection buys at the next open.</Empty>
      )}

      {b.events.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">Recent activity ({b.events.length})</summary>
          <ul className="mt-2 space-y-2 text-sm">
            {b.events.map((e, i) => (
              <li key={`${e.date}-${i}`} className="rounded-lg bg-surface-2 p-2">
                <div className="text-xs text-muted">{day(e.date)}</div>
                <pre className="font-sans whitespace-pre-wrap">{e.text}</pre>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}

function WeightBar({ weight, target }: { weight: number; target: number }) {
  const scale = Math.max(weight, target, 0.1);
  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative h-2 w-20 rounded bg-surface-2" aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded bg-accent" style={{ width: `${(weight / scale) * 100}%` }} />
        <span className="absolute inset-y-[-2px] w-0.5 bg-text" style={{ left: `${(target / scale) * 100}%` }} />
      </span>
      <span>
        {pct(weight, 1)} <span className="text-muted">/ {pct(target, 1)}</span>
      </span>
    </div>
  );
}
