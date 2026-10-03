import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/** Shared card surface. */
export function Card({ className, ...props }: ComponentProps<"article">) {
  return (
    <article
      className={cx("flex flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-sm", className)}
      {...props}
    />
  );
}
