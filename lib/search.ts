import type { SEARCH_HIT_QUERY_RESULT } from "@/sanity.types";
import { lessonLabel, moduleLabel } from "./course.ts";

/** What the model may claim: only an id and a second. Everything else is looked up. */
export type SearchHit = { kind: "video" | "lesson"; lessonId: string; startSeconds: number | null };

/** A grounded result card: every field comes from Sanity. Sent to the browser as one NDJSON line. */
export type SearchResult = {
  kind: "video" | "lesson";
  href: string;
  title: string;
  description: string;
  courseTitle: string;
  courseSlug: string;
  courseIcon: string | null;
  lessonSlug: string;
  lessonLabel: string;
  moduleLabel: string;
  moduleTitle: string;
  keyPoints: string[];
  thumbnail: string | null;
  startSeconds: number | null;
  /** Clip length for a video moment, lesson length for a lesson. */
  seconds: number;
};

type Image = NonNullable<NonNullable<SEARCH_HIT_QUERY_RESULT>["poster"]>;

/** Card for a hit, or null when the lesson, its course, or the claimed video second doesn't check out. */
export function groundHit(
  hit: SearchHit,
  lesson: SEARCH_HIT_QUERY_RESULT,
  imageUrl: (image: Image, width: number, height: number) => string,
): SearchResult | null {
  const course = lesson?.course;
  if (!lesson?.title || !lesson.slug || !course?.title || !course.slug) return null;

  const modules = course.modules ?? [];
  const m = modules.findIndex((mod) => mod.lessonIds?.includes(lesson._id));
  if (m < 0) return null;
  const l = modules[m].lessonIds!.indexOf(lesson._id);

  const href = `/courses/${course.slug}/lessons/${lesson.slug}`;
  const duration = lesson.duration ?? 0;
  const cover = lesson.poster?.asset ? lesson.poster : course.coverImage?.asset ? course.coverImage : null;
  const card = {
    title: lesson.title,
    courseTitle: course.title,
    courseSlug: course.slug,
    courseIcon: course.coverImage?.asset ? imageUrl(course.coverImage, 48, 48) : null,
    lessonSlug: lesson.slug,
    lessonLabel: lessonLabel(m, l),
    moduleLabel: moduleLabel(m),
    moduleTitle: modules[m].title ?? "",
    keyPoints: (lesson.keyPoints ?? []).slice(0, 3),
    thumbnail: cover && imageUrl(cover, 480, 270),
  };

  if (hit.kind === "lesson") {
    return { ...card, kind: "lesson", href, description: lesson.excerpt, startSeconds: null, seconds: duration };
  }

  // A video second only counts if a chapter (preferred) or transcript chunk really starts there.
  const t = hit.startSeconds;
  const video = lesson.video;
  const text = video?.chapter ?? video?.chunk;
  if (t == null || !video || !text) return null;
  const next = (video.chapter ? video.nextChapter : video.nextChunk) ?? duration;
  return { ...card, kind: "video", href: `${href}?t=${t}`, description: text, startSeconds: t, seconds: Math.max(0, next - t) };
}

/** 765 → "12:45", 3725 → "1:02:05". */
export function formatTimestamp(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(Math.floor(seconds % 60)).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}
