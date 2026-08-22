// Drishti v0.1 — blast radius color legend | 11-Jul-2026
import { RISK_HEX } from "../../lib/format";

const ITEMS = [
  { hex: RISK_HEX.safe, label: "Low" },
  { hex: RISK_HEX.medium, label: "Medium" },
  { hex: RISK_HEX.high, label: "High" },
  { hex: RISK_HEX.critical, label: "Critical / blast radius" },
];

export function BlastLegend() {
  return (
    <div className="rounded-md border border-edge-subtle bg-bg-surface/90 p-2.5 backdrop-blur">
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.02em] text-ink-muted">
        Risk temperature
      </div>
      <div className="space-y-1">
        {ITEMS.map((i) => (
          <div key={i.label} className="flex items-center gap-2 text-[11px] text-ink-secondary">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.hex }} />
            {i.label}
          </div>
        ))}
      </div>
    </div>
  );
}
