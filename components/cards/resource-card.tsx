import { ArrowUpRight, FileText } from "lucide-react";
import { Card } from "./card";

export function ResourceCard({
  href,
  title,
  description,
  type,
  size,
}: {
  href: string;
  title: string;
  description: string;
  type: string;
  size?: string;
}) {
  return (
    <Card className="group relative gap-4 transition-colors hover:bg-raised">
      <div className="flex gap-3">
        <FileText aria-hidden className="size-5 shrink-0 text-amber" />
        <div className="min-w-0">
          <h3 className="text-body-lg font-semibold">
            <a href={href} target="_blank" rel="noreferrer" className="rounded-xs after:absolute after:inset-0 after:rounded-xl">
              {title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </h3>
          <p className="mt-1 text-small text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between text-small text-muted">
        <span>{[type, size].filter(Boolean).join(" · ")}</span>
        <ArrowUpRight aria-hidden className="size-4 text-amber transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Card>
  );
}
