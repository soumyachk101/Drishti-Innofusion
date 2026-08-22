// Drishti v0.1 — URL trust analyzer page | 11-Jul-2026
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  HelpCircle,
  Lock,
  MinusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Unlink,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { api, ApiError } from "../../api/client";
import type {
  SignalStatus,
  TrustBand,
  UrlAnalysisResult,
  UrlSignal,
} from "../../api/types";
import { Card, EmptyState } from "../../components/primitives";
import { Button } from "../../components/Button";
import { RISK_TEXT, type RiskToken } from "../../lib/format";

/** Band → risk-ramp token (Trusted = teal, Caution = amber, High Risk = coral). */
const BAND_TOKEN: Record<TrustBand, RiskToken> = {
  Trusted: "safe",
  Caution: "medium",
  "High Risk": "critical",
};
const BAND_RING: Record<TrustBand, string> = {
  Trusted: "border-risk-safe/50 bg-risk-safe/10",
  Caution: "border-risk-medium/50 bg-risk-medium/10",
  "High Risk": "border-risk-critical/50 bg-risk-critical/10",
};

/** Each status gets a DISTINCT look. Unavailable states (unknown / not_configured
 * / unreachable) are muted + never rendered as a passing green. */
const STATUS_UI: Record<
  SignalStatus,
  { icon: typeof CheckCircle2; tint: string; label: string; counted: boolean }
> = {
  pass: { icon: CheckCircle2, tint: "text-risk-safe", label: "Pass", counted: true },
  warn: { icon: AlertTriangle, tint: "text-risk-medium", label: "Caution", counted: true },
  fail: { icon: XCircle, tint: "text-risk-critical", label: "Fail", counted: true },
  unknown: { icon: HelpCircle, tint: "text-ink-muted", label: "Unknown", counted: false },
  not_configured: { icon: MinusCircle, tint: "text-ink-muted", label: "Not configured", counted: false },
  unreachable: { icon: WifiOff, tint: "text-ink-muted", label: "Unreachable", counted: false },
};

export function UrlAnalyzerPage() {
  const [url, setUrl] = useState("");
  const qc = useQueryClient();

  const analyze = useMutation({
    mutationFn: (u: string) => api.analyzeUrl(u),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["url-history"] }),
  });

  const history = useQuery({ queryKey: ["url-history"], queryFn: () => api.urlHistory() });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) analyze.mutate(url.trim());
  };

  const result = analyze.data;
  const err = analyze.error as ApiError | null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-5">
        <div className="text-small uppercase tracking-[0.02em] text-ink-muted">URL Trust Analyzer</div>
        <h1 className="font-display text-display text-ink-primary">Is this site safe to trust?</h1>
        <p className="mt-1 max-w-2xl text-small text-ink-secondary">
          Paste a link. Drishti inspects its structure, live connection, certificate, domain age, and
          (if configured) threat-intel feeds — then shows a transparent verdict built only from signals
          it could actually evaluate.
        </p>
      </header>

      <form onSubmit={submit} className="mb-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com  or  https://site.com/login"
            aria-label="URL to analyze"
            className="w-full rounded-md border border-edge-subtle bg-bg-surface py-2.5 pl-9 pr-3 font-mono text-small text-ink-primary placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/70"
          />
        </div>
        <Button type="submit" loading={analyze.isPending} disabled={!url.trim()}>
          <Search className="h-4 w-4" /> Analyze
        </Button>
      </form>

      {err && (
        <Card className="mb-6 border-risk-critical/30 p-4">
          <div className="flex items-center gap-2 text-small text-risk-critical">
            <AlertTriangle className="h-4 w-4" />
            {err.message || "Couldn't analyze that URL."}
          </div>
        </Card>
      )}

      {!result && !analyze.isPending && !err && (
        <EmptyState
          title="No analysis yet"
          hint="Enter a URL above to get a trust verdict, the real signals behind it, and website details."
        />
      )}

      {result && <ResultView result={result} />}

      {history.data && history.data.length > 0 && (
        <div className="mt-8">
          <div className="mb-2 text-small uppercase tracking-[0.02em] text-ink-muted">Recent analyses</div>
          <Card className="divide-y divide-edge-subtle">
            {history.data.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="truncate font-mono text-small text-ink-secondary">{h.url}</span>
                <span className={clsx("shrink-0 text-small font-medium", RISK_TEXT[BAND_TOKEN[h.band]])}>
                  {h.band} · {h.score.toFixed(0)}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

function ResultView({ result }: { result: UrlAnalysisResult }) {
  const token = BAND_TOKEN[result.band];
  return (
    <div className="space-y-6">
      {/* Verdict */}
      <Card enter className={clsx("border p-5", BAND_RING[result.band])}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className={clsx("h-6 w-6", RISK_TEXT[token])} />
              <span className={clsx("font-display text-h1", RISK_TEXT[token])}>{result.band}</span>
            </div>
            <div className="mt-1 font-mono text-small text-ink-muted">
              evaluated {result.evaluated_count} signals · {result.website.host}
            </div>
          </div>
          <div className="text-right">
            <div className={clsx("font-display text-display leading-none", RISK_TEXT[token])}>
              {result.score.toFixed(0)}
              <span className="text-h3 text-ink-muted">/100</span>
            </div>
            <div className="text-[11px] uppercase tracking-[0.02em] text-ink-muted">trust score</div>
          </div>
        </div>
      </Card>

      {/* AI summary */}
      {result.ai_summary && (
        <Card className="p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.02em] text-accent-400">
            <Sparkles className="h-3.5 w-3.5" /> Plain-language summary
          </div>
          <p className="text-small leading-relaxed text-ink-secondary">{result.ai_summary}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <WebsitePanel result={result} />
        <ReputationPanel result={result} />
      </div>

      <SignalsPanel signals={result.signals} />

      <p className="text-[11px] text-ink-muted">{result.disclaimer}</p>
    </div>
  );
}

function Row({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-small text-ink-muted">{label}</span>
      <span className={clsx("text-right text-small text-ink-secondary", mono && "font-mono")}>{value}</span>
    </div>
  );
}

function WebsitePanel({ result }: { result: UrlAnalysisResult }) {
  const w = result.website;
  return (
    <Card className="p-4">
      <div className="mb-2 text-small font-medium text-ink-primary">Website details</div>
      <div className="divide-y divide-edge-subtle">
        <Row
          label="Connection"
          value={
            <span className={clsx("inline-flex items-center gap-1", w.https ? "text-risk-safe" : "text-risk-medium")}>
              <Lock className="h-3 w-3" /> {w.scheme.toUpperCase()}
            </span>
          }
        />
        <Row
          label="TLS certificate"
          value={
            w.tls.valid == null
              ? "—"
              : w.tls.valid
                ? `Valid · ${w.tls.issuer ?? "issuer unknown"}`
                : "Invalid / expired"
          }
        />
        {w.tls.expires && <Row label="Certificate expires" value={w.tls.expires} />}
        <Row
          label="Domain age"
          value={w.domain_age_days == null ? "Unknown" : `${w.domain_age_days.toLocaleString()} days`}
        />
        <Row label="Registrar" value={w.registrar ?? "Unknown"} mono={!!w.registrar} />
        <Row label="HTTP status" value={w.http_status ?? "—"} />
        <Row
          label="Final URL"
          value={
            <span className="inline-flex items-center gap-1" title={w.redirects_offsite ? "Redirects off-site" : undefined}>
              {w.redirects_offsite && <Unlink className="h-3 w-3 text-risk-medium" aria-label="Redirects off-site" />}
              <span className="max-w-[220px] truncate">{result.final_url ?? result.url}</span>
            </span>
          }
        />
        {w.redirect_chain.length > 1 && (
          <Row label="Redirects" value={`${w.redirect_chain.length - 1} hop(s)`} />
        )}
      </div>
    </Card>
  );
}

function ReputationPanel({ result }: { result: UrlAnalysisResult }) {
  const { safe_browsing: sb, virustotal: vt } = result.providers;
  return (
    <Card className="p-4">
      <div className="mb-2 text-small font-medium text-ink-primary">Threat-intel reputation</div>
      <div className="space-y-3">
        <ProviderRow
          name="Google Safe Browsing"
          configured={sb.configured}
          state={
            !sb.configured
              ? { kind: "unconfigured" }
              : sb.error
                ? { kind: "error", text: sb.error }
                : sb.verdict === "flagged"
                  ? { kind: "bad", text: `Flagged: ${(sb.threats ?? []).join(", ") || "threat"}` }
                  : { kind: "good", text: "No threats found" }
          }
        />
        <ProviderRow
          name="VirusTotal"
          configured={vt.configured}
          state={
            !vt.configured
              ? { kind: "unconfigured" }
              : vt.error
                ? { kind: "error", text: vt.error }
                : (vt.malicious ?? 0) > 0
                  ? { kind: "bad", text: `${vt.malicious} vendors flag malicious` }
                  : (vt.suspicious ?? 0) > 0
                    ? { kind: "warn", text: `${vt.suspicious} vendors suspicious` }
                    : { kind: "good", text: `Clean (${vt.harmless ?? 0} harmless)` }
          }
        />
      </div>
    </Card>
  );
}

type ProviderState =
  | { kind: "unconfigured" }
  | { kind: "good"; text: string }
  | { kind: "warn"; text: string }
  | { kind: "bad"; text: string }
  | { kind: "error"; text: string };

function ProviderRow({ name, state }: { name: string; configured: boolean; state: ProviderState }) {
  const tint =
    state.kind === "good"
      ? "text-risk-safe"
      : state.kind === "warn"
        ? "text-risk-medium"
        : state.kind === "bad"
          ? "text-risk-critical"
          : "text-ink-muted";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-small text-ink-secondary">{name}</span>
      {state.kind === "unconfigured" ? (
        <span className="rounded-sm border border-dashed border-edge-subtle px-2 py-0.5 text-[11px] text-ink-muted">
          Not configured — add a key to enable
        </span>
      ) : (
        <span className={clsx("text-small font-medium", tint)}>{state.text}</span>
      )}
    </div>
  );
}

function SignalsPanel({ signals }: { signals: UrlSignal[] }) {
  const counted = signals.filter((s) => s.counted).length;
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-small font-medium text-ink-primary">Signals</div>
        <div className="text-[11px] text-ink-muted">
          {counted} of {signals.length} counted toward the score
        </div>
      </div>
      <ul className="space-y-1.5">
        {signals.map((s) => {
          const ui = STATUS_UI[s.status];
          const Icon = ui.icon;
          return (
            <li
              key={s.key}
              className={clsx(
                "flex items-start gap-2.5 rounded-sm px-2 py-1.5",
                ui.counted ? "bg-bg-raised/30" : "border border-dashed border-edge-subtle opacity-70",
              )}
            >
              <Icon className={clsx("mt-0.5 h-4 w-4 shrink-0", ui.tint)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-small text-ink-primary">{s.label}</span>
                  <span className={clsx("text-[10px] uppercase tracking-[0.02em]", ui.tint)}>{ui.label}</span>
                  {!ui.counted && (
                    <span className="text-[10px] text-ink-muted">· not counted</span>
                  )}
                </div>
                <div className="text-[12px] text-ink-muted">{s.detail}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
