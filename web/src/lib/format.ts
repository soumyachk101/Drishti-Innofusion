// Drishti v0.1 — formatters and risk-color mapping | 11-Jul-2026
/** Formatters + risk→color mapping (UIUX.md §2, TESTING.md §4). Null-safe. */

export type RiskToken = "safe" | "medium" | "high" | "critical";

/** Map a 0..100 risk score (or severity) to a ramp bucket (UIUX.md §2 thresholds). */
export function riskBucket(score: number | null | undefined): RiskToken {
  if (score == null || Number.isNaN(score)) return "safe";
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "safe";
}

export function severityBucket(severity: string | null | undefined): RiskToken {
  switch ((severity ?? "").toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "safe";
  }
}

/** Tailwind text/border/bg class fragments per ramp token. */
export const RISK_TEXT: Record<RiskToken, string> = {
  safe: "text-risk-safe",
  medium: "text-risk-medium",
  high: "text-risk-high",
  critical: "text-risk-critical",
};
export const RISK_BG: Record<RiskToken, string> = {
  safe: "bg-risk-safe",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
  critical: "bg-risk-critical",
};
// Must mirror tailwind.config.js `risk.*` tokens exactly — SVG/canvas (React Flow)
// can't use Tailwind classes, so these hexes are the same PostHog/Sanity ramp.
// SOC Blue — classic severity ramp: green / amber / orange / red (matches risk.* in tailwind.config.js).
export const RISK_HEX: Record<RiskToken, string> = {
  safe: "#2ec27e", // contained
  medium: "#f59e42",
  high: "#f0663c",
  critical: "#ef4655", // hottest
};

/** Compact money: 3_500_000 -> "$3.5M". Null-safe → "—". */
export function money(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

/** Full money with separators for tooltips: "$2,400,000". */
export function moneyFull(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function riskScore(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function cvss(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function percent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

export function severityLabel(severity: string): string {
  return severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : "—";
}
