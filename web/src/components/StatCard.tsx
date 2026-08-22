// Drishti v0.1 — dashboard stat card component | 11-Jul-2026
import clsx from "clsx";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  accent = false,
  children,
}: {
  label: string;
  value?: ReactNode;
  hint?: string;
  accent?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-md border bg-bg-surface/40 p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1",
        accent
          ? "border-risk-critical/30 hover:border-risk-critical/80 hover:bg-risk-critical/10 hover:shadow-[0_0_40px_-10px_rgba(239,70,85,0.4)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          : "border-edge-subtle/50 hover:border-accent-500/50 hover:bg-accent-500/5 hover:shadow-[0_0_40px_-10px_rgba(255,94,36,0.2)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
      )}
    >
      {/* top accent rule — full on the critical card, hairline elsewhere */}
      <span
        aria-hidden
        className={clsx(
          "absolute inset-x-0 top-0 h-px transition-colors duration-300",
          accent
            ? "bg-gradient-to-r from-transparent via-risk-critical to-transparent shadow-[0_1px_12px_rgba(239,70,85,0.9)]"
            : "bg-edge-subtle/50 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-accent-500/80 group-hover:to-transparent group-hover:shadow-[0_1px_10px_rgba(255,94,36,0.5)]",
        )}
      />
      {/* HUD corner bracket, top-right */}
      <span
        aria-hidden
        className={clsx(
          "absolute right-2.5 top-2.5 h-3 w-3 border-r-2 border-t-2 transition-colors",
          accent ? "border-risk-critical/60" : "border-edge-strong group-hover:border-accent-500/70",
        )}
      />
      <div className="relative z-10 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">{label}</div>
      <div className="mt-2 font-mono text-h1 font-medium leading-none text-ink-primary tabular-nums">
        {children ?? value}
      </div>
      {hint && <div className="mt-1.5 text-small text-ink-muted">{hint}</div>}
    </div>
  );
}

/** Slim inline stat — for list-page header strips (Findings/Assets/Paths)
 * where a full StatCard would out-weigh a one-line table. */
export function MiniStat({
  label,
  value,
  toneClass,
}: {
  label: string;
  value: ReactNode;
  toneClass?: string;
}) {
  return (
    <div className="rounded-md border border-edge-subtle bg-bg-surface px-3.5 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">{label}</div>
      <div className={clsx("mt-0.5 font-mono text-h3 leading-none", toneClass ?? "text-ink-primary")}>
        {value}
      </div>
    </div>
  );
}
