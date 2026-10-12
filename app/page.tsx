import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { CourseGrid } from "@/components/course-grid";
import { HomeSearchForm } from "@/components/home-search-form";
import { PageFrame } from "@/components/page-frame";
import { TrackedLink } from "@/components/posthog-events";
import { buttonClasses } from "@/components/ui/button";
import { GrooveBar } from "@/components/ui/groove-bar";
import { toneDot } from "@/components/ui/sleeve";
import { courseTone } from "@/lib/course";
import { formatTimestamp } from "@/lib/search";
import { sanityFetch } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { HOME_QUERY } from "@/sanity/queries";
import type { HOME_QUERY_RESULT } from "@/sanity.types";

/** The first real chapter moment (past 0s, sponsor plugs skipped) in the lead course, with its locator. */
function findNeedleDrop(course: HOME_QUERY_RESULT["lead"][number] | undefined) {
  for (const [m, module] of (course?.modules ?? []).entries()) {
    for (const [l, lesson] of (module.lessons ?? []).entries()) {
      const chapter = lesson.chapters?.find((c) => c.startSeconds && c.label && !/sponsor/i.test(c.label));
      if (chapter?.startSeconds && lesson.duration && lesson.slug && course?.slug) {
        return { course, lesson, chapter: { startSeconds: chapter.startSeconds, label: chapter.label }, locator: `${m + 1}.${l + 1}` };
      }
    }
  }
  return null;
}

export default async function Home() {
  const { courses, lead } = await sanityFetch(HOME_QUERY);
  const drop = findNeedleDrop(lead[0]);
  // One real lesson title from each lead course, as a ready-made question.
  const suggestions = lead
    .map((course) => course.modules?.[1]?.lessons?.[0]?.title ?? course.modules?.[0]?.lessons?.[1]?.title)
    .filter((title): title is string => Boolean(title));

  return (
    <PageFrame>
      <section className="grid gap-10 px-4 pt-12 pb-16 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center lg:gap-16 xl:px-12 xl:pt-20 xl:pb-20">
        <div className="min-w-0">
          <h1 className="max-w-4xl font-display text-[clamp(2.75rem,6.4vw,5rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance">
            Search your learning in <span className="text-amber">plain English.</span>
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-muted sm:text-[1.25rem] sm:leading-8">
            Vertex understands what you want to learn and finds the exact lessons across all your courses.
          </p>
          <HomeSearchForm />
          {suggestions.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-small text-muted">Try</span>
              {suggestions.map((title) => (
                <TrackedLink
                  key={title}
                  href={`/search?q=${encodeURIComponent(title)}`}
                  eventName="search_submitted"
                  eventProperties={{ source: "home_suggestion" }}
                  className="rounded-full border border-line px-3.5 py-1.5 text-small text-ramp-9 transition-colors hover:border-amber hover:text-ink"
                >
                  {title}
                </TrackedLink>
              ))}
            </div>
          )}
        </div>

        {drop && <NeedleDrop {...drop} />}
      </section>

      <section aria-labelledby="shelf" className="px-4 sm:px-8 xl:px-12">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t border-line pt-10">
          <h2 id="shelf" className="font-display text-h1 font-extrabold tracking-[-0.025em]">
            On the shelf
            <span className="ml-3 align-middle text-body font-normal tracking-normal text-muted tabular-nums">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </span>
          </h2>
          <Link href="/courses" className={buttonClasses("text")}>
            Browse all courses
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <CourseGrid courses={courses} />
        <p className="mt-14 text-center text-body text-muted">New courses and lessons added every week.</p>
      </section>
    </PageFrame>
  );
}

function NeedleDrop({ course, lesson, chapter, locator }: NonNullable<ReturnType<typeof findNeedleDrop>>) {
  const href = `/courses/${course.slug}/lessons/${lesson.slug}?t=${chapter.startSeconds}`;
  const duration = lesson.duration ?? 0;
  return (
    <aside aria-labelledby="needle-drop" className="rounded-xl bg-surface p-3 ring-1 ring-line">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className={`group relative block aspect-video overflow-hidden rounded-lg ${toneDot[courseTone(course.slug)]}`}
      >
        {lesson.poster?.asset && (
          <Image
            src={urlFor(lesson.poster).width(800).height(450).fit("crop").url()}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 400px, 100vw"
            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute inset-0 bg-linear-to-t from-ramp-0/70 to-transparent" />
        <span className="absolute bottom-3 left-3 grid size-11 place-items-center rounded-full bg-amber text-on-amber">
          <Play className="size-4 translate-x-px fill-current" />
        </span>
      </Link>
      <div className="px-2 pt-5 pb-2">
        <p className="flex min-w-0 items-center gap-2 text-small text-muted">
          <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${toneDot[courseTone(course.slug)]}`} />
          <span className="truncate">{course.title}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0 font-semibold text-ink tabular-nums">{locator}</span>
        </p>
        <h2 id="needle-drop" className="mt-2 font-display text-h2 font-bold tracking-[-0.015em] text-balance">
          {lesson.title}
        </h2>
        <p className="mt-1 text-body text-muted">
          “{chapter.label}” starts at {formatTimestamp(chapter.startSeconds)}
        </p>
        <GrooveBar duration={duration} at={chapter.startSeconds} chapters={lesson.chapters ?? []} className="mt-5" />
        <p className="mt-2 flex justify-between text-small text-muted tabular-nums">
          <span>0:00</span>
          <span>{formatTimestamp(duration)}</span>
        </p>
        <TrackedLink
          href={href}
          eventName="lesson_selected"
          eventProperties={{ course_slug: course.slug, lesson_slug: lesson.slug, source: "home_needle_drop" }}
          className={`${buttonClasses("primary", "lg")} mt-5 w-full`}
        >
          <Play aria-hidden className="size-4 fill-current" />
          Play from {formatTimestamp(chapter.startSeconds)}
        </TrackedLink>
      </div>
    </aside>
  );
}
