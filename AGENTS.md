# AGENTS.md

You are building **Vertex**: a learning platform where authors create courses in Sanity and learners use a Next.js site. Its core feature is search: a plain-language query returns ranked result cards that open a lesson's video at the exact second the topic is taught.

## Scope

Build only: the Sanity content model, Clerk auth, catalog, course page, lesson page (video + notes), instructor pages, My Learning, progress tracking, PostHog analytics, video transcript/chapter ingestion, the search config, and search. Nothing beyond that.

## Workflow

1. Read the relevant skills (`sanity-best-practices`, `sanity-migration`, `create-agent-with-sanity-context`, `dial-your-context`, `shape-your-agent`) and inspect the existing code before assuming anything.
2. Before coding, write `prompts/<name>.md`: goal, decisions and assumptions, files to touch, security notes, acceptance criteria, checks, and manual test steps.
3. Ask for approval through the question panel (Yes/No options): `I prepared the implementation prompt at prompts/<name>.md. Is this good to execute?` Skip this step only if the user says to.
4. Implement exactly what the prompt says, run the checks, then report in short bullets under `What I did`, `Test` (numbered steps) and `Needs your attention`.

Ask the user through the question panel, and only when the task is genuinely ambiguous.

## UI

Reproduce the provided desktop designs exactly. Make every page responsive down to mobile (stack columns, collapse the lesson sidebar). Reuse existing components and Tailwind patterns. Do not restyle anything.

## Architecture

There are two standalone workspaces. Never embed the Studio in Next.js.

- **studio**: Sanity schema and content authoring only.
- **web**: Next.js pages, search UI, all server-side integration.

Rules for `web`:

- Pages only display stored data, and they fetch all content on the server with a server-only Sanity client (the dataset is private and needs a read token).
- Clerk protects private routes in middleware, not in client code. Keep browsing public.
- Search runs as a server route: Sanity Context MCP + system prompt + LLM, streamed to a client results page.
- Every write (progress) goes through a server route that uses a server-only write token.
- The browser never holds a token, never calls the MCP or the LLM, and never writes data. Only client-safe keys may reach the browser: the Clerk publishable key and the PostHog project key.
- Keep ids and keys in env, and keep `.env.example` as the canonical list.

**Stack:** Next.js App Router, TypeScript, Clerk, PostHog, `next-sanity`, `@sanity/image-url`, `@portabletext/react`, Tailwind + typography, Vercel AI SDK with the Google (Gemini) provider, Zod, and `react-markdown` (search reply only). Do not add a separate backend framework.

## Data model

- **course**: title, slug, summary, cover image, level, price, optional popular flag, student count, learning outcomes (`{ icon, title, description }`), refs to an instructor and a category, and an ordered list of **modules**.
- **module** (embedded object, not a document): title, summary, ordered lesson refs. Labels such as "Module 5" or "Lesson 5.1" are derived from order, never stored.
- **lesson**: title, slug, video URL, poster image, duration, free preview flag (a label only, not access control), student count, Portable Text notes, key points, optional pro tip, resources (`{ type, title, description, url }`). A lesson has no parent course field; find its course through a reverse reference.
- **instructor**: name, slug, photo, expertise, bio.
- **category**: title, slug, description.
- **video**: one per unique video URL, created only by ingestion. Fields: id, url, `chapters[{ startSeconds, label }]`, `chunks[{ startSeconds, text }]`. Never store the whole transcript in one field. Video documents are an internal lookup and are never shown as results on their own.
- **agent context**: the search config (content scope filter + query instructions). Write it with `dial-your-context`.
- **progress**: keyed by Clerk user id. Stores completed lessons and a resume position per lesson. Written only through a server route. Shown as completion marks and a resume action.

Rich content uses Portable Text and typed fields, never markdown. The lessons in a module must actually cover the module's topic, or search returns junk.

Presentational only (no backend of its own): My Learning (may read progress), the notifications bell, the lesson Notes tab, and the free preview badge.

## Video

- Supported providers: YouTube, Vimeo and Bunny. Play videos on the lesson page with the provider's own embed; do not build a custom player.
- A result links to the lesson page with a start-seconds query param, which is passed to the provider's start parameter. Never send the learner to the provider's site.
- Ingestion is offline tooling and never runs in the request path. The video document id is derived from the URL with invalid id characters stripped.
- A provider counts as supported only when it has both caption→chunks ingestion and embed playback with a start time.

## Search

- A full results page (not a chatbox or widget): every relevant result ranked best first, a result count ("28 results across 8 courses"), a sort control (default: most relevant), and an empty state linking to the catalog.
- There are two result types:
  - **Video result**: course name + icon, module/lesson label, thumbnail, clip length, description, matched second. "Watch" opens the lesson at that second.
  - **Lesson result**: course, module/lesson label, key points, description. Opens the lesson.
- Search lessons (title + notes) and video moments, then merge the results. Video moments match chapters first and fall back to transcript chunks only if no chapter matches.
- Rank by specificity: an exact concept in a title beats a broad keyword hit.
- Stay grounded: never invent a course, lesson, price, duration, timestamp or count.
- Text match is token-based. Wildcard each keyword and OR the words together. Never match a whole phrase as one pattern. Match Portable Text through its plain-text projection.
- Put the critical query and ranking rules in **both** the inline system prompt and the Context document, because the model follows the system prompt more reliably.

## Gotchas

- The Context MCP only serves a dataset that has a **deployed Studio application**; deploying only the schema is not enough.
- Skip the `@sanity/context` Studio plugin if it lags the Studio's Sanity major version. In that case, edit the Context document by import or through the Sanity MCP, and Conversation Insights will be unavailable.
- If `text::semanticSimilarity()` errors because embeddings are not enabled, use wildcard keyword matching. Turning on embeddings is the user's billing decision.
- Never give the model a whole transcript or chunks array, because it overflows the context window. Fetch only a few filtered matches per video.
- Initial context is cached in the search route, so prompt and instruction changes need a server restart. Edits to the Context document apply on the next request.
- Escape backticks inside a system prompt written as a template literal, or the build fails.

## Checks

Run these and report the real output. Never claim a check passed without running it.

- **web**: type check and lint every time. Add a production build when routes, config or server code change.
- **studio**: deploy the Studio app, deploy the schema, and import content and config documents as needed.
- For search or ingestion work, verify against the live MCP endpoint.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
