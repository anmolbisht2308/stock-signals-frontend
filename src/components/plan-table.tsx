import { Empty, Table, Td, Th } from "@/components/ui";
import type { Plan } from "@/lib/api";
import { rupees, variantLabel } from "@/lib/format";

/** Tomorrow's orders: new buys from signals and planned sells. */
export function PlanTable({ plan }: { plan: Plan }) {
  if (!plan.buys.length && !plan.sells.length) {
    return <Empty>Nothing planned for the next open.</Empty>;
  }
  return (
    <div className="space-y-4">
      {plan.buys.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Buy</Th>
              <Th>Book</Th>
              <Th right>Qty</Th>
              <Th right term="entryRange">Entry range</Th>
              <Th right term="stopLoss">Stop</Th>
              <Th right term="target">Targets</Th>
              <Th right term="risk">Risk</Th>
              <Th>Why</Th>
            </tr>
          </thead>
          <tbody>
            {plan.buys.map((b) => (
              <tr key={`${b.variant}-${b.id}`}>
                <Td className="font-medium">{b.symbol}</Td>
                <Td className="text-muted">{variantLabel(b.variant)}</Td>
                <Td right>{b.qty}</Td>
                <Td right>
                  {rupees(b.entry_low, true)} – {rupees(b.entry_high, true)}
                </Td>
                <Td right className="text-bad">{rupees(b.stop, true)}</Td>
                <Td right>
                  {b.t1 == null && b.t2 == null ? "trend exit" : [b.t1, b.t2].filter((t) => t != null).map((t) => rupees(t, true)).join(" / ")}
                </Td>
                <Td right>{rupees(b.risk_amount)}</Td>
                <Td className="max-w-xs truncate text-muted">{b.reason}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {plan.sells.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Sell</Th>
              <Th>Book</Th>
              <Th right>Qty</Th>
              <Th term="pendingExit">Reason</Th>
            </tr>
          </thead>
          <tbody>
            {plan.sells.map((s) => (
              <tr key={`${s.variant}-${s.symbol}`}>
                <Td className="font-medium">{s.symbol}</Td>
                <Td className="text-muted">{variantLabel(s.variant)}</Td>
                <Td right>{s.qty}</Td>
                <Td className="text-muted">{s.reason.replaceAll("_", " ")}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
