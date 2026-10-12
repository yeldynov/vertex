# Redesign: "Listening Room" visual world

## Goal
Replace the incumbent look (cream canvas, Playfair serif, orange) with the chosen direction **Listening Room** across the design system and every web route: home, catalog, course, lesson, search, design-system. It is dark, warm and image-rich. Routes, server/client boundaries, auth, analytics events and a11y semantics stay as they are. Direction contract: `.impeccable/surfaces/app-page-tsx.md`. This replaces the rejected "The Index" branch, which stays untouched on `redesign/the-index`. Work happens on `redesign/listening-room`.

## Decisions and assumptions
- The user asked for the redesign, so it overrides the AGENTS.md "reproduce the provided designs exactly / do not restyle" rule for this task. PRODUCT.md already releases `design/*.png` as historical. Update its Brand Commitments line to name "Listening Room" in place of "The Index".
- **Tokens (`app/globals.css`):** keep the token *names* (`primary-*`, `neutral-*`, `canvas`, `success`, `lesson*`) so class names barely churn, and remap the values:
  - `neutral-*` becomes one warm 11-step ramp, inverted for dark. `neutral-900` is the lightest ink (#F4EBDD) and `neutral-50` is the darkest surface. Every neutral comes from this ramp.
  - `primary-*` becomes amber, with #F2A541 as the action/needle/focus colour. Text on amber is dark (#1A120A).
  - `canvas` becomes the espresso ground (#15110E). Add a `--color-surface-1/2/3` step for raised panels in place of shadows.
  - `body` gets `color-scheme: dark`.
- **Course tones:** six sleeve tones (oxblood, teal, mustard, violet, olive, rust), each with an AA "on" text colour. `courseTone(slug)` in `lib/course.ts` hashes the slug so the tone is stable on every page with no schema change. ponytail: two courses can share a tone; add a schema colour field if that matters.
- **Fonts:** load Bricolage Grotesque (display, 800, optical size) and Hanken Grotesk (text) via `next/font/google`, replacing Inter and Playfair. Tabular figures apply to times and counts.
- **Sleeve (course art):** the Sanity cover image is printed as a duotone in the course tone (grayscale + `mix-blend-mode: multiply` over the tone field), with the title set on the sleeve. This unifies the mismatched placeholder covers. A vinyl disc edge (pure CSS radial) slides out on hover/focus; reduced motion keeps it static. Lesson posters and video thumbnails keep their full colour.
- **Signature component `components/ui/groove-bar.tsx`:** a bar drawn to the lesson's real length. It takes optional chapter ticks, an optional highlighted clip span, and an amber needle at a second with a time label. It has a text equivalent for screen readers ("at 1:20 of 12:48"). It is used on:
  - search video results (needle at `startSeconds`, clip span highlighted)
  - home "Needle drop"
  - course syllabus lesson rows (plain length bar)
  - the lesson page under the video (real chapters as ticks; each chapter is a link to `?t=<seconds>`, reusing the existing start-time flow)
- **Data (additive only, all from Sanity):**
  - `SearchResult` gains `lessonSeconds` (the lesson duration, already fetched in `SEARCH_HIT_QUERY`).
  - `LESSON_QUERY` gains `chapters` from the lesson's video document.
  - A new `HOME_QUERY` returns the shelf courses plus one real chapter moment (lesson, poster, duration, chapter second and label) for the "Needle drop" card, and lesson titles for suggestion chips. With no chapters, the card falls back to the first lesson with no needle. Nothing is invented.
- **No progress store exists**, so there is no "resume"/"now playing" claim. The existing `progress = 0` placeholders stay as they are.
- **Shell:** PageFrame drops the striped gutter and orange bars and becomes a full-width dark shell with a quiet footer. The header nav gets an active state via a tiny client `NavLink` (`usePathname`). Buttons and inputs become pills.
- **Search page:** keep the query echo, count line, sort, empty state with catalog link, both result types, the streaming skeleton and the error state. Video results show a thumbnail, course tone dot, locator "3.2 · 1:20", clip length, description, groove bar and "Play from 1:20". Lesson results show key points with a lesson-length groove.
- No new npm dependencies.

## Files to touch
`app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/courses/page.tsx`, `app/courses/[slug]/page.tsx`, `app/courses/[slug]/lessons/[lessonSlug]/page.tsx`, `app/search/page.tsx`, `app/design-system/page.tsx`, `components/{page-frame,site-header,course-grid,home-search-form,search-results}.tsx`, `components/nav-link.tsx` (new), `components/ui/*` (+ `groove-bar.tsx`, `sleeve.tsx`), `components/cards/*`, `lib/course.ts` (+ test), `lib/search.ts` (+ test), `sanity/queries.ts`, `sanity.types.ts` (typegen), `PRODUCT.md`.

## Security notes
The server/client boundary does not change. The new and extended queries run through the existing server-only `sanityFetch` with the read token. No tokens or keys reach the client, and nothing new is written. `NavLink` is a client component that reads only the pathname. Chapter links are same-origin `?t=` links parsed by the existing `parseStart`.

## Acceptance criteria
- Every route renders in the new world: espresso ground on the warm ramp, Bricolage display over Hanken text, amber for action, needle and focus, and course tones owning sleeve and header fields. Groove bars appear on home, search, course and lesson pages.
- Grep is clean: no Playfair, Inter, orange hex or cream canvas remains.
- The home first viewport matches the contract: the search line leads, a real Needle drop card sits to its right, and the shelf of duotone sleeves follows. On mobile it stacks: search, then card, then a horizontally scrollable shelf.
- All existing behaviour works: search streaming, sort, ⌘K, Clerk sign-in/UserButton, video `?t=`, content/notes tabs, module expanders and "show all", prev/next, and PostHog events.
- Responsive at 390px with no horizontal page scroll. The lesson sidebar collapses. Text meets WCAG AA contrast on every surface and tone. Focus rings are visible (amber) and reduced motion is honoured.

## Checks
`npx tsc --noEmit`, `npm run lint`, `node --test lib/*.test.ts`, `npx sanity typegen generate` (queries change), and `npm run build` (queries and server code change). Run the impeccable detector on the changed files, capture desktop (1440) and mobile (390) screenshots of every route, and run the finish review, then the DESIGN.md documenter.

## Manual test steps
1. `/`: type a question and press Enter to land on `/search?q=…`. Click a suggestion chip to run a search. Click the Needle drop card and the lesson opens at that second.
2. `/search?q=caching`: results stream in. Each video result's needle sits at its second. Change the sort and the order changes. A nonsense query shows the empty state with a catalog link.
3. `/courses`: sleeves render in course tones and the disc slides out on hover and on keyboard focus. Open a course: the tone header, outcomes, and syllabus rows with length grooves show. "Show all modules" works.
4. Lesson page: the sidebar marks the current lesson and the chapter grooves appear under the video. Clicking a chapter reloads at `?t=`. Tabs switch and prev/next work.
5. At 390px on every page there is no sideways scroll and the sidebar collapses to the "Module x of y" toggle. Tab through the header, search, sort and cards: amber focus is visible everywhere.
