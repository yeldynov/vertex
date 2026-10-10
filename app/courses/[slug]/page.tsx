import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Show } from "@clerk/nextjs";
import {
  ArrowRight,
  Bookmark,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  Clock,
  Code,
  Database,
  File,
  Gauge,
  Layers,
  Puzzle,
  Rocket,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { TrackedButton, TrackedLink } from "@/components/posthog-events";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCount, formatDuration, lessonLabel } from "@/lib/course";
import { sanityFetch } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { COURSE_QUERY, COURSE_SLUGS_QUERY } from "@/sanity/queries";

// Learning outcome icon names come from the Studio's fixed list.
const outcomeIcons = {
  code: Code,
  database: Database,
  gauge: Gauge,
  layers: Layers,
  puzzle: Puzzle,
  rocket: Rocket,
  server: Server,
  "shield-check": ShieldCheck,
  shield: Shield,
  sparkles: Sparkles,
  target: Target,
  workflow: Workflow,
  zap: Zap,
};

const VISIBLE_MODULES = 6;

export async function generateStaticParams() {
  const slugs = await sanityFetch(COURSE_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const course = await sanityFetch(COURSE_QUERY, { slug: (await params).slug });
  return course ? { title: `${course.title} · Vertex`, description: course.summary ?? undefined } : {};
}

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const course = await sanityFetch(COURSE_QUERY, { slug });
  if (!course) notFound();

  const modules = course.modules ?? [];
  const lessonHref = (lessonSlug: string | null) => `/courses/${slug}/lessons/${lessonSlug}`;
  const firstLesson = modules[0]?.lessons?.[0];
  const totalLength = course.totalSeconds ? formatDuration(course.totalSeconds) : null;
  const moduleCount = `${modules.length} modules`;
  // ponytail: no progress store yet; the progress task supplies real % and the resume lesson.
  const progress = 0;
  const cta = firstLesson && (
    <TrackedLink
      href={lessonHref(firstLesson.slug)}
      eventName="course_started"
      eventProperties={{ course_slug: slug }}
      className={`${buttonClasses("primary", "lg")} h-13 px-6 font-normal shadow-md`}
    >
      Start Learning
      <ArrowRight aria-hidden className="size-5" />
    </TrackedLink>
  );

  return (
    <PageFrame
      footer={
        cta && (
          <Show when="signed-in">
            <div className="px-4 pt-8 pb-10 sm:px-10 xl:px-16">
              <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-md sm:flex-row sm:items-center sm:gap-10 sm:px-6">
                <p className="text-small text-neutral-500">
                  Your Progress
                  <span className="mt-1 block text-body-lg text-neutral-900">{progress}% complete</span>
                </p>
                <ProgressBar value={progress} showLabel={false} className="sm:w-70" />
                <div className="sm:ml-auto">{cta}</div>
              </div>
            </div>
          </Show>
        )
      }
    >
      <div className="px-4 pt-8 sm:px-10 sm:pt-10 xl:px-16">
        <Breadcrumbs items={[{ label: "All Courses", href: "/courses" }, { label: course.title ?? "" }]} />

        <section className="mt-10 grid gap-8 md:grid-cols-[minmax(0,17.5rem)_1fr] md:gap-14">
          {course.coverImage?.asset && (
            <Image
              src={urlFor(course.coverImage).width(560).height(652).fit("crop").url()}
              alt={course.coverImage.alt ?? ""}
              width={280}
              height={326}
              priority
              className="aspect-[280/326] w-full max-w-70 rounded-lg object-cover shadow-md max-md:mx-auto"
            />
          )}
          <div className="min-w-0">
            {course.popular && <Badge kind="popular" className="px-3 py-1.5 tracking-[0.15em]" />}
            <h1 className="mt-5 font-display text-display-2 font-medium tracking-tight md:text-[3.25rem] md:leading-[3.75rem]">
              {course.title}
            </h1>
            <p className="mt-5 max-w-xl text-body-lg text-neutral-500 sm:text-h3 sm:leading-8 sm:font-normal">
              {course.summary}
            </p>
            <ul className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-body text-neutral-700 [&_svg]:size-5 [&_svg]:text-neutral-500">
              {course.level && (
                <li className="flex items-center gap-2 capitalize">
                  <ChartNoAxesColumnIncreasing aria-hidden />
                  {course.level}
                </li>
              )}
              {totalLength && (
                <li className="flex items-center gap-2">
                  <Clock aria-hidden />
                  {totalLength}
                </li>
              )}
              <li className="flex items-center gap-2">
                <File aria-hidden />
                {moduleCount}
              </li>
              {course.studentCount != null && (
                <li className="flex items-center gap-2">
                  <Users aria-hidden />
                  {formatCount(course.studentCount)} students
                </li>
              )}
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              {cta}
              {/* Presentational only: bookmarks have no backend. */}
              <TrackedButton
                type="button"
                eventName="course_bookmarked"
                eventProperties={{ course_slug: slug }}
                className={`${buttonClasses("tertiary", "lg")} h-13 px-5 font-normal`}
              >
                <Bookmark aria-hidden className="size-5" />
                Bookmark
              </TrackedButton>
            </div>
          </div>
        </section>

        {!!course.learningOutcomes?.length && (
          <section aria-labelledby="outcomes" className="mt-12 rounded-lg border border-neutral-200 bg-white/40 p-4 sm:p-7">
            <h2 id="outcomes" className="font-display text-h2 font-normal">
              What you’ll learn
            </h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {course.learningOutcomes.map(({ _key, icon, title, description }) => {
                const Icon = (icon && outcomeIcons[icon]) || Sparkles;
                return (
                  <li key={_key} className="flex gap-5 rounded-md border border-neutral-200 bg-white p-5 sm:gap-7 sm:p-7">
                    <Icon aria-hidden strokeWidth={1.25} className="size-11 shrink-0 text-primary-500 sm:size-13" />
                    <div className="min-w-0">
                      <h3 className="font-display text-h3 font-normal sm:text-[1.25rem]">{title}</h3>
                      {description && <p className="mt-3 text-body-lg leading-6 text-neutral-500">{description}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="content" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="content" className="font-display text-h2 font-normal">
              Course Content
            </h2>
            <p className="text-body text-neutral-500">
              {moduleCount}
              {totalLength && <> &nbsp;•&nbsp; {totalLength}</>}
            </p>
          </div>

          <input id="show-all-modules" type="checkbox" className="peer sr-only" />
          <ol className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white peer-checked:[&>li]:block">
            {modules.map((module, m) => {
              const seconds = module.lessons?.reduce((sum, l) => sum + (l.duration ?? 0), 0) ?? 0;
              return (
                <li key={module._key} className={m >= VISIBLE_MODULES ? "hidden" : undefined}>
                  <details className="group/module">
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-3 sm:gap-6 sm:px-5 [&::-webkit-details-marker]:hidden">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-neutral-200 text-body-lg">
                        {m + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-body-lg font-medium">{module.title}</span>
                        {module.summary && <span className="mt-0.5 block text-body text-neutral-500">{module.summary}</span>}
                      </span>
                      {seconds > 0 && <span className="shrink-0 text-body text-neutral-500">{formatDuration(seconds)}</span>}
                      <ChevronDown aria-hidden className="size-5 shrink-0 text-neutral-700 transition-transform group-open/module:rotate-180" />
                    </summary>
                    <ol className="border-t border-neutral-100 pb-2 sm:pl-16">
                      {module.lessons?.map((lesson, l) => (
                        <li key={lesson._id}>
                          <TrackedLink
                            href={lessonHref(lesson.slug)}
                            eventName="lesson_selected"
                            eventProperties={{
                              course_slug: slug,
                              module_index: m + 1,
                              lesson_index: l + 1,
                              is_free_preview: Boolean(lesson.freePreview),
                            }}
                            className="flex items-center gap-4 px-4 py-2.5 text-body hover:bg-neutral-50 sm:px-5"
                          >
                            <span className="w-20 shrink-0 text-small text-neutral-500">{lessonLabel(m, l)}</span>
                            <span className="min-w-0 flex-1">{lesson.title}</span>
                            {lesson.freePreview && <span className="shrink-0 text-small text-primary-500">Free preview</span>}
                            {lesson.duration != null && (
                              <span className="shrink-0 text-small text-neutral-500">{formatDuration(lesson.duration)}</span>
                            )}
                          </TrackedLink>
                        </li>
                      ))}
                    </ol>
                  </details>
                </li>
              );
            })}
          </ol>
          {modules.length > VISIBLE_MODULES && (
            <label
              htmlFor="show-all-modules"
              className={`${buttonClasses("tertiary")} relative mx-auto -mt-5 flex w-fit cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-primary-400 [&_svg]:transition-transform peer-checked:[&_svg]:rotate-180 peer-checked:[&>.more]:hidden peer-checked:[&>.less]:inline [&>.less]:hidden`}
            >
              <span className="more">Show all {modules.length} modules</span>
              <span className="less">Show fewer modules</span>
              <ChevronDown aria-hidden className="size-4" />
            </label>
          )}
        </section>
      </div>
    </PageFrame>
  );
}
