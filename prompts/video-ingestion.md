# Video Ingestion

## Goal

Offline tooling that builds one `video` document per unique lesson `videoUrl`, holding `chapters[{ startSeconds, label }]` and transcript `chunks[{ startSeconds, text }]`. Search already reads both (`SEARCH_HIT_QUERY`, Context doc, system prompt), so video results start appearing once this runs. It never runs in the request path.

## Inspected

- Dataset: 120 lessons with 120 unique `videoUrl`s, all `https://www.youtube.com/watch?v=<id>`. 0 `video` docs.
- The `video` schema exists (`studio/schemaTypes/documents/video.ts`, read-only, listed under "Videos"). No schema change is needed.
- Search joins on `video.url == lesson.videoUrl` and accepts a second only when it equals a chapter or chunk `startSeconds` exactly. So stored seconds must be whole numbers.
- Without yt-dlp or ffmpeg installed: YouTube's innertube `player` endpoint with the **IOS** client returns `captionTracks` (English `asr` included), and `baseUrl&fmt=json3` returns timed events. It also returns `videoDetails.shortDescription`, which is where YouTube chapters live (`0:00 Intro` lines). The WEB client returns `UNPLAYABLE`. Verified live on `rGPpQdbDbwo`.
- `lib/video.ts` already parses YouTube, Vimeo and Bunny URLs for embeds (web workspace). The studio is standalone, so the script carries its own small parser.

## Decisions & assumptions

1. **Location**: `studio/scripts/ingest/` (studio = content tooling). Run with `npx sanity exec scripts/ingest/ingest.ts --with-user-token`. It writes with the logged-in CLI user's token, so **no new write token** and no env secret for YouTube.
2. **Doc id**: `video-` + the URL with every character outside `[A-Za-z0-9_-]` stripped, capped at 128 chars. Dots are stripped too, because a dot makes a Sanity id path-scoped. The doc stores the original `url`.
3. **Per provider** (a provider counts as supported only with ingestion + embed, so all three get ingestion):
   - **YouTube**: innertube `player` (IOS client). Track priority: manual `en`, then any `en*`, then `en` asr. Fetch json3. Chapters come from the description (`[h:]mm:ss label` lines), counted only when YouTube would show them: the first starts at 0, there are at least 3, and they increase.
   - **Vimeo**: `VIMEO_ACCESS_TOKEN`. `GET /videos/{id}/texttracks` (prefer active `en*`) → VTT link. `GET /videos/{id}/chapters` → `{ timecode, title }`.
   - **Bunny**: `BUNNY_STREAM_API_KEY` + `BUNNY_CDN_HOSTNAME`. `GET video.bunnycdn.com/library/{lib}/videos/{id}` → `captions[].srclang`, `chapters[{ title, start }]`. Captions come from `https://{BUNNY_CDN_HOSTNAME}/{id}/captions/{srclang}.vtt`. Assumes one library and pull zone.
   - Vimeo and Bunny **can't be verified live** (no such URLs in the dataset). They are covered by parser unit tests only. When a provider's env is missing, its URLs are skipped with a message.
4. **Chunking**: caption cues → chunks of about 30s. A new chunk starts at a cue boundary once 30s has passed. `startSeconds = floor(cue start)`, strictly increasing. Whitespace is collapsed, `[Music]`-style tags are dropped, and empty chunks are dropped. A 16-min video gives ~32 chunks. The whole transcript is never stored in one field.
5. **Write**: `createOrReplace({ _id, _type: "video", url, chapters, chunks })` with `_key`s, one video at a time. A URL whose `video` doc already exists is skipped unless `--force`. `--only <url>` targets one video. A video with neither captions nor chapters gets no doc and is reported. At the end it prints a summary (`created / skipped / failed`).
6. **Throttle**: sequential, with a 500ms pause between videos to stay polite with YouTube. Failures are logged, and the run continues.
7. No changes to search, the Context doc or the web app. Auto-generated YouTube chapters (only in the `next` endpoint) are skipped. Add them if chapter coverage proves too thin.

## Files

- `studio/scripts/ingest/ingest.ts` (new): CLI, Sanity read/write, provider fetches.
- `studio/scripts/ingest/parse.ts` (new): pure helpers `videoDocId`, `parseProvider`, `parseDescriptionChapters`, `parseVtt`, `parseJson3`, `toChunks`.
- `studio/scripts/ingest/parse.test.ts` (new): `node --test`.
- `studio/package.json`: `"ingest": "sanity exec scripts/ingest/ingest.ts --with-user-token --"`.
- `studio/.env.example`: optional `VIMEO_ACCESS_TOKEN`, `BUNNY_STREAM_API_KEY`, `BUNNY_CDN_HOSTNAME`.

## Security

- It runs locally only. It writes with the CLI user's session token, which never touches the web app or the browser.
- Vimeo and Bunny keys are studio-local env, never `NEXT_PUBLIC_`, and never in the web workspace.
- Caption text is untrusted. It is stored as plain strings, which the web app renders as text (React escapes it). No HTML is kept: VTT tags are stripped.
- It writes only `video` docs, with ids it derived itself. It never touches lessons or courses.

## Acceptance criteria

- `npm run ingest` creates ~120 `video` docs, one per unique `videoUrl`. Each has an id derived from its URL, whole-second strictly increasing `startSeconds`, and chunks of about 30s.
- Rerunning skips existing docs, and `--force` rebuilds them.
- `/search?q=server components` now returns at least one **video** result whose "Watch from mm:ss" opens the lesson at a real chunk or chapter second.
- No change to the web bundle or routes.

## Checks

- `node --test studio/scripts/ingest/parse.test.ts`
- `cd studio && npx tsc --noEmit`
- `npm run ingest -- --only https://www.youtube.com/watch?v=rGPpQdbDbwo`, then the full run, then a GROQ count of `video` docs and `chunks`/`chapters` totals.
- Web: `npx tsc --noEmit`, `npm run lint` (unchanged code, sanity check). No build is needed because there are no web changes.
- Live: `curl 'localhost:3000/api/search?q=server%20components'` shows `"kind":"video"` lines.

## Manual test

1. Run `cd studio && npx sanity login` if needed, then `npm run ingest`.
2. In the Studio, open Videos. One doc per lesson video appears, with chapters (where the creator added them) and chunks.
3. Run `npm run dev` at the root, then search "server components". Video cards appear with "Watch from mm:ss".
4. Click Watch. The lesson page opens and the embed starts at that second.
5. Run `npm run ingest` again. Every video is reported as skipped.
