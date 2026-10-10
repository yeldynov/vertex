# Vertex Search

## Goal

Build the intelligent search from `design/vertex-search.png`. `/search?q=…` is a full results page. It streams ranked **video** and **lesson** result cards from a server route `GET /api/search?q=…`, which runs the Sanity Context MCP + a system prompt + an OpenAI model. "Watch" opens the lesson at the matched second (`?t=`), and "View lesson" opens the lesson.

The scope covers search only, as the user chose. The `video` schema is added so that search, the Context filter and the MCP can see video moments, but caption ingestion is a later task. Until that task runs the dataset holds 0 `video` docs, so only lesson results appear.

## Inspected

- The MCP base endpoint `https://api.sanity.io/v2026-03-03/context/mcp/<project>/<dataset>` answers `tools/list` with the existing `SANITY_API_READ_TOKEN` (`initial_context`, `groq_query`, …). The Studio app is deployed (`appId` in `studio/sanity.cli.ts`).
- Dataset: 120 lessons, 10 courses, no `video` docs, no `sanity.agentContext` doc.
- `@sanity/context@2.2.0` peers on `sanity ^6`, but the Studio is on v5. Per the Gotchas, the plugin is skipped: the Context document is created by CLI import, and Conversation Insights is unavailable.
- Reusable pieces: `PageFrame`, `Card`, `Badge` (`video`/`lesson`), `buttonClasses`, `SearchInput` + `SearchShortcut`, `Select`, `TrackedLink`/`captureEvent`, `lessonLabel`/`moduleLabel`/`formatDuration`, `urlFor` (`sanity/lib/image.ts`), server `client`. The lesson page already honours `?t=<seconds>` through `parseStart`.
- `HomeSearchForm` already submits to `/search?q=`, and that route is 404 today. `proxy.ts` keeps `/search` and `/api/search` public, which is correct because browsing stays public.
- Not installed yet: `ai`, `@ai-sdk/openai`, `@ai-sdk/mcp`, `zod`. Missing env: `OPENAI_API_KEY`, `SANITY_CONTEXT_MCP_URL`.

## Decisions & assumptions

1. **`video` schema** (`studio/schemaTypes/documents/video.ts`): `url`, `chapters[{ startSeconds, label }]`, `chunks[{ startSeconds, text }]`, all `readOnly` because only ingestion writes them. It is listed under "Videos" in `structure.ts`. Ingestion derives the doc id from the URL. Search never relies on the id and joins on `video.url == lesson.videoUrl`.
2. **Context document** `studio/scripts/context/vertex-search.json` (`_type: "sanity.agentContext"`, slug `vertex-search`), imported with `sanity documents create --replace`:
   - `groqFilter`: `_type in ["course", "lesson", "video", "category", "instructor"]`
   - `instructions` (written as dial-your-context deltas):
     - A lesson has no course field. Find the course with `*[_type=="course" && references(^._id)]`.
     - Labels come from array order and are never stored.
     - A video maps to a lesson through `video.url == lesson.videoUrl`.
     - Match notes with `pt::text(notes)`.
     - Use token wildcard OR matching (`title match ["data*", "fetching*"]`) and never match a whole phrase.
     - Match video chapters first and fall back to chunks only if no chapter matches.
     - Never project the whole `chunks` array. Use `chunks[text match …][0...3]`.
     - Rank a title hit above a notes hit.
     - Don't use `text::semanticSimilarity` because embeddings are not enabled.
3. **Route `app/api/search/route.ts`** (Node runtime, `GET`):
   - Zod-validates `q`: trimmed, 2–200 chars, else 400.
   - Opens `createMCPClient` (HTTP, Bearer read token) against `SANITY_CONTEXT_MCP_URL` (the slug URL).
   - Fetches `/initial-context` once, caches it in a module variable, and drops the `initial_context` tool.
   - Calls `streamText` with `openai(OPENAI_MODEL ?? "gpt-5-mini")`, an inline system prompt, the MCP tools, `stopWhen: stepCountIs(8)`, and `output: Output.array({ element: { kind: "video" | "lesson", lessonId, startSeconds?, reason } })`.
   - The system prompt repeats the critical query + ranking + grounding rules from the Context doc (backticks escaped).
   - Every streamed element is **grounded on the server** before it reaches the client. One server-side GROQ fetch per element (new `SEARCH_HIT_QUERY`) loads the lesson, its course (reverse ref, modules for labels) and its video (`url == ^.videoUrl`). Unknown lessons and duplicates are dropped. A video hit whose `startSeconds` is not an actual chapter or chunk start in that video doc is dropped.
   - The response is an NDJSON stream of hydrated result objects, which are display data only, with no tokens and no raw transcripts. The MCP client closes on finish or error. A failure before streaming returns 500 JSON.
4. **Shared helpers `lib/search.ts`** (+ `lib/search.test.ts`): result types, `momentAt(video, seconds)` (verifies the second and returns `{ label/text, clipSeconds }`, where the clip runs to the next chapter or chunk, or to the lesson end), `lessonPosition(modules, lessonId)` → module/lesson index, and `excerpt(notes)` (first paragraph, plain text).
5. **Result card content** (every value comes from Sanity, nothing from the model except order and seconds):
   - **Video:** course icon (the course `coverImage` as a small square) + course title, a `VIDEO` badge, and the lesson title.
   - **Video description:** the matched chapter label or chunk text.
   - **Video meta:** `Lesson 5.1 · <module title>`.
   - **Video thumbnail:** the lesson `poster`, else the course cover, with a `mm:ss` start overlay and a play icon. The link reads "Watch from 12:45" and goes to `/courses/<c>/lessons/<l>?t=765`.
   - **Lesson:** a key-points box (the first 3 `keyPoints`), course, a `LESSON` badge, title, a notes excerpt, `Module 5`, and "View lesson" linking to the lesson.
   - The cards are a horizontal search-specific layout (`components/search-results.tsx`) composed from `Card`/`Badge`/`buttonClasses`. The existing `LessonCard`/`LessonVideoCard` on `/design-system` are left untouched.
6. **Page `app/search/page.tsx`** (server):
   - "SEARCH RESULTS" chip, `Results for "<q>"`, the search form (`SearchInput` with `⌘ K`, `name="q"`, prefilled), and metadata `Search: <q> · Vertex`.
   - An empty `q` shows the form and the catalog panel only.
   - The client component `SearchResults` fetches `/api/search?q=` and reads the NDJSON stream, appending cards as they arrive. While it streams it shows a "Searching…" skeleton.
   - A subtitle "Found N results across M courses" and an "N results" heading are counted from the grounded results.
   - A `Select` sort control offers **Most relevant** (default, the model's order), **Course A–Z** and **Shortest first**.
   - The bottom panel "Can't find what you're looking for? … Browse all courses →" links to `/courses` and is always shown, as in the design. Zero results show "No results for "<q>"" above it, and an error shows a message with a retry link.
7. **No search reply text**: the design has no reply paragraph, so `react-markdown` is not added.
8. **Analytics:** result links use `TrackedLink` with `search_result_clicked` (`{ kind, position, course_slug, lesson_slug }`), and the client fires `search_completed` (`{ result_count, course_count }`). The home form already fires `search_submitted`, and the results-page form does too (`source: "search"`).
9. **Mobile:** cards stack with the thumbnail on top below `md`, the header centres, the sort control goes full width, and nothing scrolls horizontally at 375px.

## Files

- `package.json` / lock: add `ai`, `@ai-sdk/openai`, `@ai-sdk/mcp`, `zod`.
- `.env.example`: add `OPENAI_API_KEY`, `OPENAI_MODEL` (optional), `SANITY_CONTEXT_MCP_URL`.
- `studio/schemaTypes/documents/video.ts` (new), `studio/schemaTypes/index.ts`, `studio/structure.ts`.
- `studio/scripts/context/vertex-search.json` (new).
- `sanity/env.ts` (MCP URL), `sanity/queries.ts` (`SEARCH_HIT_QUERY`), `sanity.types.ts` (typegen).
- `lib/search.ts`, `lib/search.test.ts` (new).
- `app/api/search/route.ts` (new), `app/search/page.tsx` (new), `components/search-results.tsx` (new).

## Security

- The read token, MCP URL and OpenAI key are server-only (`import "server-only"`). The browser calls only `/api/search` and never the MCP or the LLM.
- The model's output is untrusted. Only `lessonId` and `startSeconds` are used, both are re-validated against Sanity on the server, and every displayed string comes from Sanity.
- The route is public and spends LLM credit. Its cost is capped by query length (≤200 chars) and steps (≤8), but **there is no rate limit**. Flagged below.
- No writes, and no new tokens are needed (the MCP works with the existing Viewer token).

## Acceptance criteria

- `/search?q=server components` streams lesson cards ranked best first. A lesson whose title contains the concept ranks above a notes-only hit.
- Each card shows real course, label, key points and excerpt, and "View lesson" opens the correct lesson.
- The count line matches the cards shown ("Found N results across M courses").
- The sort control reorders the cards, and "Most relevant" restores the model's order.
- A nonsense query (`q=zzqx`) shows the empty state with "Browse all courses".
- The route never returns a lesson id that isn't in the dataset, or a video second that isn't a real chapter or chunk start.
- With a hand-created test `video` doc (deleted afterwards), a video card appears and "Watch from" opens the lesson at that second.
- It is usable at 375px.

## Checks

- `node --test lib/*.test.ts`
- `npx tsc --noEmit`, `npm run lint`, `npm run build`
- Studio: `npm run deploy` + `npm run schema:deploy` (the video type must be visible to the MCP), then `npx sanity documents create scripts/context/vertex-search.json --replace`, then `npm run typegen`.
- Live MCP: `tools/list` against the slug URL, and `curl 'localhost:3000/api/search?q=server%20components'` against the dev server, with the real output reported.

## Manual test

1. Add `OPENAI_API_KEY` and `SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v2026-03-03/context/mcp/<project>/production/vertex-search` to `.env.local`, then run `npm run dev`.
2. On the home page, search "server components". You land on `/search?q=server+components`, and the cards stream in.
3. Compare the page with `design/vertex-search.png`. Check the count line and the sort dropdown.
4. Click "View lesson" on the first card. The right lesson opens.
5. Search `zzqx`: the empty state appears, and "Browse all courses" opens `/courses`.
6. Resize to 375px. The cards stack, and nothing scrolls horizontally.
7. Edit the Context doc's instructions (re-import). The next search uses them. Prompt changes in the route need a dev-server restart.

## Needs attention (before or after)

- An OpenAI API key is needed, and `OPENAI_MODEL` defaults to `gpt-5-mini`.
- Rate limiting for `/api/search` is not included. Add it (for example Vercel Firewall rate-limit rules) before a public launch.
- Video results stay empty until caption ingestion is built.
