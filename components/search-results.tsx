"use client";

import { useEffect, useMemo, useState, type FormEventHandler } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleCheck, LoaderCircle, Play, Search } from "lucide-react";
import { Card } from "@/components/cards/card";
import { captureEvent, TrackedLink } from "@/components/posthog-events";
import { SearchShortcut } from "@/components/search-shortcut";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { GrooveBar } from "@/components/ui/groove-bar";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toneDot } from "@/components/ui/sleeve";
import { courseTone, formatDuration } from "@/lib/course";
import { formatTimestamp, type SearchResult } from "@/lib/search";

type Status = "loading" | "done" | "error";
type Sort = "relevance" | "course" | "shortest";

const sorters: Record<Sort, ((a: SearchResult, b: SearchResult) => number) | null> = {
  relevance: null,
  course: (a, b) => a.courseTitle.localeCompare(b.courseTitle),
  shortest: (a, b) => a.seconds - b.seconds,
};

/** Search form, streamed result cards, count line, sort and the catalog fallback. Remount per query (`key={q}`). */
export function SearchResults({ q }: { q: string }) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<Status>(q ? "loading" : "done");
  const [sort, setSort] = useState<Sort>("relevance");

  useEffect(() => {
    if (!q) return;
    const controller = new AbortController();

    (async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
      if (!res.ok || !res.body) throw new Error(`search ${res.status}`);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      const found: SearchResult[] = [];
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines.filter(Boolean)) {
          const item = JSON.parse(line) as SearchResult | { error: string };
          if ("error" in item) throw new Error(item.error);
          found.push(item);
          setResults([...found]);
        }
      }
      setStatus("done");
      captureEvent("search_completed", { result_count: found.length, course_count: countCourses(found) });
    })().catch(() => {
      if (!controller.signal.aborted) setStatus("error");
    });

    return () => controller.abort();
  }, [q]);

  const sorted = useMemo(() => {
    const compare = sorters[sort];
    return compare ? [...results].sort(compare) : results;
  }, [results, sort]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = () => captureEvent("search_submitted", { source: "search" });
  const courseCount = countCourses(results);

  return (
    <>
      <p aria-live="polite" className="mt-4 text-body-lg text-muted tabular-nums">
        {!q
          ? "Type what you want to learn."
          : status === "loading"
            ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle aria-hidden className="size-5 animate-spin text-amber" />
                  Searching your courses…
                </span>
              )
            : `Found ${results.length} ${plural(results.length, "result")} across ${courseCount} ${plural(courseCount, "course")}`}
      </p>

      <form action="/search" role="search" onSubmit={handleSubmit} className="mt-8 max-w-3xl">
        <label htmlFor="search-page-input" className="sr-only">
          Search your learning
        </label>
        <SearchInput id="search-page-input" name="q" required minLength={2} maxLength={200} defaultValue={q} shortcut="⌘ K" className="[&_input]:h-14 [&_input]:bg-raised" />
        <SearchShortcut id="search-page-input" />
      </form>

      {q && (
        <section aria-label="Search results" className="mt-12">
          <div className="flex items-center justify-end gap-3 border-b border-line pb-4">
            <span aria-hidden className="text-small text-muted">Ranked by</span>
            <Select
              aria-label="Sort results"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="w-full sm:w-52"
            >
              <option value="relevance">Most relevant</option>
              <option value="course">Course A–Z</option>
              <option value="shortest">Shortest first</option>
            </Select>
          </div>

          <ol className="mt-6 flex flex-col gap-4">
            {sorted.map((result, i) => (
              <li key={`${result.kind}-${result.lessonSlug}-${result.courseSlug}`}>
                {result.kind === "video" ? <VideoResult result={result} position={i + 1} /> : <LessonResult result={result} position={i + 1} />}
              </li>
            ))}
            {status === "loading" && <ResultSkeleton />}
          </ol>

          {status === "done" && results.length === 0 && (
            <p className="mt-2 text-body-lg text-ramp-9">No results for “{q}”.</p>
          )}
          {status === "error" && (
            <p className="mt-4 text-body-lg text-ramp-9">
              Search failed.{" "}
              <a href={`/search?q=${encodeURIComponent(q)}`} className="text-amber underline decoration-amber/40 hover:decoration-amber">
                Try again
              </a>
            </p>
          )}
        </section>
      )}

      <div className="mt-10 flex flex-col items-start gap-4 rounded-xl bg-surface p-5 sm:flex-row sm:items-center sm:px-7">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-amber/15">
          <Search aria-hidden className="size-5 text-amber" />
        </span>
        <div className="flex-1">
          <p className="text-body-lg font-semibold">Can’t find what you’re looking for?</p>
          <p className="text-body text-muted">Try different keywords or browse the full course catalog.</p>
        </div>
        <Link href="/courses" className={buttonClasses("tertiary")}>
          Browse all courses
          <ArrowRight aria-hidden className="size-4 text-amber" />
        </Link>
      </div>
    </>
  );
}

function VideoResult({ result, position }: { result: SearchResult; position: number }) {
  const start = result.startSeconds ?? 0;
  const at = formatTimestamp(start);
  return (
    <Card className="gap-5 p-3 transition-colors hover:bg-raised sm:p-4 md:flex-row md:gap-6">
      <Link
        href={result.href}
        tabIndex={-1}
        aria-hidden
        className="group/thumb relative block aspect-video w-full shrink-0 self-start overflow-hidden rounded-lg bg-ramp-0 md:w-72"
      >
        {result.thumbnail && (
          <Image
            src={result.thumbnail}
            alt=""
            fill
            sizes="(min-width: 768px) 288px, 100vw"
            className="object-cover transition-transform duration-700 ease-out-expo group-hover/thumb:scale-[1.03]"
          />
        )}
        <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-full bg-amber text-on-amber">
          <Play className="size-4 translate-x-px fill-current" />
        </span>
        <span className="absolute right-3 bottom-3 rounded-xs bg-ramp-0/85 px-1.5 text-small font-semibold text-ink tabular-nums">
          {formatDuration(result.seconds)} clip
        </span>
      </Link>
      <ResultBody result={result} kind="video" quote={result.description}>
        <GrooveBar duration={result.lessonSeconds} at={start} span={[start, start + result.seconds]} className="mt-1" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-small text-muted">
          <span className="min-w-0 truncate">{result.moduleTitle}</span>
          <ResultLink result={result} position={position}>
            <Play aria-hidden className="size-3.5 fill-current" />
            Play from {at}
          </ResultLink>
        </div>
      </ResultBody>
    </Card>
  );
}

function LessonResult({ result, position }: { result: SearchResult; position: number }) {
  return (
    <Card className="gap-5 p-3 transition-colors hover:bg-raised sm:p-4 md:flex-row md:gap-6">
      {result.keyPoints.length > 0 && (
        <ul className="flex w-full shrink-0 flex-col gap-2.5 self-start rounded-lg bg-ground/60 p-4 text-body text-ramp-9 md:w-72">
          {result.keyPoints.map((point) => (
            <li key={point} className="flex gap-2.5">
              <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-lesson" />
              {point}
            </li>
          ))}
        </ul>
      )}
      <ResultBody result={result} kind="lesson" quote={result.description}>
        <GrooveBar duration={result.lessonSeconds} className="mt-1" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-small text-muted">
          <span className="tabular-nums">
            {result.moduleLabel} · {formatDuration(result.seconds)}
          </span>
          <ResultLink result={result} position={position}>
            Open lesson
            <ArrowRight aria-hidden className="size-4" />
          </ResultLink>
        </div>
      </ResultBody>
    </Card>
  );
}

function ResultBody({
  result,
  kind,
  quote,
  children,
}: {
  result: SearchResult;
  kind: SearchResult["kind"];
  quote: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 md:py-1">
      <div className="flex items-start justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-small text-muted">
          <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${toneDot[courseTone(result.courseSlug)]}`} />
          <span className="truncate">{result.courseTitle}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0 font-semibold text-ink tabular-nums">{result.lessonLabel.replace("Lesson ", "")}</span>
          <span className="sr-only">{result.lessonLabel}</span>
        </p>
        <Badge kind={kind} />
      </div>
      <h3 className="font-display text-h2 leading-tight font-bold tracking-[-0.015em]">
        <Link href={result.href} className="rounded-xs hover:text-amber-hi">
          {result.title}
        </Link>
      </h3>
      <p className="line-clamp-2 max-w-[70ch] text-body text-muted">
        {kind === "video" && result.startSeconds != null && (
          <span className="font-semibold text-ramp-9">At {formatTimestamp(result.startSeconds)}: </span>
        )}
        {kind === "video" ? `“${quote}”` : quote}
      </p>
      <div className="mt-auto flex flex-col gap-3">{children}</div>
    </div>
  );
}

function ResultLink({ result, position, children }: { result: SearchResult; position: number; children: React.ReactNode }) {
  return (
    <TrackedLink
      href={result.href}
      eventName="search_result_clicked"
      eventProperties={{ kind: result.kind, position, course_slug: result.courseSlug, lesson_slug: result.lessonSlug }}
      className={buttonClasses("text")}
    >
      {children}
    </TrackedLink>
  );
}

function ResultSkeleton() {
  return (
    <li aria-hidden>
      <Card className="animate-pulse gap-5 p-4 md:flex-row">
        <div className="aspect-video w-full rounded-lg bg-raised md:w-72" />
        <div className="flex flex-1 flex-col gap-3 py-1">
          <div className="h-4 w-40 rounded-full bg-raised" />
          <div className="h-6 w-3/4 rounded-full bg-raised" />
          <div className="h-4 w-full rounded-full bg-raised" />
          <div className="mt-auto h-2.5 w-full rounded-full bg-raised" />
        </div>
      </Card>
    </li>
  );
}

const countCourses = (results: SearchResult[]) => new Set(results.map((r) => r.courseSlug)).size;
const plural = (n: number, word: string) => (n === 1 ? word : `${word}s`);
