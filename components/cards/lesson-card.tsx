import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      <h3 className="font-display text-h3 font-bold">{title}</h3>
      <p className="text-body text-muted">{description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 text-small text-muted">
        <span>{moduleLabel}</span>
        <Link href={href} className={buttonClasses("text")}>
          Open lesson
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </Card>
  );
}
