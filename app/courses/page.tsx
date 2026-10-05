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
      <section aria-labelledby="all-courses" className="px-4 pt-8 sm:px-13 sm:pt-10 xl:px-20">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "All Courses" }]} />
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
          <h1 id="all-courses" className="font-display text-h1 font-medium">
            All Courses
          </h1>
          <p className="text-body text-neutral-500">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </p>
        </div>
        {courses.length ? (
          <CourseGrid courses={courses} />
        ) : (
          <p className="mt-6 text-body-lg text-neutral-500">No courses yet.</p>
        )}
      </section>
    </PageFrame>
  );
}
