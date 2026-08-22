// Drishti v0.1 — security overview dashboard | 20-Jul-2026
/** The command surface. Opens on the thesis of the whole product — exposure
 * priced in deterministic dollars — as a live instrument readout, then the
 * ranked routes an attacker can actually walk. Built from the shared console
 * primitives so it reads as one instrument with live watch + report. */
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, ShieldOff, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { PathSummary } from "../../api/types";
import { MoneyValue } from "../../components/MoneyValue";
import { RiskPill } from "../../components/RiskPill";
import { Stagger, StaggerItem } from "../../components/motion";
import { CountUp, Eyebrow, Panel, StatReadout } from "../../components/ui/console";
import { ErrorState, Skeleton } from "../../components/primitives";
import { RISK_HEX, moneyFull, riskBucket } from "../../lib/format";

export function Dashboard() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => api.dashboard() });

  return (
    <div className="console-atmos min-h-screen">
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8 xl:px-12">
        <header className="mb-7">
          <Eyebrow>Command · Situation read</Eyebrow>
          <h1 className="mt-2.5 font-display text-display font-semibold tracking-tight text-ink-primary">
            The routes an attacker can walk, priced.
          </h1>
          <p className="mt-2 max-w-xl text-small text-ink-secondary">
            Ranked by reachability, not severity — and every figure is computed by the engine on
            screen, never hardcoded.
          </p>
        </header>

        {q.isLoading && <DashboardSkeleton />}
        {q.isError && <ErrorState message="Couldn't load the dashboard." onRetry={() => q.refetch()} />}

        {q.data && (
          <Stagger className="space-y-6">
            {q.data.open_findings === 0 && q.data.total_exposure_usd === 0 ? (
              <StaggerItem>
                <ActiveMonitoringState />
              </StaggerItem>
            ) : (
              <>
                {/* Hero: exposure gauge + the single riskiest route */}
                <StaggerItem>
                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
                    <ExposureGauge
                      value={q.data.total_exposure_usd}
                      topPath={q.data.top_paths[0]}
                    />
                    {q.data.top_paths[0] ? (
                      <RiskiestRoute path={q.data.top_paths[0]} />
                    ) : (
                      <Panel eyebrow="Priority queue" title="No ranked routes" index="—">
                        <p className="text-small text-ink-muted">
                          Run a scan to surface the reachable routes to your crown jewels.
                        </p>
                      </Panel>
                    )}
                  </div>
                </StaggerItem>

                {/* Secondary telemetry rail */}
                <StaggerItem>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatReadout label="Open findings">{q.data.open_findings}</StatReadout>
                    <StatReadout label="Critical assets">{q.data.critical_assets}</StatReadout>
                    <StatReadout label="Top path risk" tone="critical">
                      <span className="text-risk-critical">{q.data.top_path_risk.toFixed(1)}</span>
                    </StatReadout>
                  </div>
                </StaggerItem>

                {/* Severity + zones */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <StaggerItem>
                    <Panel index="02" eyebrow="Findings · by severity" title="Open findings">
                      <SeverityChart breakdown={q.data.severity_breakdown} />
                    </Panel>
                  </StaggerItem>
                  <StaggerItem>
                    <Panel index="03" eyebrow="Terrain · by zone" title="Risk zones">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                        {q.data.zone_summary.map((z) => {
                          const hex = RISK_HEX[riskBucket(z.worst_risk)];
                          return (
                            <div
                              key={z.name}
                              className="reg-frame group relative flex flex-col justify-between rounded-md border border-hairline bg-surface-1/40 p-3.5 transition-colors hover:border-accent-500/40"
                            >
                              <span aria-hidden className="reg-tick reg-br" />
                              <div className="flex items-center justify-between">
                                <span className="truncate text-[11px] text-ink-secondary">{z.name}</span>
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ background: hex, boxShadow: `0 0 6px ${hex}99` }}
                                />
                              </div>
                              <div className="mt-2 font-display text-h1 font-semibold text-ink-primary tabular-nums">
                                {z.asset_count}
                              </div>
                              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                                worst {z.worst_risk.toFixed(0)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Panel>
                  </StaggerItem>
                </div>

                {/* Ranked routes — a real priority sequence, so the index numbers mean something */}
                <StaggerItem>
                  <Panel
                    index="04"
                    eyebrow="Priority · reachability × value"
                    title="Ranked attack routes"
                    bodyClassName=""
                  >
                    {q.data.top_paths.length === 0 ? (
                      <div className="p-5 text-small text-ink-muted">No ranked paths yet.</div>
                    ) : (
                      <ol className="divide-y divide-hairline-soft">
                        {q.data.top_paths.map((p, i) => (
                          <RouteRow key={p.id} path={p} rank={i + 1} />
                        ))}
                      </ol>
                    )}
                  </Panel>
                </StaggerItem>
              </>
            )}
          </Stagger>
        )}
      </div>
    </div>
  );
}

/** The thesis, as an instrument: exposure counted up in precise dollars, with a
 * faint scanline sweep. This is the most characteristic thing Drishti shows. */
function ExposureGauge({ value, topPath }: { value: number; topPath?: PathSummary }) {
  return (
    <Panel
      index="01"
      eyebrow="Total exposure · priced"
      tone="critical"
      glow
      bodyClassName="px-5 pb-5 pt-1"
      className="scanline"
    >
      <div className="font-display text-[clamp(2.75rem,6vw,4.25rem)] font-semibold leading-[0.95] tracking-tight text-risk-critical tabular-nums drop-shadow-[0_0_24px_rgba(239,70,85,0.25)]">
        <CountUp value={value} format={moneyFull} durationMs={1200} />
      </div>
      <p className="mt-3 max-w-md text-small text-ink-secondary">
        Summed from priced attack paths, deduped by target — real money at risk, not a severity
        count.
      </p>
      {topPath && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-sm border border-risk-critical/25 bg-risk-critical/[0.06] px-2.5 py-1.5 font-mono text-[11px] text-ink-secondary">
          <span className="text-risk-critical">▲</span>
          <MoneyValue value={topPath.impact_usd} className="text-[11px]" /> on the single riskiest
          route
        </div>
      )}
    </Panel>
  );
}

/** The riskiest route right now — the one-click path to its $ impact + fix. */
function RiskiestRoute({ path }: { path: PathSummary }) {
  return (
    <Link to={`/app/paths/${path.id}`} className="block focus-visible:outline-none">
      <Panel
        index="→"
        eyebrow="Riskiest route now"
        tone="accent"
        className="transition-transform duration-300 hover:-translate-y-1"
        bodyClassName="flex flex-col gap-5 px-5 pb-5 pt-2"
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-small">
          <span className="rounded-sm bg-accent-500/15 px-2 py-0.5 font-semibold text-accent-400">
            {path.entry_label}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />
          <span className="font-semibold text-ink-primary">
            {path.target_hostname || "crown jewel"}
          </span>
          <span className="text-ink-muted">· {path.hop_count} hops</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Exposure on this path
            </div>
            <MoneyValue value={path.impact_usd} size="lg" tint className="mt-1 block" />
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-accent-500 px-3.5 py-2 font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-on-primary transition-colors hover:bg-accent-600">
            <Wrench className="h-3.5 w-3.5" /> View &amp; fix
          </span>
        </div>
      </Panel>
    </Link>
  );
}

function RouteRow({ path, rank }: { path: PathSummary; rank: number }) {
  return (
    <li>
      <Link
        to={`/app/paths/${path.id}`}
        className="flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-surface-2/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 sm:flex-row sm:items-center sm:gap-4"
      >
        <span className="w-6 shrink-0 font-mono text-[13px] font-semibold tabular-nums text-hairline">
          {String(rank).padStart(2, "0")}
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-small">
          <span className="rounded-sm bg-accent-500/15 px-1.5 py-0.5 text-accent-400">
            {path.entry_label}
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          <span className="text-ink-primary">{path.target_hostname}</span>
          <span className="shrink-0 text-ink-muted">· {path.hop_count} hops</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <RiskPill score={path.path_risk} />
          <MoneyValue value={path.impact_usd} tint className="w-20 text-right" />
        </div>
      </Link>
    </li>
  );
}

function SeverityChart({
  breakdown,
}: {
  breakdown: { critical: number; high: number; medium: number; low: number };
}) {
  const rows = [
    { name: "Critical", value: breakdown.critical, hex: RISK_HEX.critical },
    { name: "High", value: breakdown.high, hex: RISK_HEX.high },
    { name: "Medium", value: breakdown.medium, hex: RISK_HEX.medium },
    { name: "Low", value: breakdown.low, hex: RISK_HEX.safe },
  ];
  const total = rows.reduce((s, r) => s + r.value, 0);
  const max = Math.max(...rows.map((r) => r.value), 1);
  if (total === 0)
    return (
      <div className="flex items-center gap-2 py-6 text-small text-ink-muted">
        <ShieldOff className="h-4 w-4" /> No open findings.
      </div>
    );
  return (
    <div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-bg-inset">
        {rows
          .filter((r) => r.value > 0)
          .map((r) => (
            <span
              key={r.name}
              className="h-full"
              style={{ width: `${(r.value / total) * 100}%`, background: r.hex }}
              title={`${r.name}: ${r.value}`}
            />
          ))}
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: r.hex, boxShadow: `0 0 6px ${r.hex}66` }}
            />
            <span className="w-16 shrink-0 text-small text-ink-secondary">{r.name}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-inset shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <span
                className="block h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{
                  width: `${(r.value / max) * 100}%`,
                  background: `linear-gradient(90deg, transparent, ${r.hex})`,
                  boxShadow: `0 0 8px ${r.hex}88`,
                }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-mono text-small tabular-nums text-ink-primary">
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-hairline-soft pt-2.5 font-mono text-[11px] text-ink-muted">
        <span className="uppercase tracking-[0.1em]">Total open</span>
        <span className="tabular-nums text-ink-primary">{total}</span>
      </div>
    </div>
  );
}

function ActiveMonitoringState() {
  return (
    <Panel eyebrow="Status · nominal" title="System secure & actively monitoring" tone="safe" glow>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-risk-safe/10" style={{ animationDuration: "3s" }} />
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-risk-safe/50 bg-canvas/80 shadow-[0_0_20px_rgba(46,194,126,0.35)]">
            <ShieldCheck className="h-7 w-7 text-risk-safe" />
          </div>
        </div>
        <p className="max-w-2xl text-small text-ink-secondary">
          No vulnerabilities or critical exposures detected in your network. The Drishti engine is
          continuously scanning for new assets and emerging threats — priced exposure will appear
          here the moment a reachable route forms.
        </p>
      </div>
    </Panel>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
