import { cx } from "@/lib/cx";

/** `showLabel={false}` when the caller prints the percentage elsewhere. */
export function ProgressBar({
  value,
  showLabel = true,
  className,
}: {
  value: number;
  showLabel?: boolean;
  className?: string;
}) {
  const pct = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <div className={cx("flex items-center gap-4", className)}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Course progress"
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100"
      >
        <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-small whitespace-nowrap text-neutral-700">{pct}% complete</span>}
    </div>
  );
}
