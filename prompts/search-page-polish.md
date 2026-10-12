# Search page: match the design now that videos exist

## Goal

`/search` already exists (see `prompts/search.md`): a server route plus a streamed results page, wired to Sanity. Now that video ingestion has run, real video cards appear. Close the remaining gaps against `design/vertex-search.png` and make video recall pick the best moments first.

## Inspected (live, `q=data fetching`, 1200px)

- Already matches the design:
  - "SEARCH RESULTS" chip, `Results for "<q>"` and the count line.
  - The search input with `⌘ K`.
  - The "N results" heading and the "Most Relevant" sort.
  - Video cards: thumbnail, timestamp, course, `VIDEO` badge, title, matched chapter or chunk text, lesson/module meta, "Watch from".
  - Lesson card: key points, `LESSON` badge, excerpt, `Module N`, "View lesson".
  - The "Can't find…" panel.
- Gaps:
  1. Video thumbnails render at `opacity-80` over black, so they look dimmed. The design shows them at full brightness.
  2. The lesson key-points box has no check mark. The design has a filled circle-check at the bottom right.
  3. The model's video query takes `[0...25]` **unordered**. Here 13 videos match, which is fine, but on broad queries the chapter-title hits can be cut off. Lesson matching is already scored.
- The design's "28 results across 8 courses" is sample copy. For "data fetching" the dataset has only 3 matching lessons and 13 matching videos, so 5 results across 2 courses is the real count, not a bug.
- The header has no active-nav state on any page. That's out of scope for this page and is not changed.

## Decisions

1. `components/search-results.tsx`:
   - Drop `opacity-80` from the video thumbnail.
   - In `LessonResult`, add a `CircleCheck` icon (lucide, already used in `ui/status.tsx`), filled `neutral-700` with a white stroke and `size-6`, at the box's bottom right (`relative` box, `absolute right-3 bottom-3`), `aria-hidden`.
   - No other restyling.
2. Video query ranking: add `| score(boost(chapters[].label match $terms, 3), chunks[].text match $terms) | order(_score desc)` before `[0...25]`. It goes in **both** places:
   - the inline `SYSTEM_PROMPT` in `app/api/search/route.ts`;
   - the "Video moments" section of `studio/scripts/context/vertex-search.json`, re-imported.

   Verified with GROQ: this puts the chapter hit ("Fetching data in server components", score 8) first.

## Files

- `components/search-results.tsx`
- `app/api/search/route.ts` (the prompt string only)
- `studio/scripts/context/vertex-search.json`

## Security

No change. It's still a server-only route and grounded output, with no new env.

## Acceptance criteria

- Video thumbnails are full brightness, and the lesson key-points box shows the check at the bottom right.
- `q=data fetching` returns "Fetching data in server components" first, as a video at a chapter second.
- `q=zzqx` shows the empty state. At 375px nothing scrolls horizontally, and the cards stack.

## Checks

- `node --test lib/*.test.ts`, `npx tsc --noEmit`, `npm run lint`, `npm run build`
- `cd studio && npx sanity documents create scripts/context/vertex-search.json --replace`
- Live: restart the dev server (the prompt is cached), then load `/search?q=data+fetching` in the browser at 1200px and at 375px.

## Manual test

1. Run `npm run dev` and open `/search?q=data fetching`. Compare it with the design.
2. Click "Watch from …" on the first card. The video starts at that second.
3. Open `/search?q=zzqx`. The empty state and "Browse all courses" appear.
4. Narrow the window to 375px. The cards stack.
