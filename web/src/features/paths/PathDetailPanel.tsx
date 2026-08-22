// Drishti v0.1 — attack path detail panel with AI remediation | 11-Jul-2026
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowDown, Crosshair, Crown, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import type { PathDetail } from "../../api/types";
import { Button } from "../../components/Button";
import { BreachSimulation } from "./BreachSimulation";
import { MoneyValue } from "../../components/MoneyValue";
import { RiskPill } from "../../components/RiskPill";
import { SeverityBadge } from "../../components/SeverityBadge";
import { Card, ErrorState, LoadingBlock } from "../../components/primitives";
import { percent } from "../../lib/format";

/** Reused in the graph drawer and the full path page. Streams the AI narrative
 * while showing the deterministic $ number instantly (APP_FLOW.md §7 beat 3). */
export function PathDetailPanel({ pathId }: { pathId: string }) {
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["path", pathId], queryFn: () => api.path(pathId) });

  const impact = useMutation({ mutationFn: () => api.impact(pathId) });
  const [breakMsg, setBreakMsg] = useState<string | null>(null);
  const [showSim, setShowSim] = useState(false);
  useEffect(() => {
    impact.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathId]);

  if (q.isLoading) return <LoadingBlock label="Loading path…" />;
  if (q.isError || !q.data)
    return <ErrorState message="Couldn't load this attack path." onRetry={() => q.refetch()} />;
  const p: PathDetail = q.data;

  // the highest-leverage finding = the target hop's via-vuln step; break-this-path
  // routes to remediation for the final step's asset finding when resolvable.
  const finalStep = p.steps[p.steps.length - 1];

  const breakPath = async () => {
    setBreakMsg(null);
    if (!finalStep) {
      setBreakMsg("This path has no steps to remediate.");
      return;
    }
    try {
      // 1) prefer an open finding on the final hop matching its via_cve
      const asset = await api.asset(finalStep.asset_id);
      const match =
        asset.findings.find(
          (f) => f.status === "open" && finalStep.via_cve && f.cve_id === finalStep.via_cve,
        ) ?? asset.findings.find((f) => f.status === "open");
      if (match) {
        navigate(`/app/remediate/${match.id}`);
        return;
      }
      // 2) fall back to the highest-risk open finding anywhere along the path
      const pathAssetIds = new Set(p.steps.map((s) => s.asset_id));
      const open = await api.findings("?status=open");
      const onPath = open
        .filter((f) => pathAssetIds.has(f.asset_id))
        .sort((a, b) => b.cvss - a.cvss);
      if (onPath[0]) {
        navigate(`/app/remediate/${onPath[0].id}`);
        return;
      }
      // 3) nothing open on this path — say so, offer the findings list
      setBreakMsg("No open findings remain on this path — it may already be broken.");
    } catch {
      setBreakMsg("Couldn't look up findings for this path right now.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 font-mono text-small text-ink-muted">
          <span className="rounded-sm bg-accent-500/15 px-1.5 py-0.5 text-accent-500">
            {p.entry_label}
          </span>
          <span>→</span>
          <span className="text-ink-primary">{p.target_hostname}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <MoneyValue value={p.impact_usd} size="lg" tint />
          <RiskPill score={p.path_risk} />
          <span className="font-mono text-small text-ink-muted">
            likelihood {percent(p.likelihood)}
          </span>
        </div>
      </div>

      <section>
        <div className="mb-2 text-[11px] uppercase tracking-[0.02em] text-ink-muted">
          Attack path · {p.hop_count} hops
        </div>
        <ol className="relative space-y-1.5 border-l border-edge-subtle pl-4">
          {p.steps.map((s, i) => (
            <li key={s.step_index} className="relative">
              <span
                className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${
                  i === p.steps.length - 1 ? "bg-risk-critical" : "bg-edge-strong"
                }`}
              />
              <div className="rounded-md border border-edge-subtle bg-bg-surface p-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-small text-ink-primary">
                    {i === p.steps.length - 1 && <Crown className="h-3 w-3 text-risk-critical" />}
                    {s.asset_hostname ?? s.asset_ip}
                  </span>
                  <span className="text-[11px] text-ink-muted">{s.zone}</span>
                </div>
                {s.via_cve && (
                  <div className="mt-1.5 flex items-center gap-2">
                    {s.via_severity && (
                      <SeverityBadge severity={s.via_severity} score={s.via_cvss} />
                    )}
                    <span className="font-mono text-[11px] text-ink-muted">
                      via {s.via_cve} — {s.via_title}
                    </span>
                  </div>
                )}
              </div>
              {i < p.steps.length - 1 && (
                <ArrowDown className="ml-1 mt-1 h-3 w-3 text-ink-muted" />
              )}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="mb-2 text-[11px] uppercase tracking-[0.02em] text-ink-muted">
          Business impact
        </div>
        <Card className="p-4">
          {impact.isPending && (
            <div className="text-small text-ink-muted">
              Analyzing impact…{" "}
              <MoneyValue value={p.impact_usd} tint className="text-small" /> exposure computed.
            </div>
          )}
          {impact.data && !impact.data.refused && (
            <div className="space-y-3">
              <div className="font-display text-h3 leading-snug text-ink-primary">
                {impact.data.headline}
              </div>
              <p className="text-body text-ink-secondary">{impact.data.narrative}</p>
              {impact.data.drivers.length > 0 && (
                <ul className="space-y-1">
                  {impact.data.drivers.map((d, i) => (
                    <li key={i} className="flex gap-2 text-small text-ink-secondary">
                      <span className="text-risk-high">▸</span> {d}
                    </li>
                  ))}
                </ul>
              )}
              <div className="rounded-md border border-accent-500/25 bg-accent-500/5 p-2.5 text-small text-ink-secondary">
                <span className="text-accent-400">Highest-leverage action:</span>{" "}
                {impact.data.highest_leverage_action}
              </div>
            </div>
          )}
          {impact.data?.refused && (
            <div className="text-small text-ink-muted">
              This narrative isn't available — the deterministic figure of{" "}
              <MoneyValue value={p.impact_usd} className="text-small" /> still stands.
            </div>
          )}
          {impact.isError && (
            <div className="space-y-2 text-small text-ink-muted">
              <div>
                Couldn't generate the AI narrative — the deterministic exposure of{" "}
                <MoneyValue value={p.impact_usd} tint className="text-small" /> still stands.
              </div>
              <Button variant="ghost" size="sm" onClick={() => impact.mutate()}>
                Retry analysis
              </Button>
            </div>
          )}
        </Card>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => setShowSim(true)} className="w-full">
          <Crosshair className="h-4 w-4" /> Simulate breach
        </Button>
        <Button variant="ghost" onClick={breakPath} className="w-full">
          <Scissors className="h-4 w-4" /> Break this path
        </Button>
      </div>
      {breakMsg && (
        <div className="rounded-md border border-edge-subtle bg-bg-surface p-2.5 text-small text-ink-secondary">
          {breakMsg}{" "}
          <Link to="/app/findings" className="text-accent-400 hover:underline">
            Review all findings →
          </Link>
        </div>
      )}

      {showSim && (
        <BreachSimulation
          path={p}
          onClose={() => setShowSim(false)}
          onBreakPath={() => {
            setShowSim(false);
            breakPath();
          }}
        />
      )}
    </div>
  );
}
