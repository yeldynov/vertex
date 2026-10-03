import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/cx";
import { fieldClasses } from "./input";

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className={cx("relative", className)}>
      <select className={cx(fieldClasses, "cursor-pointer appearance-none pr-10")} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-neutral-700"
      />
    </div>
  );
}
