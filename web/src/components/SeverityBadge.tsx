// Drishti v0.1 — vulnerability severity badge | 11-Jul-2026
import clsx from "clsx";
import { RISK_TEXT, cvss, severityBucket, severityLabel } from "../lib/format";

export function SeverityBadge({
  severity,
  score,
}: {
  severity: string;
  score?: number | null;
}) {
  const bucket = severityBucket(severity);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-sm border border-edge-subtle bg-bg-inset px-2 py-0.5 text-small",
        RISK_TEXT[bucket],
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="font-medium">{severityLabel(severity)}</span>
      {score != null && <span className="font-mono text-ink-muted">{cvss(score)}</span>}
    </span>
  );
}
