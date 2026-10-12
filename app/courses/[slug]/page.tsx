import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Show } from "@clerk/nextjs";
import {
  ArrowRight,
  Bookmark,
  ChevronDown,
  Code,
  Database,
    Gauge,
  Layers,
  Puzzle,
  Rocket,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
  Zap,
} from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { TrackedButton, TrackedLink } from "@/components/posthog-events";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { GrooveBar } from "@/components/ui/groove-bar";
import { Disc, DuotoneImage, toneClasses } from "@/components/ui/sleeve";
import { cx } from "@/lib/cx";
import { courseTone, formatCount, formatDuration, lessonLabel } from "@/lib/course";
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
  const tone = courseTone(slug);
  // Lesson bars are drawn to scale against the course's longest lesson.
  const longest = Math.max(1, ...modules.flatMap((m) => m.lessons?.map((l) => l.duration ?? 0) ?? []));
  // ponytail: no progress store yet; the progress task supplies real % and the resume lesson.
  const progress = 0;
  const cta = (onTone: boolean) =>
    firstLesson && (
      <TrackedLink
        href={lessonHref(firstLesson.slug)}
        eventName="course_started"
        eventProperties={{ course_slug: slug }}
        className={buttonClasses(onTone ? "inverse" : "primary", "lg")}
      >
        Start learning
        <ArrowRight aria-hidden className="size-5" />
      </TrackedLink>
    );

  return (
    <PageFrame
      footer={
        firstLesson && (
          <Show when="signed-in">
            <div className="px-4 pt-12 sm:px-8 xl:px-12">
              <div className="flex flex-col gap-4 rounded-xl bg-surface p-5 sm:flex-row sm:items-center sm:gap-10 sm:px-6">
                <p className="text-small text-muted">
                  Your progress
                  <span className="mt-1 block text-body-lg font-semibold text-ink tabular-nums">{progress}% complete</span>
                </p>
                <ProgressBar value={progress} showLabel={false} className="sm:w-70" />
                <div className="sm:ml-auto">{cta(false)}</div>
              </div>
            </div>
          </Show>
        )
      }
    >
      <div className="px-4 pt-8 sm:px-8 sm:pt-10 xl:px-12">
        <Breadcrumbs items={[{ label: "All Courses", href: "/courses" }, { label: course.title ?? "" }]} />

        <section
          className={cx(
            "relative isolate mt-6 grid gap-10 overflow-hidden rounded-2xl p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-14",
            toneClasses[tone],
          )}
        >
          <div className="min-w-0 self-center">
            <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance">
              {course.title}
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg opacity-90 sm:text-[1.25rem] sm:leading-8">{course.summary}</p>
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-body font-semibold tabular-nums">
              {course.popular && <Badge kind="popular" className="mr-1" />}
              {[course.level && course.level[0].toUpperCase() + course.level.slice(1), totalLength, moduleCount, course.studentCount != null && `${formatCount(course.studentCount)} students`]
                .filter(Boolean)
                .map((part, i) => (
                  <span key={i} className="whitespace-nowrap">
                    {i > 0 && <span aria-hidden className="mr-2 opacity-60">·</span>}
                    {part}
                  </span>
                ))}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {cta(true)}
              {/* Presentational only: bookmarks have no backend. */}
              <TrackedButton
                type="button"
                eventName="course_bookmarked"
                eventProperties={{ course_slug: slug }}
                className={buttonClasses("ghost", "lg")}
              >
                <Bookmark aria-hidden className="size-5" />
                Bookmark
              </TrackedButton>
            </div>
          </div>
          {course.coverImage?.asset && (
            <div className="relative mr-[18%] aspect-square max-md:max-w-72 md:mr-0 md:-translate-x-[12%]">
              <Disc className="translate-x-[30%]" />
              <div className="relative size-full overflow-hidden rounded-md bg-(--tone) ring-1 ring-ramp-0/30 brightness-[0.62] saturate-150">
                <DuotoneImage
                  src={urlFor(course.coverImage).width(720).height(720).fit("crop").url()}
                  priority
                  sizes="(min-width: 1024px) 352px, (min-width: 768px) 288px, 288px"
                />
              </div>
            </div>
          )}
        </section>

        {!!course.learningOutcomes?.length && (
          <section aria-labelledby="outcomes" className="mt-16">
            <h2 id="outcomes" className="font-display text-h1 font-extrabold tracking-[-0.025em]">
              What you’ll learn
            </h2>
            <ul className="mt-6 grid gap-x-12 md:grid-cols-2">
              {course.learningOutcomes.map(({ _key, icon, title, description }) => {
                const Icon = (icon && outcomeIcons[icon]) || Sparkles;
                return (
                  <li key={_key} className="flex gap-5 border-t border-line py-6">
                    <Icon aria-hidden strokeWidth={1.5} className="mt-0.5 size-6 shrink-0 text-amber" />
                    <div className="min-w-0">
                      <h3 className="text-h3 font-semibold">{title}</h3>
                      {description && <p className="mt-2 max-w-[62ch] text-body text-muted">{description}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="content" className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="content" className="font-display text-h1 font-extrabold tracking-[-0.025em]">
              Tracklist
            </h2>
            <p className="text-body text-muted tabular-nums">
              {moduleCount}
              {totalLength && <> · {totalLength}</>}
            </p>
          </div>

          <input id="show-all-modules" type="checkbox" className="peer sr-only" />
          <ol className="mt-6 flex flex-col gap-3 peer-checked:[&>li]:block">
            {modules.map((module, m) => {
              const seconds = module.lessons?.reduce((sum, l) => sum + (l.duration ?? 0), 0) ?? 0;
              return (
                <li key={module._key} className={m >= VISIBLE_MODULES ? "hidden" : undefined}>
                  <details className="group/module rounded-xl bg-surface" open={m === 0}>
                    <summary className="flex cursor-pointer list-none items-center gap-4 rounded-xl px-4 py-4 transition-colors hover:bg-raised sm:gap-6 sm:px-6 [&::-webkit-details-marker]:hidden">
                      <span className="w-8 shrink-0 font-display text-h1 font-extrabold text-amber tabular-nums">{m + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-body-lg font-semibold">{module.title}</span>
                        {module.summary && <span className="mt-0.5 block text-body text-muted">{module.summary}</span>}
                      </span>
                      {seconds > 0 && <span className="shrink-0 text-body text-muted tabular-nums max-sm:hidden">{formatDuration(seconds)}</span>}
                      <ChevronDown aria-hidden className="size-5 shrink-0 text-muted transition-transform group-open/module:rotate-180" />
                    </summary>
                    <ol className="px-2 pb-3 sm:px-3">
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
                            className="group/row flex items-center gap-4 rounded-lg px-2 py-3 text-body transition-colors hover:bg-raised sm:gap-6 sm:px-3"
                          >
                            <span className="w-10 shrink-0 self-start pt-0.5 text-small font-semibold text-muted tabular-nums sm:w-12 sm:pl-1">
                              <span className="sr-only">{lessonLabel(m, l)}</span>
                              <span aria-hidden>{m + 1}.{l + 1}</span>
                            </span>
                            <span className="min-w-0 flex-1 group-hover/row:text-ink">
                              <span>{lesson.title}</span>
                              {lesson.freePreview && (
                                <span className="ml-2 inline-block rounded-full bg-amber/15 px-2.5 py-0.5 align-middle text-small font-semibold whitespace-nowrap text-amber">
                                  Free preview
                                </span>
                              )}
                              {!!lesson.duration && (
                                <span className="mt-2 block" style={{ width: `${(lesson.duration / longest) * 100}%` }}>
                                  <GrooveBar duration={lesson.duration} />
                                </span>
                              )}
                            </span>
                            {lesson.duration != null && (
                              <span className="w-14 shrink-0 self-start pt-0.5 text-right text-small text-muted tabular-nums">{formatDuration(lesson.duration)}</span>
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
              className={`${buttonClasses("tertiary")} relative mx-auto mt-4 flex w-fit cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-amber [&_svg]:transition-transform peer-checked:[&_svg]:rotate-180 peer-checked:[&>.more]:hidden peer-checked:[&>.less]:inline [&>.less]:hidden`}
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
