# Sanity Content Model + Studio + Server Data Layer

## Goal

Add the Vertex content model (course, module, lesson, instructor, category) in a **standalone** Sanity Studio, deploy it, and give the Next.js app a server-only read client plus typed GROQ queries for the pages that come next (catalog, course, lesson, instructor).

## Inspected

- Next.js 16.3.8 app lives at the repo root (this is the `web` workspace; no `web/` folder).
- Uncommitted `sanity init` output: **embedded** Studio at `app/studio/[[...tool]]`, root `sanity.config.ts` / `sanity.cli.ts`, `sanity/` (env, empty schema, structure, `client.ts`, `image.ts`, `live.ts`), deps `sanity`, `@sanity/vision`, `styled-components`, `next-sanity`, `@sanity/image-url`.
- `.env.local` has `NEXT_PUBLIC_SANITY_PROJECT_ID=fnoefmck`, `NEXT_PUBLIC_SANITY_DATASET=production`. No read token. Sanity CLI is logged in.
- `components/cards/*` show what pages need: course icon/title/summary/level/duration/module count, lesson + module labels, resource type/title/description/url.
- Home page uses a static course array marked for replacement.

## Decisions & assumptions

1. **Un-embed the Studio** (AGENTS.md: never embed). Delete `app/studio/`, root `sanity.config.ts`, `sanity.cli.ts`, `sanity/structure.ts`, `sanity/schemaTypes/`, `sanity/lib/live.ts`; remove `sanity`, `@sanity/vision`, `styled-components` from the root `package.json`.
2. **New `studio/` workspace** (own `package.json`, `sanity` v5, `@sanity/vision`, `react`, `react-dom`, `styled-components`). Env in `studio/.env` as `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` (+ `studio/.env.example`). Root `tsconfig`/eslint exclude `studio/`. Next app stays at the root — moving it into `web/` is a separate refactor.
3. **Schema** (`studio/schemaTypes/{documents,objects}`), every field via `defineField`, icons from `@sanity/icons/<Name>`:
   - `category`: title*, slug*, description.
   - `instructor`: name*, slug*, photo (hotspot), expertise (string), bio (Portable Text).
   - `lesson`: title*, slug*, videoUrl* (url, validated YouTube / Vimeo / Bunny host), poster (image), duration* (seconds, integer), freePreview (boolean, label only), studentCount (integer), notes (Portable Text), keyPoints (string[]), proTip (text), resources (`resource[]`). **No course field.**
   - `course`: title*, slug*, summary*, coverImage* (the course icon on cards), level* (beginner/intermediate/advanced, radio), price (number ≥ 0, USD; 0 = free), popular (boolean), studentCount (integer), learningOutcomes (`learningOutcome[]`), instructor* (ref), category* (ref), modules* (`module[]`).
   - objects: `module` (title*, summary, lessons* = ordered lesson refs, unique), `learningOutcome` (icon from a fixed list of lucide names, title*, description), `resource` (type: article/docs/repo/download/video, title*, description, url*).
   - Studio previews show derived counts (e.g. course subtitle "8 modules · Intermediate"). No stored labels like "Module 5".
   - `video`, `agent context` and `progress` types are **not** part of this task (later ingestion/search/progress tasks).
4. **Studio structure**: Courses, Lessons, Instructors, Categories. Vision tool kept in Studio.
5. **Deploy**: `sanity schema deploy` + `sanity deploy` (hostname `jsm-vertex`, fallback suffix if taken; appId written to `studio/sanity.cli.ts`). Set dataset `production` to **private**.
6. **Server read client** (`sanity/lib/client.ts`): `import "server-only"`, `createClient` from `next-sanity` with `token: SANITY_API_READ_TOKEN`, `useCdn: true`, `perspective: "published"`. A `sanityFetch(query, params)` helper uses `next: { revalidate: 60 }`. Env renamed to non-public `SANITY_PROJECT_ID` / `SANITY_DATASET` / `SANITY_API_READ_TOKEN` (only Clerk + PostHog keys may be public). `image.ts` stays (server-side URL building) and imports `server-only` too.
7. **Read token**: I create a Viewer token with `sanity tokens add "web-read" --role=viewer` and write it straight into `.env.local` (never printed).
8. **Queries** (`sanity/queries.ts`, `defineQuery`), derived values computed in GROQ:
   - `COURSES_QUERY`: catalog cards (title, slug, summary, coverImage, level, price, popular, studentCount, moduleCount, lessonCount, totalSeconds, category, instructor name/slug).
   - `CATEGORIES_QUERY`.
   - `COURSE_QUERY($slug)`: full course + instructor + category + modules[] {_key, title, summary, lessons[]-> {title, slug, duration, freePreview}}.
   - `LESSON_QUERY($courseSlug, $lessonSlug)`: lesson + its course found by reverse reference `*[_type=="course" && slug.current==$courseSlug && references(^._id)][0]`, with the course's modules (for sidebar + prev/next).
   - `INSTRUCTOR_QUERY($slug)`: instructor + their courses.
   - `COURSE_SLUGS` / `LESSON_PATHS` for `generateStaticParams` later.
9. **Labels/durations helpers** (`lib/course.ts`): `moduleLabel(i)` → "Module 5", `lessonLabel(m, l)` → "Lesson 5.1", `formatDuration(seconds)` → "18h 24m". With one tiny assert check.
10. **TypeGen**: `studio/sanity.cli.ts` `typegen` reads `../sanity/**/*.ts`, writes `../sanity.types.ts`; script `npm run typegen` in studio. Query results are typed via the generated types.
11. **No seed content and no page wiring** in this task. The home page keeps its placeholder; catalog/course/lesson tasks consume these queries.

## Files

- Delete: `app/studio/`, `sanity.config.ts`, `sanity.cli.ts`, `sanity/structure.ts`, `sanity/schemaTypes/`, `sanity/lib/live.ts`.
- `package.json` / lock: drop studio deps.
- New `studio/`: `package.json`, `sanity.config.ts`, `sanity.cli.ts`, `structure.ts`, `schemaTypes/**`, `tsconfig.json`, `.env.example`.
- `sanity/env.ts`, `sanity/lib/client.ts`, `sanity/lib/image.ts`: server-only rewrite. New `sanity/queries.ts`, `sanity.types.ts` (generated), `lib/course.ts` (+ check).
- `.env.example`: add Sanity vars. `.env.local`: rename vars, add token (local only). `tsconfig.json` / `eslint.config.mjs`: exclude `studio`.

## Security

- Read token only in server env; client modules import `server-only` so a client import fails the build.
- No `NEXT_PUBLIC_SANITY_*` vars; dataset set to private. No write token in this task.
- Studio env vars contain only project id + dataset (public by nature, not secrets).

## Acceptance criteria

- `cd studio && npm run dev` opens the Studio at localhost:3333 with the four types; all required/validation rules work; module/lesson ordering is drag-and-drop.
- Deployed Studio URL loads; `sanity schema deploy` succeeds.
- Root app no longer contains Studio code or deps; `/studio` 404s.
- Queries run against the live dataset with the token (empty results are fine) and type-check.

## Checks

- studio: `npx tsc --noEmit`, `sanity schema deploy`, `sanity deploy`, `sanity typegen generate`.
- web: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `node --experimental-strip-types lib/course.test.ts`.
- Live query: run each query once via a scratch script with the server client.

## Manual test

1. `cd studio && npm run dev`, open http://localhost:3333.
2. Create a category, an instructor, two lessons (YouTube URL), then a course with one module holding both lessons. Try a non-video URL on a lesson: validation error.
3. Publish all; reorder lessons in the module by drag.
4. Open the deployed Studio URL and confirm the same content.
5. In Vision run `*[_type=="course"]{title, "modules": count(modules)}`.
6. In the repo root `npm run dev`: home still renders; `/studio` returns 404.
