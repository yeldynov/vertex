import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { CourseCard } from "@/components/cards/course-card";
import { SearchShortcut } from "@/components/search-shortcut";
import { SiteHeader } from "@/components/site-header";
import { buttonClasses } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";

// ponytail: static placeholder until the Sanity content model lands; swap for a server-side course query.
const courses = [
  {
    slug: "nextjs-for-production",
    icon: "/courses/nextjs.svg",
    title: "Next.js for Production",
    description: "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate",
    duration: "18h 24m",
    moduleCount: 12,
  },
  {
    slug: "docker-essentials",
    icon: "/courses/docker.svg",
    title: "Docker Essentials",
    description: "Containerize applications and streamline your development workflow.",
    level: "Beginner",
    duration: "10h 12m",
    moduleCount: 8,
  },
  {
    slug: "typescript-deep-dive",
    icon: "/courses/typescript.svg",
    title: "TypeScript Deep Dive",
    description: "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate",
    duration: "14h 36m",
    moduleCount: 10,
  },
];

// Decorative bottom bars: [left %, width %, height px, opacity]
const bars = [
  [0, 8, 90, 0.5], [7, 7, 120, 0.7], [13, 5, 150, 0.85], [17, 6, 190, 1], [23, 10, 130, 0.75], [32, 7, 100, 0.55],
  [49, 4, 60, 0.35], [52, 9, 110, 0.6], [60, 8, 140, 0.8], [67, 6, 150, 0.9], [72, 6, 190, 1], [77, 6, 95, 0.6],
  [83, 5, 135, 0.8], [88, 12, 170, 0.95],
];

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-[repeating-linear-gradient(135deg,var(--color-neutral-200)_0_1px,transparent_1px_10px)] sm:px-7">
      <div className="relative flex w-full min-w-0 max-w-[1440px] flex-col overflow-hidden bg-canvas sm:border-x sm:border-neutral-200">
        <SiteHeader />

        <main className="flex-1">
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
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map(({ slug, icon, ...course }) => (
                <li key={slug} className="flex min-w-0 *:flex-1">
                  <CourseCard
                    {...course}
                    layout="stacked"
                    href={`/courses/${slug}`}
                    icon={<Image src={icon} alt="" width={72} height={72} className="size-full" />}
                  />
                </li>
              ))}
            </ul>
          </section>

          <p className="mx-4 mt-16 flex items-center gap-5 text-body-lg text-neutral-700 sm:mx-13 xl:mx-20">
            <span aria-hidden className="h-px flex-1 bg-neutral-200" />
            <Star aria-hidden className="size-6 shrink-0 text-primary-500" strokeWidth={1.5} />
            <span className="text-center">New courses and lessons added every week.</span>
            <span aria-hidden className="h-px flex-1 bg-neutral-200" />
          </p>
        </main>

        <div aria-hidden className="relative mt-4 h-48">
          {bars.map(([left, width, height, opacity]) => (
            <span
              key={left}
              className="absolute bottom-0 bg-linear-to-t from-primary-300 to-primary-100/0"
              style={{ left: `${left}%`, width: `${width}%`, height, opacity }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
