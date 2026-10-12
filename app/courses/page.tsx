import type { Metadata } from "next";
import { CourseGrid } from "@/components/course-grid";
import { PageFrame } from "@/components/page-frame";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { sanityFetch } from "@/sanity/lib/client";
import { COURSES_QUERY } from "@/sanity/queries";

export const metadata: Metadata = { title: "All Courses · Vertex" };

export default async function CoursesPage() {
  const courses = await sanityFetch(COURSES_QUERY);

  return (
    <PageFrame>
      <section aria-labelledby="all-courses" className="px-4 pt-8 sm:px-8 sm:pt-10 xl:px-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "All Courses" }]} />
        <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 id="all-courses" className="font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-none font-extrabold tracking-[-0.035em]">
            All courses
          </h1>
          <p className="text-body text-muted tabular-nums">
            {courses.length} {courses.length === 1 ? "course" : "courses"} on the shelf
          </p>
        </div>
        {courses.length ? (
          <CourseGrid courses={courses} />
        ) : (
          <p className="mt-6 text-body-lg text-muted">No courses yet.</p>
        )}
      </section>
    </PageFrame>
  );
}
