import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "./card";

/** A lesson matched on its own topic; the action opens the lesson page. */
export function LessonCard({
  href,
  title,
  description,
  moduleLabel,
}: {
  href: string;
  title: string;
  description: string;
  moduleLabel: string;
}) {
  return (
    <Card className="gap-3">
      <Badge kind="lesson" className="self-start" />
      <h3 className="text-h3 font-semibold">{title}</h3>
      <p className="text-body text-neutral-500">{description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 text-small text-neutral-500">
        <span>{moduleLabel}</span>
        <Link href={href} className={buttonClasses("text")}>
          View lesson
          <SquareArrowOutUpRight aria-hidden className="size-4" />
        </Link>
      </div>
    </Card>
  );
}
