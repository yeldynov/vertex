import { Sleeve } from "@/components/ui/sleeve";
import { courseTone, formatDuration } from "@/lib/course";
import { urlFor } from "@/sanity/lib/image";
import type { COURSES_QUERY_RESULT } from "@/sanity.types";

type Course = Pick<COURSES_QUERY_RESULT[number], "_id" | "slug" | "title" | "coverImage" | "level" | "lessonCount" | "totalSeconds">;

const nowrap = (part: string) => part.replaceAll(" ", " ");

/** The shelf: every course as a record sleeve (home + catalog). */
export function CourseGrid({ courses, priority = 6 }: { courses: Course[]; priority?: number }) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 xl:grid-cols-6">
      {courses.map(({ _id, slug, title, coverImage, level, lessonCount, totalSeconds }, i) => (
        <li key={_id}>
          <Sleeve
            href={`/courses/${slug}`}
            title={title ?? ""}
            tone={courseTone(slug)}
            cover={coverImage?.asset ? urlFor(coverImage).width(480).height(270).fit("crop").url() : null}
            meta={[level && level[0].toUpperCase() + level.slice(1), lessonCount && `${lessonCount} lessons`, totalSeconds && formatDuration(totalSeconds)]
              .filter((part): part is string => Boolean(part))
              .map(nowrap)
              .join(" · ")}
            priority={i < priority}
          />
        </li>
      ))}
    </ul>
  );
}
