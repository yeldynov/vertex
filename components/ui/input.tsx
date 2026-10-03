import type { ComponentProps } from "react";
import { Search } from "lucide-react";
import { cx } from "@/lib/cx";

export const fieldClasses =
  "h-11 w-full rounded-md border border-neutral-200 bg-white px-4 text-body text-neutral-900 placeholder:text-neutral-500 transition-colors focus:border-primary-400 focus:outline-none focus-visible:outline-none";

export function SearchInput({
  shortcut,
  className,
  ...props
}: ComponentProps<"input"> & { shortcut?: string }) {
  return (
    <div className={cx("relative", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-500"
      />
      <input type="search" className={cx(fieldClasses, "pl-10", shortcut && "pr-14")} {...props} />
      {shortcut && (
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-xs bg-neutral-100 px-1.5 py-0.5 font-sans text-small font-medium text-neutral-700">
          {shortcut}
        </kbd>
      )}
    </div>
  );
}
