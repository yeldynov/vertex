# All Courses Page

## Goal

Add `/courses`, a simple catalog listing every seeded Sanity course. The "Courses" nav link, "Explore Courses", "View all courses" and the "All Courses" breadcrumb already point here.

## Inspected

- There is no catalog design, so the page reuses the home page's "All Courses" section: serif heading and a 3 → 2 → 1 column grid of stacked `CourseCard`s inside `PageFrame`.
- `COURSES_QUERY` (popular first, then by title) already returns everything a card needs; the home page maps it to `CourseCard`.

## Decisions & assumptions

1. **Shared grid:** move the home page's card mapping into `components/course-grid.tsx` (`<CourseGrid courses={...} />`). Home uses it with the first 3 courses, the catalog with all of them. Home looks unchanged.
2. **Page:** breadcrumbs (`Home › All Courses`), an "All Courses" h1, a "10 courses" count, then the grid. Metadata title is "All Courses · Vertex".
3. **Empty state:** "No courses yet." when the query returns nothing.
4. **Out of scope** (keeping it simple): category filters, sort, pagination and search. Easy to add later; categories already exist in Sanity.

## Files

- `app/courses/page.tsx`: new.
- `components/course-grid.tsx`: new (extracted from home).
- `app/page.tsx`: use `CourseGrid`.

## Security

Server-side reads through the existing server-only client; no token reaches the browser.

## Acceptance criteria

- `/courses` lists all 10 seeded courses, popular first; every card opens its course page.
- The header "Courses" link, home "Explore Courses" and "View all courses", and the course page breadcrumb all land on it.
- Responsive grid with no horizontal scroll at 375px; home unchanged.

## Checks

- `npx tsc --noEmit`, `npm run lint`, `npm run build`

## Manual test

1. Open http://localhost:3000/courses: 10 cards, count reads "10 courses".
2. Click a card: its course page opens. Click "All Courses" in its breadcrumb: back to the catalog.
3. Open `/` and click "View all courses": the catalog opens.
4. Narrow the window: 3 → 2 → 1 columns.
