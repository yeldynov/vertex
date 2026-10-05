import { defineQuery } from "next-sanity";

// Card-sized course fields; counts and total length are derived, never stored.
const COURSE_CARD = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  summary,
  coverImage,
  level,
  price,
  popular,
  studentCount,
  "moduleCount": count(modules),
  "lessonCount": count(modules[].lessons[]),
  "totalSeconds": math::sum(modules[].lessons[]->duration),
  category->{ title, "slug": slug.current },
  instructor->{ name, "slug": slug.current }
`;

export const COURSES_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] | order(popular desc, title asc) { ${COURSE_CARD} }
`);

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category" && defined(slug.current)] | order(title asc) { _id, title, "slug": slug.current, description }
`);

export const COURSE_QUERY = defineQuery(`
  *[_type == "course" && slug.current == $slug][0] {
    ${COURSE_CARD},
    learningOutcomes[] { _key, icon, title, description },
    instructor->{ name, "slug": slug.current, photo, expertise },
    modules[] {
      _key,
      title,
      summary,
      lessons[]->{ _id, title, "slug": slug.current, duration, freePreview }
    }
  }
`);

// A lesson has no parent field: its course is found by reverse reference.
export const LESSON_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $lessonSlug][0] {
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    poster,
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources[] { _key, type, title, description, url },
    "course": *[_type == "course" && slug.current == $courseSlug && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      coverImage,
      instructor->{ name, "slug": slug.current, photo, expertise },
      modules[] {
        _key,
        title,
        lessons[]->{ _id, title, "slug": slug.current, duration, freePreview }
      }
    }
  }
`);

export const INSTRUCTOR_QUERY = defineQuery(`
  *[_type == "instructor" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    photo,
    expertise,
    bio,
    "courses": *[_type == "course" && references(^._id)] | order(title asc) { ${COURSE_CARD} }
  }
`);

export const COURSE_SLUGS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)].slug.current
`);

export const LESSON_PATHS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] {
    "courseSlug": slug.current,
    "lessonSlugs": modules[].lessons[]->slug.current
  }
`);
