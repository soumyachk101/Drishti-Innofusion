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
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client";
import type { Finding, Remediation } from "../../api/types";
import { Button } from "../../components/Button";
import { SeverityBadge } from "../../components/SeverityBadge";
import { Card, ErrorState, LoadingBlock } from "../../components/primitives";
import { useToast } from "../../store/graphStore";

const KINDS: { key: string; label: string; icon: typeof Terminal; desc: string }[] = [
  { key: "ansible", label: "Ansible Playbook", icon: Layers, desc: "Automated multi-node YAML playbook" },
  { key: "shell", label: "Shell Hardening", icon: Terminal, desc: "Direct Bash script with rollback logic" },
  { key: "cloud_cli", label: "Cloud Security Group", icon: Server, desc: "AWS CLI / VPC ingress firewall rule" },
];

export function RemediationConsole() {
  const { findingId } = useParams<{ findingId: string }>();
  const qc = useQueryClient();
  const toast = useToast();
  const [kind, setKind] = useState("shell");

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

  if (findingQ.isLoading) return <div className="p-10"><LoadingBlock label="Loading finding intelligence…" /></div>;
  if (findingQ.isError || !findingQ.data)
    return (
      <div className="p-10">
        <ErrorState message="Finding not found." onRetry={() => findingQ.refetch()} />
      </div>
    );
  const f = findingQ.data;
  const remediation = gen.data;

  return (
    <div className="w-full px-6 py-6 lg:px-10 space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/app/findings"
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 py-1.5 text-xs font-bold text-ink-primary hover:bg-black/5 hover:border-black/20 transition-all shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Findings Intelligence
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NVIDIA / GROQ DEFENSIVE ENGINE: ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Studio Title & Target Overview Strip */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-accent-500 mb-1">
              <Zap className="h-3.5 w-3.5" /> Context-Aware Automated Fix Engine
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-ink-primary tracking-tight">
              Remediation &amp; Defense Studio
            </h1>
            <p className="mt-1 text-xs text-ink-muted">
              Synthesizing production-grade defensive playbooks grounded strictly in real host telemetry. Zero hallucinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              loading={gen.isPending}
              onClick={() => gen.mutate(!!remediation)}
              className="bg-accent-500 text-white font-bold hover:bg-accent-600 shadow-sm text-sm px-5 py-2.5"
            >
              {remediation ? <RotateCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {remediation ? "Regenerate Patch" : "Synthesize Defensive Fix"}
            </Button>
          </div>
        </div>
      </div>

      {/* Full Width 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr_360px]">
        {/* Left Column: Finding Context & Attack Chain */}
        <FindingContext finding={f} />

        {/* Center Column: Interactive Patch Studio & Terminal */}
        <div className="space-y-5">
          {/* Format Selection Tabs with High-Tech Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {KINDS.map((k) => {
              const Icon = k.icon;
              const active = kind === k.key;
              return (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className={`flex flex-col items-start justify-between rounded-xl border p-3.5 text-left transition-all ${
                    active
                      ? "border-accent-500 bg-accent-500/[0.06] shadow-xs ring-2 ring-accent-500/20"
                      : "border-black/10 bg-white hover:bg-black/[0.02] hover:border-black/20"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${active ? "bg-accent-500 text-white" : "bg-black/5 text-ink-muted"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className={active ? "text-accent-600 font-extrabold" : "text-ink-primary"}>{k.label}</span>
                  </div>
                  <span className="mt-2 text-[11px] text-ink-muted leading-tight">{k.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Generating Loading State */}
          {gen.isPending && (
            <Card className="p-12 border border-accent-500/25 bg-white text-center shadow-xs">
              <LoadingBlock label="Synthesizing zero-exploit defensive patch with Llama 3.3 70B…" />
            </Card>
          )}

          {/* Refusal Card if AI guardrails reject non-defensive action */}
          {remediation?.refused && (
            <Card className="flex items-start gap-3 p-5 border border-amber-500/30 bg-amber-500/5 shadow-xs">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="text-xs leading-relaxed text-ink-secondary">
                <div className="font-bold text-amber-600 mb-0.5">Defensive Guardrail Enforced</div>
                Drishti generates defensive containment fixes only.
                {remediation.reason && (
                  <span className="block text-ink-muted mt-1">{remediation.reason}</span>
                )}
              </div>
            </Card>
          )}

          {/* Generated Result View */}
          {remediation && !remediation.refused && (
            <TerminalCenterView remediation={remediation} />
          )}

          {/* Empty Initial State */}
          {!remediation && !gen.isPending && (
            <Card className="p-12 border border-black/10 bg-white text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-ink-primary text-lg">Ready to Generate Patch</h3>
              <p className="mx-auto mt-2 max-w-lg text-xs text-ink-muted leading-relaxed">
                Click below to synthesize a verified, production-grade <b>{KINDS.find((k) => k.key === kind)?.label}</b> tailored to isolate and remediate this exposure.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => gen.mutate(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-white hover:bg-accent-600 transition-all shadow-sm"
                >
                  <Sparkles className="h-4 w-4" /> Synthesize {KINDS.find((k) => k.key === kind)?.label}
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Execution Runbook & Actions */}
        <ExecutionSidebar
          remediation={remediation}
          onResolve={() => setStatus.mutate("resolved")}
          onRemediating={() => setStatus.mutate("remediating")}
          resolving={setStatus.isPending}
        />
      </div>
    </div>
  );
}

function FindingContext({ finding: f }: { finding: Finding }) {
  return (
    <div className="space-y-4">
      <Card className="p-5 border border-black/10 bg-white shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
            Target Finding Specification
          </span>
          <h3 className="mt-1.5 text-sm font-bold leading-snug text-ink-primary">
            {f.title}
          </h3>
          <div className="mt-2.5 flex items-center gap-2">
            <SeverityBadge severity={f.severity} score={f.cvss} />
            <span className="font-mono text-xs font-bold text-ink-secondary">CVSS {f.cvss}</span>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-b border-black/10 py-3.5">
          <DefRow label="CVE Identifier" value={f.cve_id ?? "N/A (Architecture / ACL Flaw)"} mono />
          <DefRow label="Target Host" value={f.asset_hostname ?? f.asset_ip} mono />
          <DefRow label="Host IP Address" value={f.asset_ip} mono />
          <DefRow label="Exposed Port" value={f.service_port ? String(f.service_port) : "All Ingress / Egress Ports"} mono />
          <DefRow label="Finding Status" value={f.status.toUpperCase()} mono />
        </div>

        {f.description && (
          <div className="rounded-xl bg-black/[0.02] p-3.5 text-xs leading-relaxed text-ink-secondary border-l-3 border-accent-500 space-y-1">
            <span className="block font-bold text-[10px] uppercase tracking-wider text-ink-muted">
              Exposure Vector &amp; Threat Chain
            </span>
            <p>{f.description}</p>
          </div>
        )}
      </Card>

      {/* Defense Guardrails Card */}
      <Card className="p-4 border border-emerald-500/20 bg-emerald-500/[0.04] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          <span>Output Safety Guardrails</span>
        </div>
        <p className="text-[11px] text-emerald-900/70 leading-relaxed">
          Zero offensive exploit markers permitted. Playbooks strictly enforce non-destructive containment and reversible configurations.
        </p>
      </Card>
    </div>
  );
}

function DefRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-ink-muted font-medium">{label}</span>
      <span className={`font-semibold ${mono ? "font-mono text-ink-primary" : "text-ink-primary"}`}>
        {value}
      </span>
    </div>
  );
}

function TerminalCenterView({ remediation }: { remediation: Remediation }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(remediation.script);
      setCopied(true);
      toast.show("Playbook copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.show("Failed to copy code", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Executive Summary Card */}
      <Card className="p-5 border border-black/10 bg-white shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-accent-500 mb-1">
              Synthesized Strategy
            </span>
            <h2 className="font-display text-base lg:text-lg font-bold text-ink-primary">{remediation.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">{remediation.summary}</p>
            {remediation.model && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[11px] font-mono text-ink-muted">
                <Cpu className="h-3 w-3 text-accent-500" />
                Verified Model: <span className="font-bold text-ink-primary">{remediation.model}</span>
              </div>
            )}
          </div>
          {remediation.estimated_risk_reduction != null && (
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-center min-w-[120px]">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                Risk Reduction
              </div>
              <div className="text-xl font-mono font-extrabold text-emerald-600 mt-0.5">
                -{remediation.estimated_risk_reduction}%
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Terminal Code Window */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d100d] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#161a16] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="font-mono text-xs font-bold text-accent-400">
              {remediation.kind === "ansible" ? "remediate_exposure.yml" : remediation.kind === "shell" ? "harden_host.sh" : "cloud_policy.sh"}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1 text-xs font-mono font-bold text-white hover:bg-white/20 transition-colors"
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

        <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-[#f2efe7] selection:bg-accent-500 selection:text-white max-h-[460px]">
          {remediation.script}
        </pre>
      </div>

      {/* Proof of Grounding Accordion */}
      {remediation.context && <AIInputInspector context={remediation.context} />}
    </div>
  );
}

function ExecutionSidebar({
  remediation,
  onResolve,
  onRemediating,
  resolving,
}: {
  remediation?: Remediation | null;
  onResolve: () => void;
  onRemediating: () => void;
  resolving: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Execution Runbook */}
      <Card className="p-5 border border-black/10 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 pb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
            Execution Runbook
          </span>
          <span className="rounded bg-black/5 px-2 py-0.5 text-[10px] font-mono font-bold text-ink-muted">
            {remediation?.steps?.length || 0} Steps
          </span>
        </div>

        {remediation?.steps && remediation.steps.length > 0 ? (
          <div className="space-y-2.5">
            {remediation.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-black/[0.02] p-3 text-xs text-ink-secondary border border-black/5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-500/10 font-mono text-[10px] font-bold text-accent-600">
                  0{i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-ink-muted">
            Synthesize a fix to generate automated step-by-step validation guidance.
          </div>
        )}

        {remediation?.requires_restart && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Requires a daemon/service restart</span>
          </div>
        )}
      </Card>

      {/* Status Transition Action Card */}
      <Card className="p-5 border border-black/10 bg-white shadow-xs space-y-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted block">
          Workflow Status Actions
        </span>

        <Button
          loading={resolving}
          onClick={onResolve}
          className="w-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm py-2.5 justify-center"
        >
          <CheckCircle2 className="h-4 w-4" /> Mark Finding Resolved
        </Button>

        <Button
          variant="ghost"
          onClick={onRemediating}
          className="w-full border border-black/10 bg-white font-semibold text-ink-primary hover:bg-black/5 py-2.5 justify-center"
        >
          Mark in Remediating State
        </Button>
      </Card>
    </div>
  );
}

function AIInputInspector({ context }: { context: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-0 overflow-hidden border border-black/10 bg-white shadow-xs">
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
        <pre className="max-h-72 overflow-auto border-t border-black/10 bg-[#0d100d] p-4 font-mono text-[11px] leading-relaxed text-emerald-400">
          {JSON.stringify(context, null, 2)}
        </pre>
      )}
    </Card>
  );
}


