// Drishti v0.1 — asset inventory listing page | 11-Jul-2026
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { MoneyValue } from "../../components/MoneyValue";
import { RiskPill } from "../../components/RiskPill";
import { MiniStat } from "../../components/StatCard";
import { Card, EmptyState, ErrorState, Skeleton } from "../../components/primitives";
import { money } from "../../lib/format";

export function AssetsPage() {
  const q = useQuery({ queryKey: ["assets"], queryFn: () => api.assets() });
  const totalValue = (q.data ?? []).reduce((s, a) => s + a.business_value, 0);
  const exposed = (q.data ?? []).filter((a) => a.internet_facing).length;
  const critical = (q.data ?? []).filter((a) => a.criticality === "critical").length;

  return (
    <div className="relative z-10 mx-auto max-w-5xl p-6">
      <header className="mb-5">
        <div className="text-small uppercase tracking-[0.02em] text-ink-muted">Assets</div>
        <h1 className="font-display text-display text-ink-primary">Network inventory</h1>
      </header>

      {q.data && q.data.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Total assets" value={q.data.length} />
          <MiniStat label="Internet-facing" value={exposed} toneClass="text-risk-high" />
          <MiniStat label="Critical" value={critical} toneClass="text-risk-critical" />
          <MiniStat label="Total value" value={money(totalValue)} />
        </div>
      )}

      {q.isLoading && <Skeleton className="h-72" />}
      {q.isError && <ErrorState message="Couldn't load assets." onRetry={() => q.refetch()} />}
      {q.data?.length === 0 && <EmptyState title="No assets" hint="Seed the demo network first." />}
      {q.data && q.data.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full text-small">
            <thead className="border-b border-edge-subtle bg-bg-raised/40 text-left text-[11px] uppercase tracking-[0.02em] text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Host</th>
                <th className="px-4 py-2 font-medium">Zone</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Value</th>
                <th className="px-4 py-2 font-medium">Blast</th>
                <th className="px-4 py-2 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-subtle">
              {q.data.map((a) => (
                <tr key={a.id} className="hover:bg-bg-raised/40">
                  <td className="px-4 py-2.5">
                    <Link to={`/app/assets/${a.id}`} className="font-mono text-ink-primary hover:text-accent-400">
                      {a.hostname ?? a.ip}
                    </Link>
                    <div className="font-mono text-[11px] text-ink-muted">{a.ip}</div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-secondary">{a.zone ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-ink-muted">{a.asset_type}</td>
                  <td className="px-4 py-2.5">
                    <MoneyValue value={a.business_value} className="text-small" />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-ink-secondary">
                    {a.blast_radius_count ?? 0}
                  </td>
                  <td className="px-4 py-2.5">
                    <RiskPill score={a.risk_score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
