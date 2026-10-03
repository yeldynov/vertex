export type PageItem = number | "ellipsis";

/** Pages to show: a 3-page window around the current page, plus first and last, with gaps as ellipses. */
export function getPageItems(page: number, total: number): PageItem[] {
  if (total <= 0) return [];
  const start = Math.max(1, Math.min(page - 1, total - 2));
  const end = Math.min(total, start + 2);
  const items: PageItem[] = [];
  if (start > 1) items.push(1);
  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis");
  if (end < total) items.push(total);
  return items;
}
