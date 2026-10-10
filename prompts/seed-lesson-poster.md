# Seed: lesson `thumbnail` → `poster`

## Goal

Seeded lessons store their image under `thumbnail`, but the `lesson` schema field is `poster`. As a result `poster` is empty everywhere and the Studio flags `thumbnail` as an unknown field. Rename the field in the seed file and in the live dataset.

## Inspected

- `studio/scripts/seed/seed.ndjson` has 120 lesson docs with `"thumbnail":{…image…}` and 0 with `poster`. No other code reads `thumbnail`.
- `studio/schemaTypes/documents/lesson.ts` defines `poster` (image, hotspot, `alt`). The seed value already has that shape (`_type: "image"`, `_sanityAsset`, `alt`), so only the key changes.
- `LESSON_QUERY` already selects `poster`. No web code change is needed.

## Decisions

1. **Seed file:** rename the key `"thumbnail":` → `"poster":` on lesson lines (`sed`). A fresh import then produces correct docs.
2. **Live dataset:** a one-off `sanity exec` script (`studio/scripts/rename-lesson-thumbnail.ts`, run with `--with-user-token`) that, for each `lesson` with `defined(thumbnail)`, patches `set({ poster: thumbnail })` + `unset(["thumbnail"])` in one transaction. It skips docs that already have a `poster`, so an author's own poster is never overwritten. It runs against published docs and any drafts. I chose this over re-importing with `--replace` so that Studio edits to lessons are kept. The script is idempotent and does nothing on a second run.
3. The script is kept in the repo, since it documents the fix. Say if you'd rather delete it after it runs.

## Files

- `studio/scripts/seed/seed.ndjson`: key rename.
- `studio/scripts/rename-lesson-thumbnail.ts`: new one-off migration.

## Security

The script uses your Sanity CLI login token (`--with-user-token`). No token is written to disk or env, and nothing in `web` changes.

## Acceptance criteria

- `grep -c '"thumbnail"' seed.ndjson` → 0, and `grep -c '"poster"'` → 120.
- Live: `count(*[_type=="lesson" && defined(thumbnail)])` → 0, and `count(*[_type=="lesson" && defined(poster)])` → 120.
- A second run of the script reports 0 patched.

## Checks

- Run the script, then the two GROQ counts above.
- `npx tsc --noEmit` and `npm run lint` in `web` (unchanged, sanity check).

## Manual test

1. Open a lesson in the Studio: the Poster field shows the YouTube thumbnail, and there is no "unknown field" warning.

## Outcome

The live dataset already had `poster` on all 120 lessons (with an uploaded asset) and `thumbnail` on none, so only the seed file was stale. The migration script ran with 0 patched and was deleted. Only the seed file changed.
