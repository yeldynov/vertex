import Image from "next/image";
import { CourseCard } from "@/components/cards/course-card";
import { formatDuration } from "@/lib/course";
import { urlFor } from "@/sanity/lib/image";
import type { COURSES_QUERY_RESULT } from "@/sanity.types";

/** Responsive grid of stacked course cards (home + catalog). */
export function CourseGrid({ courses }: { courses: COURSES_QUERY_RESULT }) {
  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map(({ _id, slug, title, summary, coverImage, level, totalSeconds, moduleCount }) => (
        <li key={_id} className="flex min-w-0 *:flex-1">
          <CourseCard
            title={title ?? ""}
            description={summary ?? ""}
            level={level ? level[0].toUpperCase() + level.slice(1) : ""}
            duration={totalSeconds ? formatDuration(totalSeconds) : ""}
            moduleCount={moduleCount ?? 0}
            layout="stacked"
            href={`/courses/${slug}`}
            icon={
              coverImage?.asset && (
                <Image
                  src={urlFor(coverImage).width(144).height(144).fit("crop").url()}
                  alt=""
                  width={72}
                  height={72}
                  className="size-full object-cover"
                />
              )
            }
          />
        </li>
      ))}
    </ul>
  );
}
