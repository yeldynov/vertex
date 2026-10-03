import Link from "next/link";
import { CirclePlay } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "./card";

/** A lesson's video matched at a moment; the action opens the lesson at `startLabel`. */
export function LessonVideoCard({
  href,
  title,
  description,
  lessonLabel,
  duration,
  startLabel,
}: {
  href: string;
  title: string;
  description: string;
  lessonLabel: string;
  duration: string;
  startLabel: string;
}) {
  return (
    <Card className="gap-3">
      <Badge kind="video" className="self-start" />
      <h3 className="text-h3 font-semibold">{title}</h3>
      <p className="text-body text-neutral-500">{description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 text-small text-neutral-500">
        <span>
          {lessonLabel} · {duration}
        </span>
        <Link href={href} className={buttonClasses("text")}>
          Watch from {startLabel}
          <CirclePlay aria-hidden className="size-4" />
        </Link>
      </div>
    </Card>
  );
}
