# Vertex Home Page

## Goal

Replace the create-next-app `app/page.tsx` with the Vertex home page from `design/vertex-home.png`: site header, hero, search bar, "All Courses" grid, footer note and the decorative bars.

## Inspected

- `app/page.tsx`: create-next-app placeholder.
- `components/ui/*`, `components/cards/*`: design-system components (`Logo`, `buttonClasses`, `SearchInput`, `CourseCard`, `Card`). Reused below.
- No Sanity client, schema, Clerk, `/courses`, `/my-learning` or `/search` route exists yet.

## Decisions & assumptions

1. **Course data is a static placeholder for now.** There is no Sanity project or content model yet, so the three courses from the design (Next.js for Production, Docker Essentials, TypeScript Deep Dive) live in a typed array in `app/page.tsx`, marked as the place to swap in a server-side Sanity query. Wiring Sanity is its own task (content model + server-only client).
2. **Course icons** are small local SVGs in `public/courses/` (Next "N", Docker whale, "TS"), redrawn simply. In Sanity they become the course cover image.
3. **`CourseCard` gets a `stacked` layout** (icon on top, serif title, divider above the meta row) because the home design shows that shape. The existing row layout and its `/design-system` usage stay unchanged.
4. **`SiteHeader`** (new, `components/site-header.tsx`): logo → `/`, nav links `Courses` → `/courses`, `My Learning` → `/my-learning`, bell button (presentational, labelled "Notifications"), avatar. No Clerk yet, so the avatar is a neutral user-icon circle; Clerk's `UserButton` replaces it later. The nav and mobile layout: links stay inline (only two of them), header padding shrinks.
5. **Search bar** is a plain `<form action="/search">` with `name="q"`, built on `SearchInput` with the `⌘ K` hint, enlarged to match the design. A tiny client component focuses it on ⌘K / Ctrl+K so the hint is true. No search backend in this task.
6. **"Explore Courses"** and **"View all courses"** link to `/courses` (route not built yet; 404 until the catalog task).
7. **Page frame:** warm canvas inner column up to 1440px wide (course grid ~1280px at full width) with hairline side borders; the outside gutter gets the faint diagonal stripes; orange gradient bars at the bottom are decorative divs (`aria-hidden`). All pure CSS, no images.
8. **Type:** hero title Playfair ~64px on desktop (`text-display-1` 48px on mobile); "All Courses" and card titles in Playfair. The "INTELLIGENT LEARNING" tag is an inline bordered label (it is not one of the three `Badge` kinds).
9. **Responsive:** course grid 3 → 2 → 1 columns; hero and search scale down; no horizontal scroll at 375px.

## Files

- `app/page.tsx`: home page (rewrite).
- `components/site-header.tsx`: new.
- `components/search-shortcut.tsx`: new client component (⌘K focus).
- `components/cards/course-card.tsx`: add `layout?: "row" | "stacked"`.
- `components/ui/input.tsx`: add a `large` size to `SearchInput` for the hero search bar.
- `public/courses/nextjs.svg`, `docker.svg`, `typescript.svg`: new.

## Security

No secrets, tokens or network calls. The search form only navigates to `/search?q=…`.

## Acceptance criteria

- `/` visually matches `design/vertex-home.png` at desktop width.
- At ~375px: header fits, hero and search scale, cards stack, no horizontal scroll.
- Search: typing and pressing Enter navigates to `/search?q=<query>`; ⌘K / Ctrl+K focuses the input.
- All links/buttons are keyboard-focusable with visible focus; bell and avatar have accessible labels; decorative elements are hidden from screen readers.
- `/design-system` looks unchanged.

## Checks

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Manual test

1. `npm run dev`, open http://localhost:3000 and compare with `design/vertex-home.png`.
2. Press ⌘K (Ctrl+K): the search input gets focus. Type "caching", press Enter: URL becomes `/search?q=caching`.
3. Tab through the page: header links, bell, avatar, Explore Courses, search, View all courses, each card.
4. Resize to ~375px: no horizontal scroll, cards in one column.
5. Open `/design-system`: course card unchanged.
