# PostHog reverse proxy

## Goal

The browser sends PostHog events straight to the PostHog ingest host. Ad blockers block that host, so they can drop pageviews. Send browser events through a first-party `/ingest` path on the Vertex domain, and Next.js rewrites forward them to PostHog.

## Inspected

- `instrumentation-client.ts` sets `api_host` to `NEXT_PUBLIC_POSTHOG_HOST`. `next.config.ts` has no `rewrites`.
- `lib/posthog-logger.ts` (server-only) builds its OTLP logs URL from `NEXT_PUBLIC_POSTHOG_HOST`, so that value must stay an absolute PostHog host.
- `proxy.ts` (Clerk) runs before `next.config.ts` rewrites, and its matcher includes `/ingest`.
- `.env.example` lists the US host, but the project is on the EU cloud.

## Decisions

1. `NEXT_PUBLIC_POSTHOG_HOST` stays the upstream ingest host (`https://eu.i.posthog.com`). The server logger and the rewrites use it. No new env var, so the Vercel config does not change.
2. `next.config.ts` adds two rewrites from that host: `/ingest/static/:path*` → the assets host (`eu-assets.i.posthog.com`), and `/ingest/:path*` → the ingest host. It also sets `skipTrailingSlashRedirect: true`, because PostHog API paths end with a slash.
3. `posthog.init` sets `api_host: "/ingest"` and `ui_host` to the app host from the same env value (`eu.i.posthog.com` → `eu.posthog.com`), so toolbar links still open PostHog.
4. The Clerk matcher excludes `ingest`, so Clerk does not run on analytics requests.

## Files

- `next.config.ts`, `instrumentation-client.ts`, `proxy.ts`, `.env.example`.

## Security

No token or key changes. Only the client-safe project key reaches the browser, as before. The rewrite forwards only `/ingest/*` to PostHog hosts.

## Acceptance criteria

- Browser analytics requests go to `<site>/ingest/...` and return 200.
- New events carry `$lib_custom_api_host` = `/ingest`.

## Checks

- `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Manual test

1. Run the site, open the network tab, and load a page.
2. Look for requests to `/ingest/e/` or `/ingest/flags/`: they return 200, and none go to `*.i.posthog.com`.
3. In PostHog, the new `$pageview` has `$lib_custom_api_host` = `/ingest`.
