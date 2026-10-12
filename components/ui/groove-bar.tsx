import { cx } from "@/lib/cx";
import { formatTimestamp } from "@/lib/search";

type Chapter = { startSeconds: number | null };

const pct = (s: number, total: number) => `${Math.min(100, Math.max(0, (s / total) * 100))}%`;

/**
 * A lesson drawn to its real length: grooves for the track, gaps at chapter starts,
 * an optional highlighted clip, and the amber needle at the exact second.
 */
export function GrooveBar({
  duration,
  at,
  span,
  chapters = [],
  showTime = true,
  className,
}: {
  duration: number;
  at?: number | null;
  span?: [number, number];
  chapters?: Chapter[];
  showTime?: boolean;
  className?: string;
}) {
  if (!duration) return null;
  const hasNeedle = at != null;
  const where = hasNeedle ? at / duration : 0;
  const label = hasNeedle
    ? `Moment at ${formatTimestamp(at)} of ${formatTimestamp(duration)}`
    : `Lesson length ${formatTimestamp(duration)}`;

  return (
    <div role="img" aria-label={label} className={cx("relative", hasNeedle && showTime && "pt-7", className)}>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-[repeating-linear-gradient(90deg,var(--color-ramp-4)_0_2px,var(--color-ramp-3)_2px_4px)]">
        {hasNeedle && <span className="absolute inset-y-0 left-0 bg-ramp-6/70" style={{ width: pct(at, duration) }} />}
        {span && (
          <span
            className="absolute inset-y-0 bg-amber/45"
            style={{ left: pct(span[0], duration), width: pct(span[1] - span[0], duration) }}
          />
        )}
        {chapters.map(({ startSeconds }) =>
          startSeconds ? (
            <span key={startSeconds} className="absolute inset-y-0 w-0.5 bg-ground" style={{ left: pct(startSeconds, duration) }} />
          ) : null,
        )}
      </div>
      {hasNeedle && (
        <span
          aria-hidden
          className="absolute bottom-[-5px] w-0 animate-[needle-in_1.1s_var(--ease-out-expo)_both]"
          style={{ left: pct(at, duration) }}
        >
          <span className="absolute bottom-0 -left-px h-5 w-0.5 rounded-full bg-amber" />
          <span className="absolute bottom-4 -left-[5px] size-2.5 rounded-full bg-amber ring-2 ring-ground" />
          {showTime && (
            <span
              className={cx(
                "absolute bottom-7 rounded-xs bg-amber px-1.5 text-small font-bold text-on-amber tabular-nums",
                where < 0.12 ? "-left-1.5" : where > 0.88 ? "-right-1.5" : "-translate-x-1/2",
              )}
            >
              {formatTimestamp(at)}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
