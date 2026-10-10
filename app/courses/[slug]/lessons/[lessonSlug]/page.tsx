import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Show } from "@clerk/nextjs";
import { PortableText, type PortableTextComponents } from "next-sanity";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  CircleCheck,
  Clock,
  Lightbulb,
  Play,
  Users,
} from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { TrackedButton, TrackedLink } from "@/components/posthog-events";
import { ResourceCard } from "@/components/cards/resource-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cx } from "@/lib/cx";
import { formatCount, formatDuration, lessonLabel } from "@/lib/course";
import { embedUrl, parseStart } from "@/lib/video";
import { sanityFetch } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { LESSON_PATHS_QUERY, LESSON_QUERY } from "@/sanity/queries";

type Props = PageProps<"/courses/[slug]/lessons/[lessonSlug]">;

const resourceLabels = {
  link: "Link",
  article: "Article",
  docs: "Docs",
  repo: "Repository",
  download: "Download",
  video: "Video",
};

const notesComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>,
    h2: ({ children }) => <h3 className="mt-6 text-body-lg font-medium text-neutral-900">{children}</h3>,
    h3: ({ children }) => <h4 className="mt-5 font-medium text-neutral-900">{children}</h4>,
    blockquote: ({ children }) => <blockquote className="mt-4 border-l-2 border-primary-300 pl-4">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-3 list-disc space-y-1.5 pl-5">{children}</ul>,
    number: ({ children }) => <ol className="mt-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noreferrer" className="text-primary-500 underline underline-offset-2">
        {children}
      </a>
    ),
  },
};

export async function generateStaticParams() {
  const courses = await sanityFetch(LESSON_PATHS_QUERY);
  return courses.flatMap(({ courseSlug, lessonSlugs }) =>
    (lessonSlugs ?? []).filter(Boolean).map((lessonSlug) => ({ slug: courseSlug, lessonSlug })),
  );
}

async function getLesson(params: Props["params"]) {
  const { slug, lessonSlug } = await params;
  const lesson = await sanityFetch(LESSON_QUERY, { courseSlug: slug, lessonSlug });
  return lesson?.course ? { ...lesson, course: lesson.course } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = await getLesson(params);
  return lesson ? { title: `${lesson.title} · ${lesson.course.title} · Vertex` } : {};
}

export default async function LessonPage({ params, searchParams }: Props) {
  const lesson = await getLesson(params);
  if (!lesson) notFound();
  const { course } = lesson;
  const courseHref = `/courses/${course.slug}`;
  const lessonHref = (lessonSlug: string | null) => `${courseHref}/lessons/${lessonSlug}`;

  // Lessons flattened in course order; module/lesson labels and prev/next derive from it.
  const modules = course.modules ?? [];
  const flat = modules.flatMap((module, m) => (module.lessons ?? []).map((item, l) => ({ ...item, m, l })));
  const index = flat.findIndex((item) => item._id === lesson._id);
  if (index < 0) notFound();
  const current = flat[index];
  const [prev, next] = [flat[index - 1], flat[index + 1]];
  const currentModule = modules[current.m];

  const src = lesson.videoUrl ? embedUrl(lesson.videoUrl, parseStart((await searchParams).t)) : null;
  const subtitle = lesson.notes
    ?.find((block) => block.style === "normal" && !block.listItem)
    ?.children?.map((span) => span.text)
    .join("");
  // ponytail: no progress store yet; the progress task supplies real % and completion marks.
  const progress = 0;

  const navLink = (item: (typeof flat)[number], direction: "previous" | "next") => (
    <TrackedLink
      href={lessonHref(item.slug)}
      eventName="lesson_navigated"
      eventProperties={{ course_slug: course.slug, lesson_slug: item.slug, direction }}
      className={cx(
        "flex items-center gap-5 sm:gap-7",
        direction === "next" && "ml-auto flex-row-reverse text-right",
      )}
    >
      <span
        className={cx(
          buttonClasses(direction === "next" ? "primary" : "tertiary", "lg"),
          "h-13 shrink-0 px-6 font-normal",
          direction === "next" && "shadow-md",
        )}
      >
        {direction === "previous" && <ArrowLeft aria-hidden className="size-5" />}
        <span className="max-sm:sr-only">{direction === "next" ? "Next Lesson" : "Previous Lesson"}</span>
        {direction === "next" && <ArrowRight aria-hidden className="size-5" />}
      </span>
      <span className="min-w-0 text-small text-neutral-500">
        <span className="block truncate text-body text-neutral-700">{item.title}</span>
        {item.duration != null && <span className="mt-1 block">{formatDuration(item.duration)}</span>}
      </span>
    </TrackedLink>
  );

  return (
    <PageFrame
      footer={
        <div className="relative px-4 pt-8 pb-10 sm:px-10 xl:px-16">
          <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-md sm:flex-row sm:items-center sm:gap-10 sm:px-6">
            {prev && navLink(prev, "previous")}
            {next && navLink(next, "next")}
          </div>
        </div>
      }
    >
      <div className="lg:grid lg:grid-cols-[19.5rem_minmax(0,1fr)]">
        <aside className="group/nav border-neutral-200 max-lg:border-b lg:border-r" aria-label="Course lessons">
          <div className="px-4 pt-6 sm:px-6 lg:pt-10">
            <Link href={courseHref} className="inline-flex items-center gap-2 text-body-lg text-primary-500 hover:text-primary-600">
              <ArrowLeft aria-hidden className="size-4" />
              Back to course
            </Link>
            <div className="mt-8 flex items-center gap-4">
              {course.coverImage?.asset && (
                <Image
                  src={urlFor(course.coverImage).width(104).height(104).fit("crop").url()}
                  alt=""
                  width={52}
                  height={52}
                  className="size-13 shrink-0 rounded-sm object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-body-lg font-medium">{course.title}</p>
                <Show when="signed-in">
                  <p className="mt-1 text-small text-neutral-500">{progress}% complete</p>
                  <ProgressBar value={progress} showLabel={false} className="mt-2 w-18" />
                </Show>
              </div>
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer items-center justify-between border-y border-neutral-200 px-4 py-4 text-body sm:px-6 lg:cursor-default has-focus-visible:outline-2 has-focus-visible:outline-primary-400">
            <input type="checkbox" className="peer sr-only lg:hidden" />
            Module {current.m + 1} of {modules.length}
            <ChevronDown aria-hidden className="size-5 text-neutral-500 transition-transform peer-checked:rotate-180 lg:hidden" />
          </label>

          <ol className="divide-y divide-neutral-200 max-lg:hidden max-lg:group-has-checked/nav:block lg:border-b lg:border-neutral-200">
            {modules.map((module, m) => {
              const isCurrent = m === current.m;
              const seconds = module.lessons?.reduce((sum, l) => sum + (l.duration ?? 0), 0) ?? 0;
              return (
                <li key={module._key} className={cx(isCurrent && "bg-primary-100/40")}>
                  <details open={isCurrent} className="group/module">
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
                      <span
                        className={cx(
                          "grid size-8 shrink-0 place-items-center rounded-full border text-body",
                          isCurrent ? "border-primary-500 bg-primary-500 text-white" : "border-neutral-200 bg-white",
                        )}
                      >
                        {m + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cx("block text-body font-medium", isCurrent && "text-primary-500")}>{module.title}</span>
                        {seconds > 0 && <span className="mt-0.5 block text-small text-neutral-500">{formatDuration(seconds)}</span>}
                      </span>
                      <ChevronDown aria-hidden className="size-4 shrink-0 text-neutral-500 transition-transform group-open/module:rotate-180" />
                    </summary>
                    <ol className="relative ml-8 pb-3 before:absolute before:inset-y-2 before:left-0 before:border-l before:border-neutral-200 sm:ml-10">
                      {module.lessons?.map((item, l) => {
                        const playing = item._id === lesson._id;
                        return (
                          <li key={item._id} className="relative">
                            <span
                              aria-hidden
                              className={cx(
                                "absolute top-4 -left-[3px] size-1.5 rounded-full",
                                playing ? "bg-primary-500" : "border border-neutral-300 bg-white",
                              )}
                            />
                            <Link
                              href={lessonHref(item.slug)}
                              aria-current={playing ? "page" : undefined}
                              className="flex items-center gap-3 py-2 pr-4 pl-6 text-body hover:text-primary-500 sm:pr-6"
                            >
                              <span className="min-w-0 flex-1">
                                <span className={cx("block", playing ? "text-neutral-900" : "text-neutral-700")}>
                                  <span className="sr-only">{lessonLabel(m, l)}: </span>
                                  {item.title}
                                </span>
                                <span className={cx("mt-0.5 block text-small", playing ? "text-primary-500" : "text-neutral-500")}>
                                  {playing ? "Now playing" : item.duration != null && formatDuration(item.duration)}
                                </span>
                              </span>
                              {playing && (
                                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-500 text-white">
                                  <Play aria-hidden className="size-3 fill-current" />
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </details>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="min-w-0 px-4 pt-8 sm:px-10 lg:pt-10 xl:px-12">
          <Breadcrumbs
            items={[
              { label: "All Courses", href: "/courses" },
              { label: course.title ?? "", href: courseHref },
              { label: currentModule.title ?? "" },
              { label: lesson.title ?? "" },
            ]}
          />

          <div className="mt-10 flex items-start justify-between gap-6">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-xs bg-primary-100 px-2 py-0.5 text-small font-semibold tracking-wider text-primary-500 uppercase">
                {lessonLabel(current.m, current.l)}
              </span>
              <h1 className="mt-5 font-display text-display-2 font-medium tracking-tight md:text-[2.75rem] md:leading-[3.25rem]">
                {lesson.title}
              </h1>
              {subtitle && <p className="mt-4 max-w-2xl text-body-lg leading-7 text-neutral-500">{subtitle}</p>}
            </div>
            {/* Presentational only: bookmarks have no backend. */}
            <TrackedButton
              type="button"
              aria-label="Bookmark lesson"
              eventName="lesson_bookmarked"
              eventProperties={{ course_slug: course.slug, lesson_slug: lesson.slug }}
              className="grid size-10 shrink-0 place-items-center rounded-sm border border-neutral-200 bg-white text-primary-500 hover:border-neutral-300"
            >
              <Bookmark aria-hidden className="size-5" />
            </TrackedButton>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-body text-neutral-700 [&_svg]:size-5 [&_svg]:text-neutral-500">
            {lesson.duration != null && (
              <li className="flex items-center gap-2">
                <Clock aria-hidden />
                {formatDuration(lesson.duration)}
              </li>
            )}
            {course.level && (
              <li className="flex items-center gap-2 capitalize">
                <ChartNoAxesColumnIncreasing aria-hidden />
                {course.level}
              </li>
            )}
            {lesson.studentCount != null && (
              <li className="flex items-center gap-2">
                <Users aria-hidden />
                {formatCount(lesson.studentCount)} students
              </li>
            )}
          </ul>

          <div className="mt-8 aspect-video overflow-hidden rounded-lg bg-neutral-900 shadow-lg">
            {src ? (
              <iframe
                src={src}
                title={lesson.title ?? "Lesson video"}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                className="size-full border-0"
              />
            ) : (
              <p className="grid size-full place-items-center text-body text-neutral-300">Video unavailable</p>
            )}
          </div>

          <div className="group/tabs mt-10">
            <div className="flex gap-2 border-b border-neutral-200 font-display text-body-lg">
              {[
                ["content", "Lesson Content"],
                ["notes", "Notes"],
              ].map(([id, label]) => (
                <label
                  key={id}
                  className="-mb-px cursor-pointer border-b-2 border-transparent px-5 pb-3 text-neutral-700 has-checked:border-primary-500 has-checked:text-primary-500 has-focus-visible:outline-2 has-focus-visible:outline-primary-400"
                >
                  <input type="radio" name="lesson-tab" id={`tab-${id}`} defaultChecked={id === "content"} className="sr-only" />
                  {label}
                </label>
              ))}
            </div>

            <div className="group-has-[#tab-notes:checked]/tabs:hidden">
              {!!lesson.notes?.length && (
                <section aria-labelledby="overview" className="border-b border-neutral-200 px-1 py-8 sm:px-5">
                  <h2 id="overview" className="font-display text-h2 font-normal">
                    Overview
                  </h2>
                  <div className="mt-4 max-w-2xl text-body leading-6 text-neutral-500">
                    <PortableText value={lesson.notes} components={notesComponents} />
                  </div>
                </section>
              )}

              {!!lesson.keyPoints?.length && (
                <section aria-labelledby="key-points" className="px-1 pt-8 sm:px-5">
                  <h2 id="key-points" className="text-body-lg font-medium">
                    In this lesson you will:
                  </h2>
                  <ul className="mt-5 space-y-4 text-body text-neutral-700">
                    {lesson.keyPoints.map((point) => (
                      <li key={point} className="flex items-center gap-3">
                        <CircleCheck aria-hidden className="size-5 shrink-0 text-primary-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {lesson.proTip && (
                <aside className="mx-1 mt-8 flex gap-4 rounded-md border border-primary-200/60 bg-primary-100/50 p-5 sm:mx-5">
                  <Lightbulb aria-hidden className="size-6 shrink-0 text-primary-500" />
                  <div>
                    <h2 className="text-body-lg font-medium">Pro Tip</h2>
                    <p className="mt-2 text-body leading-6 text-neutral-500">{lesson.proTip}</p>
                  </div>
                </aside>
              )}

              {!!lesson.resources?.length && (
                <section aria-labelledby="resources" className="mt-8 border-t border-neutral-200 px-1 pt-6 sm:px-5">
                  <h2 id="resources" className="font-display text-h3 font-medium">
                    Resources
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {lesson.resources.map((resource) => (
                      <ResourceCard
                        key={resource._key}
                        href={resource.url ?? "#"}
                        title={resource.title ?? ""}
                        description={resource.description ?? ""}
                        type={resource.type ? resourceLabels[resource.type] : ""}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Presentational only: personal notes have no backend. */}
            <div className="hidden px-1 py-10 text-body text-neutral-500 group-has-[#tab-notes:checked]/tabs:block sm:px-5">
              Personal notes are coming soon.
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
