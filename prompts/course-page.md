# Vertex Course Page

## Goal

Add `/courses/[slug]`, the course page from `design/vertex-course.png`, rendered on the server from seeded Sanity content: breadcrumbs, cover + hero (popular badge, title, summary, meta row, CTA + Bookmark), "What you'll learn", "Course Content" module list, and the bottom progress bar.

## Inspected

- `sanity/queries.ts`: `COURSE_QUERY` and `COURSE_SLUGS_QUERY` already exist; `sanity.types.ts` has `COURSE_QUERY_RESULT`. `sanityFetch` (server-only, 60s revalidate) and `urlFor` exist.
- `lib/course.ts`: `formatDuration`, `moduleLabel`, `lessonLabel` (+ test).
- Components to reuse: `SiteHeader`, `Breadcrumbs`, `Badge kind="popular"`, `buttonClasses`, `ProgressBar`, `cx`. Page frame (striped gutter, bordered canvas column, bottom bars) lives inline in `app/page.tsx`.
- Seed: 10 courses, 4 modules each, 3 lessons per module; cover images are 16:9 picsum photos uploaded as Sanity assets; outcome icons use the schema's lucide name list.
- No progress store, no bookmark model, no lesson route yet. `next.config.ts` has no image `remotePatterns`.

## Decisions & assumptions

1. **Route:** `app/courses/[slug]/page.tsx`, server component. `generateStaticParams` from `COURSE_SLUGS_QUERY`; unknown slug → `notFound()`. `generateMetadata` sets title + summary.
2. **Shared frame:** move the frame + header + decorative bars from `app/page.tsx` into `components/page-frame.tsx` and use it on both pages. Home looks unchanged.
3. **Meta row:** level (capitalised), total duration (`formatDuration(totalSeconds)`), `N modules`, students compacted (`18240` → `18.2k students`, `Intl.NumberFormat` compact). Missing values are omitted, never invented.
4. **Cover:** `next/image` from `urlFor(coverImage).width(560).height(500)`, square-ish crop like the design; add `cdn.sanity.io` to `images.remotePatterns`.
5. **Outcome icons:** a map from the 13 schema names to lucide components, `Sparkles` fallback.
6. **Course Content:** each module is a native `<details>` row: number, title, summary, module length (sum of its lesson durations), chevron. Expanded it lists lessons with `Lesson 1.2` labels, duration and a "Free preview" label, each linking to `/courses/[slug]/lessons/[lessonSlug]` (the lesson page task builds that route; 404 until then). First 6 modules shown; if more, a CSS-only "Show all N modules" toggle (hidden checkbox + label) reveals the rest. Seeded courses have 4 modules, so it won't appear with seed data.
7. **CTA:** "Start Learning" → first lesson of module 1. **No progress exists yet**, so there is no "Continue Learning" / resume state and the bottom bar shows `0% complete`. The bottom bar renders only for signed-in users (Clerk `<Show when="signed-in">`, keeps the page static). The progress task later swaps in real % + resume lesson and the "Continue Learning" label.
8. **Bookmark:** presentational button only (no bookmark model is in scope), like the notifications bell. Say if you'd rather hide it.
9. **Responsive:** hero stacks (cover above text) under `md`; outcomes grid 2 → 1 columns; module durations stay right-aligned; bottom bar stacks button under progress on mobile; no horizontal scroll at 375px.

## Files

- `app/courses/[slug]/page.tsx`: new.
- `components/page-frame.tsx`: new (extracted from home).
- `app/page.tsx`: use `PageFrame`.
- `lib/course.ts` (+ test): `formatCount` (compact student count).
- `next.config.ts`: `images.remotePatterns` for `cdn.sanity.io`.

## Security

Content is fetched only on the server through the existing server-only client; no token or Sanity call reaches the browser. No writes.

## Acceptance criteria

- `/courses/nextjs-app-router-in-depth` matches the design layout with real seeded content (title, summary, level, total length, 4 modules, students, 4 outcomes, module rows with summaries and lengths).
- Expanding a module shows its lessons in order with derived labels; "Start Learning" points at lesson 1.1.
- Popular badge only on popular courses; unknown slug → 404.
- Signed out: no progress bar. Signed in: progress bar at 0%.
- 375px: everything stacks, no horizontal scroll. Home page unchanged.

## Checks

- `node --test lib/*.test.ts`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (new route + config)

## Manual test

1. `npm run dev`, open http://localhost:3000/courses/nextjs-app-router-in-depth and compare with `design/vertex-course.png`.
2. Click a module row: it expands to its lessons; click again: collapses.
3. Open `/courses/react-performance-engineering`: no POPULAR badge.
4. Open `/courses/nope`: 404.
5. Sign in: the progress bar appears at the bottom.
6. Resize to ~375px: hero stacks, outcomes one column, no horizontal scroll.
7. Open `/`: unchanged.
