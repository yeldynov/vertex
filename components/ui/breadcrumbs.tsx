import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-body text-neutral-500">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-neutral-900">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-neutral-700" : undefined}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight aria-hidden className="size-4" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
