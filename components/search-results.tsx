"use client";

import { useEffect, useMemo, useState, type FormEventHandler } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, CirclePlay, Clock, FileText, Folder, Play, Search, SquareArrowOutUpRight } from "lucide-react";
import { Card } from "@/components/cards/card";
import { captureEvent, TrackedLink } from "@/components/posthog-events";
import { SearchShortcut } from "@/components/search-shortcut";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDuration } from "@/lib/course";
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
      <p aria-live="polite" className="mt-4 text-center text-body-lg text-neutral-500">
        {!q
          ? "Type what you want to learn."
          : status === "loading"
            ? "Searching your courses…"
            : `Found ${results.length} ${plural(results.length, "result")} across ${courseCount} ${plural(courseCount, "course")}`}
      </p>

      <form action="/search" role="search" onSubmit={handleSubmit} className="mx-auto mt-8 max-w-3xl">
        <label htmlFor="search-page-input" className="sr-only">
          Search your learning
        </label>
        <SearchInput id="search-page-input" name="q" required minLength={2} maxLength={200} defaultValue={q} shortcut="⌘ K" className="[&_input]:h-14" />
        <SearchShortcut id="search-page-input" />
      </form>

      {q && (
        <section aria-label="Search results" className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-h3">
              {results.length} {plural(results.length, "result")}
            </h2>
            <Select
              aria-label="Sort results"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="w-full sm:w-48"
            >
              <option value="relevance">Most Relevant</option>
              <option value="course">Course A–Z</option>
              <option value="shortest">Shortest first</option>
            </Select>
          </div>

          <ol className="mt-4 flex flex-col gap-4">
            {sorted.map((result, i) => (
              <li key={`${result.kind}-${result.lessonSlug}-${result.courseSlug}`}>
                {result.kind === "video" ? <VideoResult result={result} position={i + 1} /> : <LessonResult result={result} position={i + 1} />}
              </li>
            ))}
            {status === "loading" && <ResultSkeleton />}
          </ol>

          {status === "done" && results.length === 0 && (
            <p className="mt-2 text-center text-body-lg text-neutral-700">No results for “{q}”.</p>
          )}
          {status === "error" && (
            <p className="mt-4 text-center text-body-lg text-neutral-700">
              Search failed.{" "}
              <a href={`/search?q=${encodeURIComponent(q)}`} className="text-primary-500 underline underline-offset-2">
                Try again
              </a>
            </p>
          )}
        </section>
      )}

      <div className="mt-6 flex flex-col items-start gap-4 rounded-lg border border-primary-100 bg-primary-100/40 p-5 sm:flex-row sm:items-center sm:px-7">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
          <Search aria-hidden className="size-6 text-primary-500" />
        </span>
        <div className="flex-1">
          <p className="text-body-lg font-medium text-neutral-900">Can’t find what you’re looking for?</p>
          <p className="text-body text-neutral-500">Try different keywords or browse our full course catalog.</p>
        </div>
        <Link href="/courses" className={buttonClasses("tertiary")}>
          Browse all courses
          <ArrowRight aria-hidden className="size-4 text-primary-500" />
        </Link>
      </div>
    </>
  );
}

function VideoResult({ result, position }: { result: SearchResult; position: number }) {
  const start = formatTimestamp(result.startSeconds ?? 0);
  return (
    <Card className="gap-5 p-4 md:flex-row">
      <Link
        href={result.href}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-md bg-neutral-900 md:w-72"
      >
        {result.thumbnail && <Image src={result.thumbnail} alt="" fill sizes="(min-width: 768px) 288px, 100vw" className="object-cover opacity-80" />}
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-white/90">
          <Play className="size-5 fill-neutral-900 text-neutral-900" />
        </span>
        <span className="absolute right-3 bottom-3 rounded-xs bg-neutral-900/85 px-2 py-0.5 text-small font-medium text-white">{start}</span>
      </Link>
      <ResultBody result={result} kind="video">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <FileText aria-hidden className="size-4" />
          {result.lessonLabel}
          <span aria-hidden>·</span>
          <Folder aria-hidden className="size-4" />
          {result.moduleTitle}
          <span aria-hidden>·</span>
          <Clock aria-hidden className="size-4" />
          {formatDuration(result.seconds)} clip
        </span>
        <ResultLink result={result} position={position}>
          <CirclePlay aria-hidden className="size-5" />
          Watch from {start}
        </ResultLink>
      </ResultBody>
    </Card>
  );
}

function LessonResult({ result, position }: { result: SearchResult; position: number }) {
  return (
    <Card className="gap-5 p-4 md:flex-row">
      <div className="flex w-full shrink-0 gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4 md:w-72">
        <FileText aria-hidden className="size-5 shrink-0 text-neutral-500" />
        <ul className="list-disc space-y-1.5 pl-4 text-body text-neutral-700">
          {result.keyPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <ResultBody result={result} kind="lesson">
        <span>{result.moduleLabel}</span>
        <ResultLink result={result} position={position}>
          View lesson
          <SquareArrowOutUpRight aria-hidden className="size-4" />
        </ResultLink>
      </ResultBody>
    </Card>
  );
}

function ResultBody({ result, kind, children }: { result: SearchResult; kind: SearchResult["kind"]; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-body text-neutral-700">
          {result.courseIcon && <Image src={result.courseIcon} alt="" width={20} height={20} className="size-5 shrink-0 rounded-xs object-cover" />}
          <span className="truncate">{result.courseTitle}</span>
        </p>
        <Badge kind={kind} />
      </div>
      <h3 className="text-h3 font-semibold">
        <Link href={result.href} className="hover:text-primary-500">
          {result.title}
        </Link>
      </h3>
      <p className="line-clamp-2 text-body text-neutral-500">{result.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2 text-small text-neutral-500">{children}</div>
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
      <ChevronRight aria-hidden className="size-4" />
    </TrackedLink>
  );
}

function ResultSkeleton() {
  return (
    <li aria-hidden>
      <Card className="animate-pulse gap-5 p-4 md:flex-row">
        <div className="aspect-video w-full rounded-md bg-neutral-100 md:w-72" />
        <div className="flex flex-1 flex-col gap-3 py-1">
          <div className="h-4 w-40 rounded-xs bg-neutral-100" />
          <div className="h-5 w-3/4 rounded-xs bg-neutral-100" />
          <div className="h-4 w-full rounded-xs bg-neutral-100" />
          <div className="h-4 w-2/3 rounded-xs bg-neutral-100" />
        </div>
      </Card>
    </li>
  );
}

const countCourses = (results: SearchResult[]) => new Set(results.map((r) => r.courseSlug)).size;
const plural = (n: number, word: string) => (n === 1 ? word : `${word}s`);
