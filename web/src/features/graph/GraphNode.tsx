// Drishti v0.1 — custom React Flow graph node | 11-Jul-2026
import clsx from "clsx";
import {
  Database,
  Globe,
  HardDrive,
  Laptop,
  Monitor,
  Router,
  Server,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Cpu,
} from "lucide-react";
import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { GraphNodeData } from "../../api/types";
import { RISK_HEX, money, riskBucket } from "../../lib/format";

const ICONS: Record<string, typeof Server> = {
  database: Database,
  webapp: Globe,
  server: Server,
  workstation: Monitor,
  firewall: ShieldCheck,
  router: Router,
  iot: Cpu,
  cloud: HardDrive,
};

const SEV_HEX: Record<string, string> = {
  critical: RISK_HEX.critical,
  high: RISK_HEX.high,
  medium: RISK_HEX.medium,
  low: RISK_HEX.safe,
};

const THREAT_LABEL: Record<string, string> = {
  arp_spoof: "ARP SPOOF",
  rogue_device: "ROGUE",
  risky_service: "EXPOSED",
  malicious_domain: "C2",
};

export interface RfNodeData extends GraphNodeData {
  selected: boolean;
  inBlast: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
  nodeId: string;
}

function ThreatBadge({ data }: { data: RfNodeData }) {
  if (!data.threat) return null;
  const hex = SEV_HEX[data.threat_severity ?? "medium"] ?? RISK_HEX.medium;
  return (
    <span
      title={`${data.threat_title ?? ""}${data.mitre ? " · " + data.mitre : ""}`}
      className="absolute -right-1 -top-2 z-10 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide"
      style={{ background: hex, color: "#0b0e13" }}
    >
      {THREAT_LABEL[data.threat_kind ?? ""] ?? "THREAT"}
    </span>
  );
}

export const GraphNode = memo(function GraphNode({ data }: { data: RfNodeData }) {
  if (data.asset_type === "cloud" && data.label === "INTERNET") {
    return <InternetNode data={data} />;
  }
  if (data.is_device) return <DeviceNode data={data} />;

  const Icon = ICONS[data.asset_type] ?? Server;
  const hex = data.threat ? SEV_HEX[data.threat_severity ?? "medium"] : RISK_HEX[riskBucket(data.risk_score)];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => data.onSelect(data.nodeId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          data.onSelect(data.nodeId);
        }
      }}
      className={clsx(
        "relative w-[168px] cursor-pointer rounded-node border bg-surface-2 px-3 py-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        data.selected && "ring-2 ring-accent-500 shadow-accent-glow",
        data.threat && "animate-pulse border-risk-critical shadow-accent-glow",
        data.inBlast && !data.selected && "animate-blast-pulse border-risk-critical",
        data.dimmed ? "opacity-[0.35]" : "opacity-100",
        !data.threat && !data.inBlast && !data.selected && data.open_findings === 0 && "border-hairline",
        !data.threat && !data.inBlast && !data.selected && data.open_findings > 0 && "animate-pulse border-risk-critical shadow-accent-glow",
      )}
      style={{
        borderLeft: `3px solid ${data.inBlast && !data.selected ? RISK_HEX.critical : hex}`,
      }}
    >
      <ThreatBadge data={data} />
      <Handle type="target" position={Position.Left} className="!bg-edge-strong !border-0" />
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" style={{ color: hex }} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-body text-small font-medium text-ink">
            {data.label}
          </div>
        </div>
        {data.is_crown_jewel && (
          <span
            title="Crown jewel"
            className="h-2 w-2 shrink-0 rounded-full ring-2 ring-risk-critical"
            style={{ background: RISK_HEX.critical }}
          />
        )}
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-ink-muted">
        <span>{money(data.business_value)}</span>
        <span className="flex items-center gap-2">
          {data.open_findings > 0 && (
            <span className="inline-flex items-center gap-1 text-risk-high">
              <span className="h-1.5 w-1.5 rounded-full bg-risk-high" />
              {data.open_findings}
            </span>
          )}
          <span style={{ color: hex }}>{data.risk_score.toFixed(0)}</span>
        </span>
      </div>
      {data.internet_facing && (
        <span className="absolute -right-1 -top-1 rounded-full bg-accent-500 px-1 text-[9px] font-medium text-bg-inset">
          exposed
        </span>
      )}
      <Handle type="source" position={Position.Right} className="!bg-edge-strong !border-0" />
    </div>
  );
});

function DeviceNode({ data }: { data: RfNodeData }) {
  const Icon = data.is_gateway ? Router : data.asset_type === "workstation" ? Laptop : Smartphone;
  const threatHex = data.threat ? SEV_HEX[data.threat_severity ?? "medium"] : null;
  const border = threatHex ?? (data.is_gateway ? RISK_HEX.medium : "#5b6b86");
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => data.onSelect(data.nodeId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          data.onSelect(data.nodeId);
        }
      }}
      className={clsx(
        "relative w-[152px] cursor-pointer rounded-node border bg-surface-2 px-2.5 py-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        data.selected && "ring-2 ring-accent-500",
        data.threat && "animate-pulse shadow-accent-glow",
        data.dimmed ? "opacity-[0.35]" : "opacity-100",
      )}
      style={{ borderColor: border, borderLeft: `3px solid ${border}` }}
    >
      <ThreatBadge data={data} />
      <Handle type="target" position={Position.Left} className="!bg-edge-strong !border-0" />
      <div className="flex items-center gap-2">
        {data.threat ? (
          <ShieldAlert className="h-4 w-4 shrink-0" style={{ color: border }} />
        ) : (
          <Icon className="h-4 w-4 shrink-0" style={{ color: border }} />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[11px] font-medium text-ink">{data.label}</div>
        </div>
        <span
          className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", data.online ? "bg-risk-safe" : "bg-ink-muted")}
          title={data.online ? "online" : "offline"}
        />
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-ink-muted">
        <span>{data.is_gateway ? "gateway" : "device"}</span>
        {data.mac && <span className="truncate">{data.mac.slice(0, 8)}…</span>}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-edge-strong !border-0" />
    </div>
  );
}

function InternetNode({ data }: { data: RfNodeData }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-full border border-accent-500/50 bg-accent-500/15 px-3 py-2 transition-opacity",
        data.dimmed ? "opacity-40" : "opacity-100",
      )}
    >
      <Globe className="h-4 w-4 text-accent-500" />
      <span className="font-mono text-small font-medium text-accent-400">INTERNET</span>
      <Handle type="source" position={Position.Right} className="!bg-accent-500 !border-0" />
    </div>
  );
}
