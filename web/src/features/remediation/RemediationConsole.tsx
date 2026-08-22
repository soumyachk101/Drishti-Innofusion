// Drishti v0.1 — AI-powered remediation console | 11-Jul-2026
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Info,
  RotateCw,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Server,
  Layers,
  FileCode,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import type { Finding, Remediation } from "../../api/types";
import { Button } from "../../components/Button";
import { SeverityBadge } from "../../components/SeverityBadge";
import { Card, ErrorState, LoadingBlock } from "../../components/primitives";
import { useToast } from "../../store/graphStore";

const KINDS: { key: string; label: string; icon: typeof Terminal }[] = [
  { key: "ansible", label: "Ansible Playbook", icon: Layers },
  { key: "shell", label: "Shell Hardening", icon: Terminal },
  { key: "cloud_cli", label: "Cloud Security Group", icon: Server },
];

export function RemediationConsole() {
  const { findingId } = useParams<{ findingId: string }>();
  const qc = useQueryClient();
  const toast = useToast();
  const [kind, setKind] = useState("ansible");

  // load the finding context via the findings list (filtered client-side)
  const findingQ = useQuery({
    queryKey: ["finding", findingId],
    queryFn: async () => {
      const all = await api.findings();
      return all.find((f) => f.id === findingId) ?? null;
    },
  });

  const gen = useMutation({
    mutationFn: (regenerate: boolean) => api.remediate(findingId!, kind, regenerate),
    onError: () => toast.show("Fix generation failed — please retry", "error"),
    onSuccess: (r) => {
      if (!r.refused) toast.show("Defensive fix generated successfully", "success");
    },
  });

  const setStatus = useMutation({
    mutationFn: (status: string) => api.patchFinding(findingId!, status),
    onSuccess: (_d, status) => {
      qc.invalidateQueries();
      toast.show(status === "resolved" ? "Finding marked as resolved" : "Finding marked as remediating", "success");
    },
    onError: () => toast.show("Couldn't update finding status", "error"),
  });

  if (findingQ.isLoading) return <div className="p-8"><LoadingBlock label="Loading finding intelligence…" /></div>;
  if (findingQ.isError || !findingQ.data)
    return (
      <div className="p-8">
        <ErrorState message="Finding not found." onRetry={() => findingQ.refetch()} />
      </div>
    );
  const f = findingQ.data;
  const remediation = gen.data;

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      {/* Top Breadcrumb & Navigation */}
      <Link
        to="/app/findings"
        className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/60 px-3 py-1 text-xs font-semibold text-ink-muted hover:text-ink-primary hover:bg-white transition-all shadow-xs"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Findings List
      </Link>

      {/* Header */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent-500">
            AI-Powered Patch Synthesis
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-ink-primary tracking-tight">
            Defensive Remediation Studio
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LLM Guardrails: ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Column: Finding Context */}
        <FindingContext finding={f} />

        {/* Right Column: Interactive Synthesis Studio */}
        <div className="space-y-5">
          {/* Format Selection Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-white p-2 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {KINDS.map((k) => {
                const Icon = k.icon;
                const active = kind === k.key;
                return (
                  <button
                    key={k.key}
                    onClick={() => setKind(k.key)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? "bg-accent-500 text-white shadow-sm"
                        : "text-ink-muted hover:bg-black/5 hover:text-ink-primary"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {k.label}
                  </button>
                );
              })}
            </div>

            <Button
              loading={gen.isPending}
              onClick={() => gen.mutate(!!remediation)}
              className="bg-accent-500 text-white font-bold hover:bg-accent-600 shadow-sm"
            >
              {remediation ? <RotateCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {remediation ? "Regenerate Patch" : "Synthesize Fix"}
            </Button>
          </div>

          {/* Generating Loading State */}
          {gen.isPending && (
            <Card className="p-10 border border-accent-500/20 bg-white/80 text-center shadow-sm">
              <LoadingBlock label="Synthesizing contextual defensive playbook with Llama 3.3 70B…" />
            </Card>
          )}

          {/* Refusal Card if AI guardrails reject non-defensive action */}
          {remediation?.refused && (
            <Card className="flex items-start gap-3 p-5 border border-amber-500/30 bg-amber-500/5 shadow-xs">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="text-xs leading-relaxed text-ink-secondary">
                <div className="font-bold text-amber-600 mb-0.5">Defensive Guardrail Triggered</div>
                Drishti generates defensive containment fixes only.
                {remediation.reason && (
                  <span className="block text-ink-muted mt-1">{remediation.reason}</span>
                )}
              </div>
            </Card>
          )}

          {/* Generated Result View */}
          {remediation && !remediation.refused && (
            <ResultView
              remediation={remediation}
              onResolve={() => setStatus.mutate("resolved")}
              onRemediating={() => setStatus.mutate("remediating")}
              resolving={setStatus.isPending}
            />
          )}

          {/* Empty Initial State */}
          {!remediation && !gen.isPending && (
            <Card className="p-10 border border-black/5 bg-white text-center shadow-xs">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-accent-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-ink-primary text-base">Ready to Generate Patch</h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted leading-relaxed">
                Select your preferred deployment target format above and click <b>Synthesize Fix</b> to generate verified, zero-exploit remediation code for this host.
              </p>
              <div className="mt-5">
                <button
                  onClick={() => gen.mutate(false)}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-xs font-bold text-white hover:bg-accent-600 transition-colors shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Synthesize {KINDS.find((k) => k.key === kind)?.label}
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function FindingContext({ finding: f }: { finding: Finding }) {
  return (
    <Card className="h-fit p-5 border border-black/5 bg-white shadow-xs space-y-4">
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
          Target Finding
        </span>
        <h3 className="mt-1 text-sm font-bold leading-snug text-ink-primary">
          {f.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <SeverityBadge severity={f.severity} score={f.cvss} />
          <span className="font-mono text-xs font-bold text-ink-secondary">CVSS {f.cvss}</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-b border-black/5 py-3">
        <DefRow label="CVE Identifier" value={f.cve_id ?? "N/A (Configuration Flaw)"} mono />
        <DefRow label="Target Asset" value={f.asset_hostname ?? f.asset_ip} mono />
        <DefRow label="Host IP" value={f.asset_ip} mono />
        <DefRow label="Service Port" value={f.service_port ? String(f.service_port) : "All Ports"} mono />
        <DefRow label="Current Status" value={f.status.toUpperCase()} mono />
      </div>

      {f.description && (
        <div className="rounded-lg bg-black/[0.02] p-3 text-xs leading-relaxed text-ink-secondary border-l-2 border-accent-500">
          <span className="block font-bold text-[10px] uppercase tracking-wider text-ink-muted mb-1">
            Impact Analysis
          </span>
          {f.description}
        </div>
      )}
    </Card>
  );
}

function DefRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-ink-muted">{label}</span>
      <span className={`font-semibold ${mono ? "font-mono text-ink-primary" : "text-ink-primary"}`}>
        {value}
      </span>
    </div>
  );
}

function ResultView({
  remediation,
  onResolve,
  onRemediating,
  resolving,
}: {
  remediation: Remediation;
  onResolve: () => void;
  onRemediating: () => void;
  resolving: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(remediation.script);
      setCopied(true);
      toast.show("Code copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.show("Failed to copy", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Executive Summary Card */}
      <Card className="p-5 border border-black/5 bg-white shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-accent-500 mb-1">
              Synthesized Remediation
            </span>
            <h2 className="font-display text-lg font-bold text-ink-primary">{remediation.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{remediation.summary}</p>
            {remediation.model && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-black/[0.02] px-2.5 py-0.5 text-[11px] font-mono text-ink-muted">
                <Cpu className="h-3 w-3 text-accent-500" />
                Verified Model: <span className="font-bold text-ink-primary">{remediation.model}</span>
              </div>
            )}
          </div>
          {remediation.estimated_risk_reduction != null && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-right">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">
                Risk Reduction
              </div>
              <div className="text-lg font-mono font-extrabold text-emerald-600">
                -{remediation.estimated_risk_reduction}%
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Terminal Code Window */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d100d] shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#161a16] px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-xs font-bold text-accent-400">
              {remediation.kind === "ansible" ? "remediate_cve.yml" : remediation.kind === "shell" ? "harden_host.sh" : "cloud_policy.sh"}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1 text-xs font-mono font-bold text-white hover:bg-white/20 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-[#f2efe7] selection:bg-accent-500 selection:text-white">
          {remediation.script}
        </pre>
      </div>

      {/* Action Steps Runbook */}
      {remediation.steps && remediation.steps.length > 0 && (
        <Card className="p-5 border border-black/5 bg-white shadow-xs">
          <div className="mb-3 text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
            Execution Steps &amp; Validation Runbook
          </div>
          <div className="space-y-2">
            {remediation.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-black/[0.02] p-2.5 text-xs text-ink-secondary">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-500/10 font-mono text-[10px] font-bold text-accent-500">
                  0{i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
          {remediation.requires_restart && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" /> Requires a service/daemon restart after applying
            </div>
          )}
        </Card>
      )}

      {/* Proof of Grounding Accordion */}
      {remediation.context && <AIInputInspector context={remediation.context} />}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap gap-2">
          <Button
            loading={resolving}
            onClick={onResolve}
            className="bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4" /> Mark as Resolved
          </Button>
          <Button
            variant="ghost"
            onClick={onRemediating}
            className="border border-black/10 bg-white font-semibold text-ink-primary hover:bg-black/5"
          >
            Mark Remediating
          </Button>
        </div>

        <div className="text-[11px] font-mono text-ink-muted">
          Drishti Defensive Engine v1.0
        </div>
      </div>
    </div>
  );
}

function AIInputInspector({ context }: { context: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-0 overflow-hidden border border-black/5 bg-white shadow-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-ink-secondary hover:bg-black/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight className={`h-4 w-4 text-ink-muted transition-transform ${open ? "rotate-90" : ""}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Grounding Audit
          </span>
          <span className="text-ink-muted">— Exact telemetry payload passed to LLM</span>
        </div>
        <FileCode className="h-3.5 w-3.5 text-ink-muted" />
      </button>
      {open && (
        <pre className="max-h-72 overflow-auto border-t border-black/5 bg-[#0d100d] p-4 font-mono text-[11px] leading-relaxed text-emerald-400">
          {JSON.stringify(context, null, 2)}
        </pre>
      )}
    </Card>
  );
}

