"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/** Header link that marks itself current for its own route and everything under it. */
export function NavLink({ href, className, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cx(
        "rounded-full px-2.5 py-2 sm:px-3.5 whitespace-nowrap text-muted transition-colors hover:text-ink",
        current && "bg-raised text-ink",
        className,
      )}
      {...props}
    />
  );
}
