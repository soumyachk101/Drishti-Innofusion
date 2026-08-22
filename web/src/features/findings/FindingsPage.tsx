// Drishti v0.1 — vulnerability findings table | 11-Jul-2026
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wrench } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { Finding } from "../../api/types";
import { Button } from "../../components/Button";
import { SeverityBadge } from "../../components/SeverityBadge";
import { MiniStat } from "../../components/StatCard";
import { Card, EmptyState, ErrorState, Select, Skeleton } from "../../components/primitives";
import { useToast } from "../../store/graphStore";

const STATUS_TINT: Record<string, string> = {
  open: "text-status-open",
  remediating: "text-status-remediating",
  resolved: "text-status-resolved",
  accepted: "text-ink-muted",
};

export function FindingsPage() {
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const qc = useQueryClient();
  const toast = useToast();

  const query = new URLSearchParams();
  if (severity) query.set("severity", severity);
  if (status) query.set("status", status);
  const qs = query.toString() ? `?${query}` : "";

  const q = useQuery({
    queryKey: ["findings", severity, status],
    queryFn: () => api.findings(qs),
  });

  const setStatusMut = useMutation({
    mutationFn: ({ id, s }: { id: string; s: string }) => api.patchFinding(id, s),
    onSuccess: (_d, v) => {
      qc.invalidateQueries();
      toast.show(`Finding ${v.s}`, v.s === "resolved" ? "success" : "info");
    },
    onError: () => toast.show("Couldn't update — retry", "error"),
  });

  const counts = (q.data ?? []).reduce(
    (acc, f) => {
      if (f.severity === "critical") acc.critical++;
      if (f.status === "open") acc.open++;
      if (f.status === "resolved") acc.resolved++;
      return acc;
    },
    { critical: 0, open: 0, resolved: 0 },
  );

  return (
    <div className="relative z-10 mx-auto max-w-5xl p-6">
      <header className="mb-5">
        <div className="text-small uppercase tracking-[0.02em] text-ink-muted">Findings</div>
        <h1 className="font-display text-display text-ink-primary">Open vulnerabilities</h1>
      </header>

      {q.data && q.data.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Showing" value={q.data.length} />
          <MiniStat label="Critical" value={counts.critical} toneClass="text-risk-critical" />
          <MiniStat label="Open" value={counts.open} toneClass="text-status-open" />
          <MiniStat label="Resolved" value={counts.resolved} toneClass="text-status-resolved" />
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          uiSize="sm"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          aria-label="Filter by severity"
        >
          <option value="">All Severity</option>
          {["critical", "high", "medium", "low"].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
        <Select
          uiSize="sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          {["open", "remediating", "resolved", "accepted"].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </div>

      {q.isLoading && <Skeleton className="h-72" />}
      {q.isError && <ErrorState message="Couldn't load findings." onRetry={() => q.refetch()} />}
      {q.data?.length === 0 && <EmptyState title="No findings match" hint="Try clearing the filters." />}
      {q.data && q.data.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full text-small">
            <thead className="border-b border-edge-subtle bg-bg-raised/40 text-left text-[11px] uppercase tracking-[0.02em] text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Asset</th>
                <th className="px-4 py-2 font-medium">Vulnerability</th>
                <th className="px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-subtle">
              {q.data.map((f: Finding) => (
                <tr key={f.id} className="hover:bg-bg-raised/40">
                  <td className="px-4 py-2.5">
                    <Link to={`/app/assets/${f.asset_id}`} className="font-mono text-ink-primary hover:text-accent-400">
                      {f.asset_hostname ?? f.asset_ip}
                    </Link>
                  </td>
                  <td className="max-w-xs px-4 py-2.5">
                    <div className="truncate text-ink-secondary">{f.title}</div>
                    <div className="font-mono text-[11px] text-ink-muted">{f.cve_id ?? "—"}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <SeverityBadge severity={f.severity} score={f.cvss} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Select
                      uiSize="sm"
                      value={f.status}
                      onChange={(e) => setStatusMut.mutate({ id: f.id, s: e.target.value })}
                      aria-label={`Status for ${f.asset_hostname ?? f.asset_ip}`}
                      className={STATUS_TINT[f.status]}
                    >
                      {["open", "remediating", "resolved", "accepted"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {f.status === "open" && (
                      <Link to={`/app/remediate/${f.id}`}>
                        <Button variant="ghost" size="sm">
                          <Wrench className="h-3 w-3" /> Generate fix
                        </Button>
                      </Link>
                    )}
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
