import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "tertiary" | "text" | "inverse" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-amber text-on-amber hover:bg-amber-hi disabled:bg-ramp-4 disabled:text-ramp-6",
  secondary: "border border-amber text-amber hover:bg-amber/10 disabled:border-ramp-4 disabled:text-ramp-6",
  tertiary: "bg-raised text-ink hover:bg-ramp-4 disabled:text-ramp-6",
  text: "text-amber hover:text-amber-hi disabled:text-ramp-6",
  // On a course tone field: ink pill, and an outline that takes the field's own text colour.
  inverse: "bg-ink text-ground hover:bg-ramp-9",
  ghost: "text-current ring-1 ring-current/40 hover:bg-current/10",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-body",
  lg: "h-12 px-6 text-body-lg",
};

/** Class string for a Vertex button; use it to style links (e.g. next/link) as buttons. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cx(
    "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed",
    variant === "text" ? "h-auto rounded-xs px-0" : cx("rounded-full", sizes[size]),
    variants[variant],
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button type={type} className={cx(buttonClasses(variant, size), className)} {...props} />
  );
}
