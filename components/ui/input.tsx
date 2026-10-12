import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { cx } from "@/lib/cx";

export const fieldClasses =
  "h-11 w-full rounded-full border border-line bg-surface px-4 text-body text-ink placeholder:text-muted transition-colors hover:border-ramp-5 focus:border-amber focus:outline-none focus-visible:outline-none";

/** `large`: the hero search line on the home page; `action` sits inside its right end (e.g. a submit button). */
export function SearchInput({
  shortcut,
  large = false,
  action,
  className,
  ...props
}: ComponentProps<"input"> & { shortcut?: string; large?: boolean; action?: React.ReactNode }) {
  return (
    <div className={cx("relative", className)}>
      <Search
        aria-hidden
        className={cx(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted",
          large ? "left-5 size-5 sm:left-7 sm:size-6" : "left-4 size-4",
        )}
      />
      <input
        type="search"
        className={cx(
          fieldClasses,
          large ? "h-16 pl-13 text-body-lg sm:h-18 sm:pl-16 sm:text-h3 sm:font-normal" : "pl-10",
          large && action ? "pr-30 sm:pr-36" : shortcut && "pr-14",
        )}
        {...props}
      />
      {action ? (
        <span className="absolute inset-y-2 right-2 flex">{action}</span>
      ) : (
        shortcut && (
          <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-xs bg-raised px-1.5 py-0.5 font-sans text-small font-medium text-muted">
            {shortcut}
          </kbd>
        )
      )}
    </div>
  );
}
