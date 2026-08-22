// Drishti v0.1 — ranked attack paths listing | 11-Jul-2026
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { MoneyValue } from "../../components/MoneyValue";
import { RiskPill } from "../../components/RiskPill";
import { MiniStat } from "../../components/StatCard";
import { Card, EmptyState, ErrorState, Skeleton } from "../../components/primitives";
import { money, percent } from "../../lib/format";

export function PathsPage() {
  const q = useQuery({ queryKey: ["paths"], queryFn: () => api.paths(25) });
  const topRisk = Math.max(0, ...(q.data ?? []).map((p) => p.path_risk));
  const highestImpact = Math.max(0, ...(q.data ?? []).map((p) => p.impact_usd));
  const distinctTargets = new Set((q.data ?? []).map((p) => p.target_asset_id)).size;

  return (
    <div className="relative z-10 mx-auto max-w-5xl p-6">
      <header className="mb-5">
        <div className="text-small uppercase tracking-[0.02em] text-ink-muted">Attack Paths</div>
        <h1 className="font-display text-display text-ink-primary">Ranked breach routes</h1>
      </header>

      {q.data && q.data.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Ranked paths" value={q.data.length} />
          <MiniStat label="Targets at risk" value={distinctTargets} />
          <MiniStat label="Top path risk" value={topRisk.toFixed(1)} toneClass="text-risk-critical" />
          <MiniStat label="Highest impact" value={money(highestImpact)} />
        </div>
      )}

      {q.isLoading && <Skeleton className="h-72" />}
      {q.isError && <ErrorState message="Couldn't load paths." onRetry={() => q.refetch()} />}
      {q.data?.length === 0 && <EmptyState title="No attack paths" hint="Seed the demo network first." />}
      {q.data && q.data.length > 0 && (
        <Card className="divide-y divide-edge-subtle">
          {q.data.map((p, i) => (
            <Link
              key={p.id}
              to={`/app/paths/${p.id}`}
              className="flex flex-col gap-2 px-4 py-3 hover:bg-bg-raised/50 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-small">
                <span className="w-6 shrink-0 text-ink-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rounded-sm bg-accent-500/15 px-1.5 py-0.5 text-accent-500">
                  {p.entry_label}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                <span className="text-ink-primary">{p.target_hostname}</span>
                <span className="shrink-0 text-ink-muted">
                  · {p.hop_count} hops · {percent(p.likelihood)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3 pl-6 sm:pl-0">
                <RiskPill score={p.path_risk} />
                <MoneyValue value={p.impact_usd} tint className="w-20 text-right" />
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
