import { FileText, SquareArrowOutUpRight } from "lucide-react";
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
    <Card className="relative gap-4 transition-shadow hover:shadow-md">
      <div className="flex gap-3">
        <FileText aria-hidden className="size-6 shrink-0 text-neutral-700" />
        <div className="min-w-0">
          <h3 className="text-body-lg font-medium">
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="after:absolute after:inset-0 after:rounded-lg"
            >
              {title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </h3>
          <p className="mt-1 text-small text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between text-small text-neutral-500">
        <span>{[type, size].filter(Boolean).join(" · ")}</span>
        <SquareArrowOutUpRight aria-hidden className="size-4 text-primary-500" />
      </div>
    </Card>
  );
}
