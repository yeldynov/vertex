import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@/lib/cx";
import { getPageItems } from "@/lib/pagination";

const item = "grid size-8 place-items-center rounded-sm text-body text-neutral-700";

/** Link-based pagination; `hrefFor(page)` builds each page's URL. */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const arrow = (target: number, label: string, Icon: typeof ChevronLeft) =>
    target < 1 || target > totalPages ? (
      <span aria-hidden className={cx(item, "text-neutral-300")}>
        <Icon className="size-4" />
      </span>
    ) : (
      <Link href={hrefFor(target)} aria-label={label} className={cx(item, "hover:bg-neutral-100")}>
        <Icon className="size-4" />
      </Link>
    );

  return (
    <nav aria-label="Pagination" className="flex items-center gap-2">
      {arrow(page - 1, "Previous page", ChevronLeft)}
      {getPageItems(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e${i}`} aria-hidden className={item}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cx(
              item,
              p === page
                ? "border border-primary-500 bg-primary-100 font-medium text-primary-500"
                : "hover:bg-neutral-100",
            )}
          >
            {p}
          </Link>
        ),
      )}
      {arrow(page + 1, "Next page", ChevronRight)}
    </nav>
  );
}
