import { cx } from "@/lib/cx";

/** Vertex mark + wordmark. The mark is redrawn from the design; swap in the original asset if available. */
export function Logo({ className, markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2 text-neutral-900", className)}>
      <svg viewBox="0 0 32 32" aria-hidden className="h-[1.25em] w-[1.25em]">
        <path d="M2 4h9l5 10 5-10h9L16 29z" className="fill-primary-500" />
        <path d="M11 4h10l-5 10z" className="fill-primary-300" />
      </svg>
      {markOnly ? <span className="sr-only">Vertex</span> : <span className="font-semibold">Vertex</span>}
    </span>
  );
}
