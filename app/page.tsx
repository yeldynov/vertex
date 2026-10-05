import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { CourseGrid } from "@/components/course-grid";
import { SearchShortcut } from "@/components/search-shortcut";
import { PageFrame } from "@/components/page-frame";
import { buttonClasses } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { sanityFetch } from "@/sanity/lib/client";
import { COURSES_QUERY } from "@/sanity/queries";

export default async function Home() {
  const courses = (await sanityFetch(COURSES_QUERY)).slice(0, 3);

  return (
    <PageFrame>
      <section className="border-b border-neutral-200 px-4 pt-14 pb-12 text-center sm:px-10 sm:pt-17 sm:pb-14">
        <p className="inline-block rounded-sm border border-primary-200 bg-primary-100/40 px-4 py-2 text-small font-semibold tracking-[0.2em] text-primary-600 uppercase">
          Intelligent learning
        </p>
        <h1 className="mx-auto mt-8 max-w-2xl font-display text-display-1 font-medium tracking-tight md:text-[4rem] md:leading-[4.5rem]">
          Search your learning <br className="max-md:hidden" />
          in plain English.
        </h1>
        <p className="mx-auto mt-7 max-w-md text-body-lg text-neutral-500 sm:text-[1.25rem] sm:leading-8">
          Vertex understands what you want to learn and finds the exact lessons across all your courses.
        </p>
        <Link href="/courses" className={`${buttonClasses("primary", "lg")} mt-9 h-14 px-6 text-h3 font-normal shadow-md`}>
          Explore Courses
          <ArrowRight aria-hidden className="size-5" />
        </Link>
        <form action="/search" role="search" className="mx-auto mt-11 max-w-3xl xl:max-w-4xl text-left">
          <label htmlFor="home-search" className="sr-only">
            Search your learning
          </label>
          <SearchInput id="home-search" name="q" required placeholder="Ask anything about your learning..." shortcut="⌘ K" large />
          <SearchShortcut id="home-search" />
        </form>
      </section>

      <section aria-labelledby="all-courses" className="px-4 pt-14 sm:px-13 xl:px-20">
        <div className="flex items-center justify-between gap-4">
          <h2 id="all-courses" className="font-display text-h1 font-medium">
            All Courses
          </h2>
          <Link href="/courses" className={buttonClasses("text")}>
            View all courses
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <CourseGrid courses={courses} />
      </section>

      <p className="mx-4 mt-16 flex items-center gap-5 text-body-lg text-neutral-700 sm:mx-13 xl:mx-20">
        <span aria-hidden className="h-px flex-1 bg-neutral-200" />
        <Star aria-hidden className="size-6 shrink-0 text-primary-500" strokeWidth={1.5} />
        <span className="text-center">New courses and lessons added every week.</span>
        <span aria-hidden className="h-px flex-1 bg-neutral-200" />
      </p>
    </PageFrame>
  );
}
