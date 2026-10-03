import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "tertiary" | "text";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-100 disabled:text-primary-300",
  secondary:
    "border border-primary-500 bg-white text-primary-500 hover:bg-primary-100 disabled:border-primary-200 disabled:bg-white disabled:text-primary-300",
  tertiary:
    "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 disabled:bg-white disabled:text-neutral-300",
  text: "text-primary-500 hover:text-primary-600 disabled:text-primary-300",
};

const sizes: Record<Size, string> = {
  md: "px-3 text-body",
  lg: "px-4 text-body-lg",
};

/** Class string for a Vertex button; use it to style links (e.g. next/link) as buttons. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed",
    variant === "text" ? "h-auto px-0" : cx("h-11", sizes[size]),
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
