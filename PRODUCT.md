# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Career switchers and junior developers learning to code, mostly following courses in order. They also need to get back to a specific concept ("where did they explain middleware?") without rewatching hours of video. Authors are a secondary audience: they create courses in Sanity Studio, not in the web app.

## Product Purpose

Vertex is a learning platform for video courses. Its core feature is search: a plain-language query returns ranked result cards that open a lesson's video at the exact second the topic is taught. Success means a learner types a question and lands on the right moment in one click, and that browsing and resuming courses (catalog, course page, lesson page, My Learning, progress) work end to end.

This is a course/portfolio build: success is a distinctive, working, responsive implementation. There are no real customers yet.

## Positioning

Search that jumps to the exact second, grounded in the course content. Lessons (title + notes) and video moments (chapters first, transcript chunks as fallback) are searched and merged. Results rank by specificity and never invent a course, lesson, timestamp or count.

## Operating Context

- Learners browse publicly; Clerk sign-in is needed only for private routes (My Learning, progress).
- Videos play in the provider's own embed (YouTube, Vimeo, Bunny) with a start-time parameter. Learners never leave for the provider's site.
- Content comes from a private Sanity dataset, fetched on the server. Search is a streamed server route (Sanity Context MCP + Gemini).
- PostHog captures product analytics.

## Capabilities and Constraints

- In scope: catalog, course page, lesson page (video + notes), instructor pages, My Learning, progress tracking, search, notifications bell (presentational only).
- Search results page: full page, not a chatbox. It shows a result count, a sort control (default: most relevant), video and lesson result types, and an empty state linking to the catalog.
- Labels such as "Module 5" and "Lesson 5.1" are derived from order, never stored.
- The "Free preview" badge is a label only, not access control.
- Stack: Next.js App Router, Tailwind v4, Clerk, PostHog, next-sanity, Vercel AI SDK with Gemini. See AGENTS.md for the architecture rules.

## Brand Commitments

- Name: Vertex, and the "V" mark's shape (its colour may change). Everything else visual was released for the 2026-10 redesign ("Listening Room", which replaced the rejected "The Index"). DESIGN.md records the current system.
- The original desktop designs in `design/` are historical reference only. They no longer bind the UI.
- Hero line: "Search your learning in plain English."
- Avoid: a hacker/terminal costume, childish gamification, and corporate-LMS blandness.

## Evidence on Hand

- Original designs (historical): `design/vertex-home.png`, `vertex-course.png`, `vertex-lesson.png`, `vertex-search.png`, `vertex-designsystem.png`.
- Seeded dataset: 12 courses (e.g. Building AI Apps with LLMs, Next.js App Router in Depth, Python for Data Work), each with 4 modules, 12 video lessons, and ingested chapters.
- None of the following exist, so do not fabricate them: testimonials, learner counts beyond stored data, reviews, press, or pricing claims beyond the stored course fields.

## Product Principles

1. **Land on the moment.** Every search result should get a beginner to the exact lesson and second in one click.
2. **Grounded, never invented.** Show only stored data: no made-up courses, timestamps, durations or counts.
3. **Make the path obvious for beginners.** Order, progress and "what's next" are always clear, and labels come from order.
4. **One address everywhere.** A lesson's locator (5.1, plus the second) reads the same on every page, so learners always know where they are.

## Accessibility & Inclusion

WCAG 2.2 AA: text contrast, full keyboard operation, visible focus states, labelled controls (including the search sort and the video embed), and layouts that reflow down to mobile width.
