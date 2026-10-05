# Home Courses from Sanity

## Goal

Swap the three hard-coded courses in the home page's "All Courses" grid for seeded Sanity courses.

## Inspected

- `app/page.tsx`: static `courses` array marked `ponytail: static placeholder`; the icons come from `public/courses/*.svg`.
- `sanity/queries.ts`: `COURSES_QUERY` (ordered popular first, then by title) already returns title, slug, summary, coverImage, level, `moduleCount` and `totalSeconds`.
- `sanityFetch` and `urlFor` are server-only; `formatDuration` is in `lib/course.ts`. `cdn.sanity.io` is already allowed for `next/image`.

## Decisions & assumptions

1. The home page becomes an async server component that fetches `COURSES_QUERY` and shows the **first 3** courses (popular ones first), as in the design. "View all courses" still links to `/courses`.
2. Card icon: `next/image` of `urlFor(coverImage).width(144).height(144).fit("crop")`, at the same 72px size. The seeded covers are photos, so the cards show photo thumbnails rather than the N / whale / TS logos until real logo covers are uploaded in the Studio.
3. Level is capitalised (`intermediate` → `Intermediate`), duration is `formatDuration(totalSeconds)` and the module count is `moduleCount`. Missing values fall back to empty or 0 and are never invented.
4. Delete the now-unused `public/courses/{nextjs,docker,typescript}.svg`.
5. `CourseCard` is unchanged.

## Files

- `app/page.tsx`
- `public/courses/*.svg` (delete)

## Security

Reads go through the existing server-only client; no token reaches the browser.

## Acceptance criteria

- `/` shows 3 seeded courses (title, summary, level, length, module count, cover thumbnail) linking to `/courses/<seeded slug>`, and each link opens a working course page.
- Layout is unchanged at desktop and mobile widths.

## Checks

- `npx tsc --noEmit`, `npm run lint`, `npm run build`

## Manual test

1. Open http://localhost:3000: the cards show seeded courses.
2. Click a card: its course page loads (not a 404).
3. Edit a course title in the Studio: the home page updates within about 60s.
