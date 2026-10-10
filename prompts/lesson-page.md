# Vertex Lesson Page

## Goal

Add `/courses/[slug]/lessons/[lessonSlug]`, the lesson page from `design/vertex-lesson.png`, rendered on the server from seeded Sanity content. The lesson video plays on the page through the provider's own embed, and a `?t=<seconds>` query param starts it at that second.

## Inspected

- `sanity/queries.ts`: `LESSON_QUERY` (lesson + its course via reverse reference, scoped by `$courseSlug`) and `LESSON_PATHS_QUERY` already exist and are typed in `sanity.types.ts`.
- The course page already links lessons to `/courses/[slug]/lessons/[lessonSlug]`. That route is 404 today.
- Seed: 120 lessons, all with `https://www.youtube.com/watch?v=…` URLs, real durations, Portable Text `notes` (intro paragraph, an h2, bullets, outro), `keyPoints`, `proTip` and 1–3 `resources`. Seed lessons hold `thumbnail` and not the schema's `poster`, so `poster` is empty. The YouTube embed shows its own thumbnail, so this has no visible effect.
- Components to reuse: `PageFrame`, `Breadcrumbs`, `ResourceCard`, `ProgressBar`, `buttonClasses`, `TrackedLink`/`TrackedButton`, `cx`, and `formatDuration`/`formatCount`/`lessonLabel` from `lib/course.ts`. `PortableText` comes from `next-sanity` (already installed). The typography plugin is not installed, so blocks are styled through a small `components` map instead.
- There is no progress store yet, and the course page shows `0% complete` to signed-in users only.

## Decisions & assumptions

1. **Route:** `app/courses/[slug]/lessons/[lessonSlug]/page.tsx`, a server component. `generateStaticParams` comes from `LESSON_PATHS_QUERY`. An unknown lesson, or a lesson not in that course (`course == null`), returns `notFound()`. `generateMetadata` sets `"<lesson> · <course> · Vertex"`.
2. **Query:** extend `LESSON_QUERY`'s course projection with `level` (needed for the meta row), then regenerate types (`sanity typegen generate`, or a hand edit if the CLI isn't wired in `web`).
3. **Video (`lib/video.ts` + test):** `embedUrl(videoUrl, startSeconds)` parses the URL by provider:
   - YouTube (`watch?v=`, `youtu.be/`, `/embed/`): `https://www.youtube-nocookie.com/embed/{id}?start={t}&rel=0`
   - Vimeo: `https://player.vimeo.com/video/{id}#t={t}s`
   - Bunny (`iframe.mediadelivery.net/{embed|play}/{lib}/{id}`): `https://iframe.mediadelivery.net/embed/{lib}/{id}?t={t}`

   An unknown host returns `null`, and the page then shows a "Video unavailable" panel instead of an iframe. The player is a 16:9 `<iframe>` with the rounded black frame from the design. The design's custom control bar is the provider's own UI; no custom player is built (per AGENTS.md). `t` is parsed as a non-negative integer and anything else is ignored.
4. **Header:** breadcrumbs `All Courses › course › module title › lesson title`, a `LESSON 5.1` chip (same classes as `Badge`, derived label), the title, and a subtitle taken from the plain text of the first normal paragraph of `notes` (lessons have no summary field). Meta row: lesson duration, course level, lesson students. Missing values are omitted. The Bookmark icon button is presentational, as on the course page.
5. **Tabs:** CSS-only radio tabs (no client JS), following the "show all modules" checkbox pattern.
   - **Lesson Content:** Overview (the full `notes` Portable Text: paragraphs, h2/h3, bullet/number lists, links), "In this lesson you will:" (`keyPoints` with check-circle icons), the Pro Tip box (only if set) and Resources (a `ResourceCard` grid, 3 → 2 → 1 columns).
   - **Notes:** presentational only (per AGENTS.md: no backend). It shows a short empty state, "Personal notes are coming soon."

   ⚠ The seed notes repeat the key points as bullets, so they appear twice on the tab. This is a content issue, not a code issue. Say if you'd rather have Overview show only the notes' paragraphs.
6. **Sidebar (left column on `lg+`):** "Back to course", a course mini-card (cover thumbnail, title, and `0% complete` with a progress bar for signed-in users only), a "Module X of N" row, then every module as a numbered `<details>` row (title, summed duration, chevron). The current module is open and lists its lessons, with the current one marked "Now playing" and a play icon. The completion checkmarks from the design are omitted until the progress task exists.
7. **Mobile:** the sidebar moves above the content and collapses behind the "Module X of N" row (hidden checkbox toggle, closed by default under `lg`). The header stacks, resources go to one column, and there is no horizontal scroll at 375px.
8. **Bottom bar (`PageFrame` footer):** "Previous Lesson" / "Next Lesson" with the neighbour lesson's title and duration. Lessons are flattened across modules, so the last lesson of module 4 links to 5.1. A side is hidden at the first or last lesson.
9. **Analytics:** prev/next use `TrackedLink` (`lesson_navigated`, `{ course_slug, lesson_slug, direction }`). No other new events.

## Files

- `app/courses/[slug]/lessons/[lessonSlug]/page.tsx`: new (page + sidebar + tabs; split into a sibling file only if it gets unwieldy).
- `lib/video.ts`, `lib/video.test.ts`: new.
- `sanity/queries.ts`, `sanity.types.ts`: add `level` to the lesson query's course.

## Security

All content is fetched on the server through the existing server-only client, and no token reaches the browser. There are no writes. Embeds use provider iframes built from parsed ids (not raw author URLs) with `allow="autoplay; fullscreen; picture-in-picture; encrypted-media"`. YouTube uses the `youtube-nocookie` domain. Resource links open with `rel="noreferrer"` (already in `ResourceCard`).

## Acceptance criteria

- `/courses/nextjs-app-router-in-depth/lessons/nextjs-app-router-in-depth-file-system-routing` matches the design layout with real seeded content, and the YouTube video plays inline.
- Adding `?t=90` starts the video at 1:30.
- The sidebar shows all modules with the current one expanded and the current lesson marked "Now playing". Clicking another lesson navigates to it.
- Prev/next cross module boundaries. The first lesson has no Previous, and the last has no Next.
- A lesson slug under the wrong course, or an unknown slug, returns 404.
- At 375px the sidebar is collapsed above the content and nothing scrolls horizontally.

## Checks

- `node --test lib/*.test.ts`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (new route)

## Manual test

1. `npm run dev`, open the URL above and compare with `design/vertex-lesson.png`.
2. Press play: the video plays on the page, and the page does not open YouTube.
3. Append `?t=90` and reload: playback starts at 1:30.
4. Switch to the Notes tab and back.
5. Click "Next Lesson" through to lesson 2.1: the sidebar's open module changes.
6. Open `/courses/react-performance-engineering/lessons/nextjs-app-router-in-depth-file-system-routing`: 404.
7. Resize to ~375px: the sidebar collapses behind "Module X of N", and tapping it expands the list.
