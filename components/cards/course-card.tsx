import type { ReactNode } from "react";
import { ChartNoAxesColumnIncreasing, Clock, File, Folder } from "lucide-react";
import { TrackedLink } from "@/components/posthog-events";
import { cx } from "@/lib/cx";
import { Card } from "./card";

/** `row`: icon beside the text (design system). `stacked`: icon on top, serif title (home grid). */
export function CourseCard({
  href,
  icon,
  title,
  description,
  level,
  duration,
  moduleCount,
  layout = "row",
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  level: string;
  duration: string;
  moduleCount: number;
  layout?: "row" | "stacked";
}) {
  const stacked = layout === "stacked";
  const ModulesIcon = stacked ? File : Folder;
  return (
    <Card className={cx("relative gap-5 transition-shadow hover:shadow-md", stacked && "p-6")}>
      <div className={cx("flex gap-4", stacked && "flex-col gap-5")}>
        <div className={cx("shrink-0 overflow-hidden rounded-sm", stacked ? "size-18" : "size-12")}>{icon}</div>
        <div className="min-w-0">
          <h3 className={stacked ? "font-display text-h2 font-normal" : "text-h3 font-semibold"}>
            <TrackedLink
              href={href}
              eventName="course_selected"
              eventProperties={{ course_path: href, card_layout: layout }}
              className="after:absolute after:inset-0 after:rounded-lg"
            >
              {title}
            </TrackedLink>
          </h3>
          <p className={cx("text-body text-neutral-500", stacked ? "mt-4 leading-6" : "mt-1")}>{description}</p>
        </div>
      </div>
      <ul
        className={cx(
          "mt-auto flex gap-y-2 text-neutral-700",
          stacked
            ? "-mx-2 justify-between gap-x-2 border-t border-neutral-200 pt-5 text-[0.6875rem] whitespace-nowrap *:gap-1 [&_svg]:size-3.5"
            : "flex-wrap gap-x-5 text-small",
        )}
      >
        <li className="flex items-center gap-1.5">
          <ChartNoAxesColumnIncreasing aria-hidden className="size-4" />
          {level}
        </li>
        <li className="flex items-center gap-1.5">
          <Clock aria-hidden className="size-4" />
          {duration}
        </li>
        <li className="flex items-center gap-1.5">
          <ModulesIcon aria-hidden className="size-4" />
          {moduleCount} modules
        </li>
      </ul>
    </Card>
  );
}
