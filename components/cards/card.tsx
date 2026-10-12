import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/** Shared card surface: one step up the ramp, no border or shadow. */
export function Card({ className, ...props }: ComponentProps<"article">) {
  return <article className={cx("flex flex-col rounded-xl bg-surface p-5", className)} {...props} />;
}
