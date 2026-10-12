# Search speed: from ~40s to a few seconds

## Goal

`/api/search` takes 35–43s per query. Bring it to a few seconds without changing what is shown, how results are grounded, or the "MCP + system prompt + LLM" architecture.

## Measured (temporary timing logs, `q=data fetching`, since removed)

| Phase | Time |
|---|---|
| MCP connect + tools | ~1.5s |
| LLM step 1: write the 2 GROQ queries (the prompt already dictates them) | ~16s |
| MCP `groq_query`, measured directly | 0.3–0.7s |
| LLM step 2: rank and emit the hits (~1k output tokens) | ~22s |
| Hydrate cards **one after another** (~300ms each) | ~3s |

- A bare ranking call with the same candidate data (4.3k input tokens) takes 14s on `gemini-3.1-flash-lite` (low thinking), 11s on minimal thinking (fewer results), and **1.9s on `gemini-3.5-flash-lite`**. `gemini-3.8-flash` hung for minutes.
- `GEMINI_MODEL` isn't set in `.env.local`, so the route always uses its hard-coded default `gemini-3.1-flash-lite`.
- Swapping only the model gives ~10s, but the tool loop gets worse. 3.5-flash-lite runs queries one at a time, re-queries, and on `useEffect cleanup` hit the 6-step cap and failed (`AI_NoObjectGeneratedError`). Recall also dropped (4 results instead of 10).

The cost is the agent loop: up to 6 LLM round trips to run two queries the prompt already spells out.

## Decisions

1. **Server runs the prescribed queries through the MCP; the LLM only ranks.**
   - The route turns `q` into keywords: lowercase, split on anything that isn't `[a-z0-9]`, drop stop words (same list as the prompt), dedupe, wildcard each (`data*`), at most 8.
   - Only `[a-z0-9]` survives into the inline GROQ, so the query can't be injected (`groq_query` takes no params).
   - No keywords left (for example `q=the`) → empty result, and no LLM call.
   - It calls the MCP `groq_query` tool directly (`groq_query.execute(...)`) for the lesson query and the scored video query, **in parallel**. These are the same GROQ strings as in the prompt today.
   - The video projection also returns `lessonTitle`, so the model can rank on titles.
2. **One LLM call, no tools:** `streamText` with the ranking + grounding rules as the system prompt and the two JSON results as the prompt. Still `Output.array(HitSchema)`. There's no tool loop, so the step cap can't fail a search.
   - The data-reference schema (`/initial-context`, ~4k tokens) is no longer sent, because the model doesn't write GROQ.
   - The system prompt keeps the specificity ranking, the "one result per lesson, video at its best moment" rule, "leave out loosely related", and grounding.
   - The query rules move into code. The Context doc keeps them, and the MCP still serves it to anything else that queries it.
3. **Model default `gemini-3.5-flash-lite`**, still overridable by `GEMINI_MODEL`. `.env.example` is updated to match. Keep `thinkingLevel: "low"`.
4. **Hydrate in parallel, emit in order:** start each hit's `SEARCH_HIT_QUERY` as soon as the element arrives, and write the cards to the stream in the model's order.
5. **Grounding stays as it is:** `groundHit` + `SEARCH_HIT_QUERY` still reject any lesson id or second that isn't in Sanity.
6. **Searching state in the UI** (`components/search-results.tsx`), no restyle of the cards:
   - While loading, the count line reads "Searching your courses…" with a small spinning `LoaderCircle` (lucide, `animate-spin`, primary color) before it.
   - The "N results" heading is hidden while loading and no result has arrived yet, so "0 results" never shows mid-search. While loading with results, it shows "N results so far".
   - The pulsing skeleton card stays below the streamed cards until the stream ends.

## Files

- `app/api/search/route.ts`: keyword builder, direct MCP calls, single ranking call, parallel hydration. The `initial-context` cache is removed.
- `lib/search.ts` + `lib/search.test.ts`: `searchTerms(q)` (pure) with a test that covers stop words, punctuation/injection characters, and an empty result.
- `.env.example`: `GEMINI_MODEL=gemini-3.5-flash-lite`.
- `components/search-results.tsx`: searching indicator, no "0 results" while loading.

## Security

- No new env or tokens. The read token and Gemini key stay server-only.
- The GROQ is built only from `[a-z0-9]` tokens.
- Model output is still untrusted, and only `lessonId` and `startSeconds` are used, re-validated against Sanity.

## Acceptance criteria

- `data fetching`, `server components` and `useEffect cleanup` each finish in **under 8s** on the dev server, with no "Search failed".
- `data fetching` still returns "Fetching data in server components" first, as a video at a chapter second, with at least as many results as today (10).
- `q=zzqx` and `q=the` return the empty state quickly.
- While a search runs, the page shows a spinner + "Searching your courses…" and never "0 results".

## Checks

- `node --test lib/*.test.ts`, `npx tsc --noEmit`, `npm run lint`, `npm run build`
- Live: time the 5 queries above with `curl` against the dev server and report the real seconds and result counts.

## Manual test

1. Run `npm run dev`, then search "data fetching" from the home page. The first cards appear within a few seconds.
2. Search "useEffect cleanup" and "zzqx". Results, then the empty state, both quick.
