import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Show } from "@clerk/nextjs";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { ArrowLeft, ArrowRight, Bookmark, ChevronDown, CircleCheck, Lightbulb, Play } from "lucide-react";
import { PageFrame } from "@/components/page-frame";
import { TrackedButton, TrackedLink } from "@/components/posthog-events";
import { ResourceCard } from "@/components/cards/resource-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { GrooveBar } from "@/components/ui/groove-bar";
import { DuotoneImage, toneClasses } from "@/components/ui/sleeve";
import { cx } from "@/lib/cx";
import { courseTone, formatCount, formatDuration, lessonLabel } from "@/lib/course";
import { formatTimestamp } from "@/lib/search";
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
    h2: ({ children }) => <h3 className="mt-8 font-display text-h3 font-bold text-ink">{children}</h3>,
    h3: ({ children }) => <h4 className="mt-6 font-semibold text-ink">{children}</h4>,
    blockquote: ({ children }) => <blockquote className="mt-4 border-l border-amber pl-4 text-ramp-9 italic">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="mt-3 list-disc space-y-1.5 pl-5">{children}</ul>,
    number: ({ children }) => <ol className="mt-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noreferrer" className="text-amber underline decoration-amber/40 hover:decoration-amber">
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
  const tone = courseTone(course.slug);

  // Lessons flattened in course order; module/lesson labels and prev/next derive from it.
  const modules = course.modules ?? [];
  const flat = modules.flatMap((module, m) => (module.lessons ?? []).map((item, l) => ({ ...item, m, l })));
  const index = flat.findIndex((item) => item._id === lesson._id);
  if (index < 0) notFound();
  const current = flat[index];
  const [prev, next] = [flat[index - 1], flat[index + 1]];
  const currentModule = modules[current.m];

  const start = parseStart((await searchParams).t);
  const src = lesson.videoUrl ? embedUrl(lesson.videoUrl, start) : null;
  const chapters = (lesson.chapters ?? []).filter((c): c is { startSeconds: number; label: string | null } => c.startSeconds != null);
  // The chapter playing at `start`: the last one that begins at or before it.
  const playingChapter = start ? chapters.findLast((c) => c.startSeconds <= start) : undefined;
  // The first plain paragraph is set under the title, so the notes below start after it.
  const lead = lesson.notes?.find((block) => block.style === "normal" && !block.listItem);
  const subtitle = lead?.children?.map((span) => span.text).join("");
  const notesBody = lesson.notes?.filter((block) => block !== lead) ?? [];
  // ponytail: no progress store yet; the progress task supplies real % and completion marks.
  const progress = 0;

  const navLink = (item: (typeof flat)[number], direction: "previous" | "next") => (
    <TrackedLink
      href={lessonHref(item.slug)}
      eventName="lesson_navigated"
      eventProperties={{ course_slug: course.slug, lesson_slug: item.slug, direction }}
      className={cx(
        "group/nav flex min-w-0 items-center gap-4 rounded-lg p-1 sm:gap-5",
        direction === "next" && "ml-auto flex-row-reverse text-right",
      )}
    >
      <span className={cx(buttonClasses(direction === "next" ? "primary" : "tertiary", "lg"), "shrink-0")}>
        {direction === "previous" && <ArrowLeft aria-hidden className="size-5" />}
        <span className="max-sm:sr-only">{direction === "next" ? "Next lesson" : "Previous lesson"}</span>
        {direction === "next" && <ArrowRight aria-hidden className="size-5" />}
      </span>
      <span className="min-w-0 text-small text-muted">
        <span className="block truncate text-body text-ramp-9 group-hover/nav:text-ink">{item.title}</span>
        <span className="mt-0.5 block tabular-nums">
          {item.m + 1}.{item.l + 1}
          {item.duration != null && <> · {formatDuration(item.duration)}</>}
        </span>
      </span>
    </TrackedLink>
  );

  return (
    <PageFrame
      footer={
        <div className="px-4 pt-12 sm:px-8 xl:px-12">
          <div className="flex flex-col gap-3 rounded-xl bg-surface p-3 sm:flex-row sm:items-center sm:gap-10">
            {prev && navLink(prev, "previous")}
            {next && navLink(next, "next")}
          </div>
        </div>
      }
    >
      <div className="lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:pt-8 xl:px-12">
        <aside className="group/nav lg:sticky lg:top-26 lg:max-h-[calc(100dvh-7.5rem)] lg:self-start lg:overflow-y-auto lg:rounded-xl lg:bg-surface" aria-label="Course lessons">
          <div className={cx("flex items-center gap-4 p-4 sm:px-8 lg:rounded-t-xl lg:p-5", toneClasses[tone])}>
            {course.coverImage?.asset && (
              <span className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-inherit ring-1 ring-ramp-0/30 brightness-[0.62] saturate-150">
                <DuotoneImage src={urlFor(course.coverImage).width(112).height(112).fit("crop").url()} sizes="56px" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <Link href={courseHref} className="inline-flex items-center gap-1.5 rounded-xs text-small font-semibold opacity-90 hover:opacity-100">
                <ArrowLeft aria-hidden className="size-3.5" />
                Back to course
              </Link>
              <p className="mt-1 font-display text-body-lg leading-tight font-bold text-balance">{course.title}</p>
              <Show when="signed-in">
                <p className="mt-1 text-small tabular-nums opacity-90">{progress}% complete</p>
              </Show>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between border-b border-line bg-surface px-4 py-4 text-body sm:px-8 lg:hidden has-focus-visible:outline-2 has-focus-visible:outline-amber">
            <input type="checkbox" className="peer sr-only" />
            Module {current.m + 1} of {modules.length}
            <ChevronDown aria-hidden className="size-5 text-muted transition-transform peer-checked:rotate-180" />
          </label>

          <ol className="max-lg:hidden max-lg:bg-surface max-lg:group-has-checked/nav:block lg:pb-3">
            {modules.map((module, m) => {
              const isCurrent = m === current.m;
              const seconds = module.lessons?.reduce((sum, l) => sum + (l.duration ?? 0), 0) ?? 0;
              return (
                <li key={module._key} className="border-b border-line last:border-b-0">
                  <details open={isCurrent} className="group/module">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 hover:bg-raised sm:px-8 lg:px-5 [&::-webkit-details-marker]:hidden">
                      <span className={cx("w-6 shrink-0 font-display text-h3 font-extrabold tabular-nums", isCurrent ? "text-amber" : "text-muted")}>
                        {m + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cx("block text-body font-semibold", !isCurrent && "text-ramp-9")}>{module.title}</span>
                        {seconds > 0 && <span className="mt-0.5 block text-small text-muted tabular-nums">{formatDuration(seconds)}</span>}
                      </span>
                      <ChevronDown aria-hidden className="size-4 shrink-0 text-muted transition-transform group-open/module:rotate-180" />
                    </summary>
                    <ol className="px-2 pb-3 sm:px-6 lg:px-2">
                      {module.lessons?.map((item, l) => {
                        const playing = item._id === lesson._id;
                        return (
                          <li key={item._id}>
                            <Link
                              href={lessonHref(item.slug)}
                              aria-current={playing ? "page" : undefined}
                              className={cx(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-body transition-colors",
                                playing ? "bg-raised text-ink" : "text-ramp-9 hover:bg-raised hover:text-ink",
                              )}
                            >
                              <span className={cx("w-8 shrink-0 text-small font-semibold tabular-nums", playing ? "text-amber" : "text-muted")}>
                                <span className="sr-only">{lessonLabel(m, l)}: </span>
                                <span aria-hidden>
                                  {m + 1}.{l + 1}
                                </span>
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block">{item.title}</span>
                                <span className={cx("mt-0.5 block text-small tabular-nums", playing ? "text-amber" : "text-muted")}>
                                  {playing ? "Now playing" : item.duration != null && formatDuration(item.duration)}
                                </span>
                              </span>
                              {playing && (
                                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-amber text-on-amber">
                                  <Play aria-hidden className="size-3 translate-x-px fill-current" />
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

        <div className="min-w-0 px-4 pt-8 sm:px-8 lg:px-0 lg:pt-0">
          <Breadcrumbs
            items={[
              { label: "All Courses", href: "/courses" },
              { label: course.title ?? "", href: courseHref },
              { label: currentModule.title ?? "" },
              { label: lesson.title ?? "" },
            ]}
          />

          <div className="mt-6 flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance">
                {lesson.title}
              </h1>
              {subtitle && <p className="mt-4 max-w-[62ch] text-body-lg text-muted">{subtitle}</p>}
              <p className="mt-4 flex flex-wrap gap-x-2 text-small text-muted tabular-nums">
                <span className="font-semibold text-amber">{lessonLabel(current.m, current.l)}</span>
                {[lesson.duration != null && formatDuration(lesson.duration), course.level && course.level[0].toUpperCase() + course.level.slice(1), lesson.studentCount != null && `${formatCount(lesson.studentCount)} students`]
                  .filter(Boolean)
                  .map((part, i) => (
                    <span key={i}>
                      <span aria-hidden className="mr-2">·</span>
                      {part}
                    </span>
                  ))}
              </p>
            </div>
            {/* Presentational only: bookmarks have no backend. */}
            <TrackedButton
              type="button"
              aria-label="Bookmark lesson"
              eventName="lesson_bookmarked"
              eventProperties={{ course_slug: course.slug, lesson_slug: lesson.slug }}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-raised text-amber transition-colors hover:bg-ramp-4"
            >
              <Bookmark aria-hidden className="size-5" />
            </TrackedButton>
          </div>

          <div className="mt-8 aspect-video overflow-hidden rounded-xl bg-ramp-0 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.8)]">
            {src ? (
              <iframe
                key={start}
                src={src}
                title={lesson.title ?? "Lesson video"}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                className="size-full border-0"
              />
            ) : (
              <p className="grid size-full place-items-center text-body text-muted">Video unavailable</p>
            )}
          </div>

          {lesson.duration != null && lesson.duration > 0 && (
            <section aria-labelledby="chapters" className="mt-6 rounded-xl bg-surface p-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="chapters" className="text-body font-semibold">
                  {chapters.length ? "Chapters" : "Lesson length"}
                </h2>
                <span className="text-small text-muted tabular-nums">{formatTimestamp(lesson.duration)}</span>
              </div>
              <GrooveBar duration={lesson.duration} at={start || null} chapters={chapters} className="mt-3" />
              {chapters.length > 0 && (
                <ol className="mt-4 grid gap-x-6 gap-y-0.5 sm:grid-cols-2">
                  {chapters.map((chapter) => {
                    const here = chapter === playingChapter;
                    return (
                      <li key={chapter.startSeconds}>
                        <Link
                          href={`${lessonHref(lesson.slug)}?t=${chapter.startSeconds}`}
                          scroll={false}
                          aria-current={here ? "true" : undefined}
                          className={cx(
                            "flex gap-3 rounded-md px-2 py-1.5 text-body transition-colors hover:bg-raised",
                            here ? "text-ink" : "text-ramp-9",
                          )}
                        >
                          <span className={cx("w-12 shrink-0 font-semibold tabular-nums", here ? "text-amber" : "text-muted")}>
                            {formatTimestamp(chapter.startSeconds)}
                          </span>
                          <span className="min-w-0">{chapter.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          )}

          <div className="group/tabs mt-10">
            <div className="flex gap-1 border-b border-line">
              {[
                ["content", "Lesson content"],
                ["notes", "Notes"],
              ].map(([id, label]) => (
                <label
                  key={id}
                  className="-mb-px cursor-pointer border-b-2 border-transparent px-4 pb-3 text-body font-semibold text-muted transition-colors hover:text-ink has-checked:border-amber has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-amber"
                >
                  <input type="radio" name="lesson-tab" id={`tab-${id}`} defaultChecked={id === "content"} className="sr-only" />
                  {label}
                </label>
              ))}
            </div>

            <div className="group-has-[#tab-notes:checked]/tabs:hidden">
              {notesBody.length > 0 && (
                <section aria-label="Lesson notes" className="border-b border-line py-6">
                  <div className="max-w-[62ch] text-body-lg text-ramp-9 [&>h3:first-child]:mt-0">
                    <PortableText value={notesBody} components={notesComponents} />
                  </div>
                </section>
              )}

              {!!lesson.keyPoints?.length && (
                <section aria-labelledby="key-points" className="pt-8">
                  <h2 id="key-points" className="font-display text-h3 font-bold">
                    In this lesson you will
                  </h2>
                  <ul className="mt-5 max-w-[62ch] space-y-3 text-body-lg text-ramp-9">
                    {lesson.keyPoints.map((point) => (
                      <li key={point} className="flex gap-3">
                        <CircleCheck aria-hidden className="mt-1 size-5 shrink-0 text-amber" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {lesson.proTip && (
                <aside className="mt-8 flex max-w-[70ch] gap-4 rounded-xl bg-amber/10 p-5">
                  <Lightbulb aria-hidden className="size-6 shrink-0 text-amber" />
                  <div>
                    <h2 className="text-body-lg font-semibold text-amber-hi">Pro tip</h2>
                    <p className="mt-2 text-body text-ramp-9">{lesson.proTip}</p>
                  </div>
                </aside>
              )}

              {!!lesson.resources?.length && (
                <section aria-labelledby="resources" className="mt-10 border-t border-line pt-8">
                  <h2 id="resources" className="font-display text-h3 font-bold">
                    Resources
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
            <div className="hidden py-10 text-body text-muted group-has-[#tab-notes:checked]/tabs:block">
              Personal notes are coming soon.
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
