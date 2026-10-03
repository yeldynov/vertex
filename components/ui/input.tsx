import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { cx } from "@/lib/cx";

export const fieldClasses =
  "h-11 w-full rounded-md border border-neutral-200 bg-white px-4 text-body text-neutral-900 placeholder:text-neutral-500 transition-colors focus:border-primary-400 focus:outline-none focus-visible:outline-none";

/** `large`: the hero search bar on the home page. */
export function SearchInput({
  shortcut,
  large = false,
  className,
  ...props
}: ComponentProps<"input"> & { shortcut?: string; large?: boolean }) {
  return (
    <div className={cx("relative", className)}>
      <Search
        aria-hidden
        className={cx(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-neutral-500",
          large ? "left-5 size-6 text-neutral-700 sm:left-6" : "left-4 size-4",
        )}
      />
      <input
        type="search"
        className={cx(
          fieldClasses,
          large ? "h-16 pl-14 text-body-lg shadow-sm sm:h-21 sm:pl-17 sm:text-h3 sm:font-normal" : "pl-10",
          shortcut && (large ? "sm:pr-24" : "pr-14"),
        )}
        {...props}
      />
      {shortcut && (
        <kbd
          className={cx(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 font-sans font-medium text-neutral-700",
            large
              ? "right-5 hidden rounded-sm border border-neutral-200 bg-white px-3 py-2 text-body-lg sm:block"
              : "right-3 rounded-xs bg-neutral-100 px-1.5 py-0.5 text-small",
          )}
        >
          {shortcut}
        </kbd>
      )}
    </div>
  );
}
