// Drishti v0.1 — asset detail side panel | 11-Jul-2026
import { useQuery } from "@tanstack/react-query";
import { MapPin, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Button } from "../../components/Button";
import { MoneyValue } from "../../components/MoneyValue";
import { RiskPill } from "../../components/RiskPill";
import { SeverityBadge } from "../../components/SeverityBadge";
import { ErrorState, LoadingBlock } from "../../components/primitives";

/** Reused in the graph drawer and the full asset page. */
export function AssetDetailPanel({
  assetId,
  showViewOnMap = false,
}: {
  assetId: string;
  showViewOnMap?: boolean;
}) {
  const q = useQuery({ queryKey: ["asset", assetId], queryFn: () => api.asset(assetId) });

  if (q.isLoading) return <LoadingBlock label="Loading asset…" />;
  if (q.isError || !q.data)
    return <ErrorState message="Couldn't load this asset." onRetry={() => q.refetch()} />;
  const a = q.data;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="font-display text-h2 text-ink-primary">{a.hostname ?? a.ip}</div>
          <RiskPill score={a.risk_score} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-small text-ink-muted">
          <span>{a.ip}</span>
          <span>· {a.asset_type}</span>
          {a.zone && <span>· {a.zone}</span>}
          <span>· {a.criticality}</span>
          {a.os && <span>· {a.os}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniStat label="Business value">
          <MoneyValue value={a.business_value} />
        </MiniStat>
        <MiniStat label="Reaches (blast)">
          <span className="font-mono text-body text-ink-primary">
            {a.blast_radius_count ?? 0} assets
          </span>
        </MiniStat>
      </div>
      <div className="rounded-md border border-risk-critical/25 bg-risk-critical/5 p-3 text-small">
        If compromised, this node reaches{" "}
        <span className="font-mono text-ink-primary">{a.blast_radius_count ?? 0}</span> assets worth{" "}
        <MoneyValue value={a.downstream_value} tint className="text-small" />.
      </div>

      {showViewOnMap && (
        <Link to={`/app/graph?focus=${a.id}`}>
          <Button variant="ghost" size="sm">
            <MapPin className="h-3.5 w-3.5" /> View on map
          </Button>
        </Link>
      )}

      {a.services.length > 0 && (
        <section>
          <SectionLabel>Services</SectionLabel>
          <div className="overflow-hidden rounded-md border border-edge-subtle">
            <table className="w-full text-small">
              <tbody className="divide-y divide-edge-subtle font-mono">
                {a.services.map((s) => (
                  <tr key={s.id} className="text-ink-secondary">
                    <td className="px-3 py-1.5 text-ink-primary">
                      {s.port}/{s.protocol}
                    </td>
                    <td className="px-3 py-1.5">{s.name}</td>
                    <td className="px-3 py-1.5 text-ink-muted">{s.version ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {a.findings.length > 0 && (
        <section>
          <SectionLabel>Findings</SectionLabel>
          <div className="space-y-2">
            {a.findings.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-2 rounded-md border border-edge-subtle bg-bg-surface p-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-small text-ink-primary">{f.title}</div>
                  <div className="font-mono text-[11px] text-ink-muted">{f.cve_id ?? "—"}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SeverityBadge severity={f.severity} score={f.cvss} />
                  {f.status === "open" && (
                    <Link to={`/app/remediate/${f.id}`}>
                      <Button variant="ghost" size="sm">
                        <Wrench className="h-3 w-3" /> Fix
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MiniStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-edge-subtle bg-bg-surface p-3">
      <div className="text-[11px] uppercase tracking-[0.02em] text-ink-muted">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] uppercase tracking-[0.02em] text-ink-muted">{children}</div>
  );
}
