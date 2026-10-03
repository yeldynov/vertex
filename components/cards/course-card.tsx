import type { ReactNode } from "react";
import Link from "next/link";
import { ChartNoAxesColumnIncreasing, Clock, Folder } from "lucide-react";
import { Card } from "./card";

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
    <Card className="relative gap-5 transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        <div className="size-12 shrink-0 overflow-hidden rounded-sm">{icon}</div>
        <div className="min-w-0">
          <h3 className="text-h3 font-semibold">
            <Link href={href} className="after:absolute after:inset-0 after:rounded-lg">
              {title}
            </Link>
          </h3>
          <p className="mt-1 text-body text-neutral-500">{description}</p>
        </div>
      </div>
      <ul className="mt-auto flex flex-wrap gap-x-5 gap-y-2 text-small text-neutral-700">
        <li className="flex items-center gap-1.5">
          <ChartNoAxesColumnIncreasing aria-hidden className="size-4" />
          {level}
        </li>
        <li className="flex items-center gap-1.5">
          <Clock aria-hidden className="size-4" />
          {duration}
        </li>
        <li className="flex items-center gap-1.5">
          <Folder aria-hidden className="size-4" />
          {moduleCount} modules
        </li>
      </ul>
    </Card>
  );
}
