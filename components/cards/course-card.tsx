import type { ReactNode } from "react";
import { TrackedLink } from "@/components/posthog-events";
import { Card } from "./card";

/** Compact course row: art beside the title (design system, instructor lists). The shelf uses `Sleeve`. */
export function CourseCard({
  href,
  icon,
  title,
  description,
  level,
  duration,
  moduleCount,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  level: string;
  duration: string;
  moduleCount: number;
}) {
  return (
    <Card className="relative gap-4 transition-colors hover:bg-raised">
      <div className="flex gap-4">
        <div className="size-14 shrink-0 overflow-hidden rounded-md">{icon}</div>
        <div className="min-w-0">
          <h3 className="font-display text-h3 font-bold">
            <TrackedLink
              href={href}
              eventName="course_selected"
              eventProperties={{ course_path: href, card_layout: "row" }}
              className="rounded-xs after:absolute after:inset-0 after:rounded-xl"
            >
              {title}
            </TrackedLink>
          </h3>
          <p className="mt-1 text-body text-muted">{description}</p>
        </div>
      </div>
      <p className="mt-auto text-small text-muted tabular-nums">
        {[level, duration, `${moduleCount} modules`].filter(Boolean).join(" · ")}
      </p>
    </Card>
  );
}
