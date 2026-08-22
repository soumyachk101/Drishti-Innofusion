// Drishti v0.1 — shared layout and card primitives | 11-Jul-2026
import clsx from "clsx";
import { AlertTriangle, ChevronDown, Inbox, Loader2, RotateCw } from "lucide-react";
import type { ReactNode, SelectHTMLAttributes } from "react";

export function Card({
  children,
  className,
  enter = false,
}: {
  children: ReactNode;
  className?: string;
  /** opt-in fade/slide-up on mount (CSS, reduced-motion aware) */
  enter?: boolean;
}) {
  return (
    <div
      className={clsx(
        "relative rounded-xl border border-edge-strong bg-bg-surface/50 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-edge-strong/80 hover:bg-bg-surface/70 hover:shadow-accent-glow/10",
        enter && "animate-card-enter",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Styled `<select>` — native semantics (a11y, mobile keyboards) with a
 * custom chevron so it matches the dark theme instead of the OS default. */
export function Select({
  uiSize = "md",
  className,
  ...select
}: { uiSize?: "sm" | "md" } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-flex">
      <select
        {...select}
        className={clsx(
          "appearance-none rounded-md border border-edge-subtle bg-bg-surface outline-none transition-colors hover:border-edge-strong focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/40",
          uiSize === "sm"
            ? "py-1 pl-2.5 pr-7 font-mono text-[11px]"
            : "py-1.5 pl-3 pr-8 text-small",
          className ?? "text-ink-secondary",
        )}
      />
      <ChevronDown
        aria-hidden
        className={clsx(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-muted",
          uiSize === "sm" ? "right-2 h-3 w-3" : "right-2.5 h-3.5 w-3.5",
        )}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx("animate-shimmer rounded-sm bg-bg-raised/60", className)}
      aria-hidden
    />
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 p-6 text-ink-muted">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-small">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-edge-subtle bg-bg-surface p-10 text-center">
      <Inbox className="h-8 w-8 text-ink-muted" />
      <div className="font-display text-h3 text-ink-primary">{title}</div>
      {hint && <p className="max-w-sm text-small text-ink-muted">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-risk-critical/30 bg-bg-surface p-8 text-center">
      <AlertTriangle className="h-7 w-7 text-risk-critical" />
      <p className="max-w-sm text-small text-ink-secondary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-sm border border-edge-subtle px-3 py-1.5 text-small text-ink-secondary hover:bg-bg-raised hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/70"
        >
          <RotateCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
