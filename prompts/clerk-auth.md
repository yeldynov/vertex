# Clerk Authentication

## Goal

Add Clerk auth to the Next.js app with the Clerk CLI, linked to Clerk app `app_3KBe4x1Mn7cXGrWdNxqB1qvRyz9`. Browsing stays public; private routes are protected in the proxy (Next 16 middleware). The header avatar placeholder becomes Clerk's sign-in / user controls.

## Inspected

- Next.js `16.3.8` App Router at the repo root (no `web/` split yet), npm (`package-lock.json`).
- No `proxy.ts` / `middleware.ts`, no `.env*` files, no `.env.example`. `.gitignore` already ignores `.env*`.
- Clerk CLI is not installed.
- `components/site-header.tsx` has an avatar placeholder marked "Replaced by Clerk's UserButton once auth is wired".
- `buttonClasses()` in `components/ui/button.tsx` for styling the sign-in trigger.

## Decisions & assumptions

1. **CLI flow:** `npm install -g clerk` → `clerk auth login` (you complete the browser login) → `clerk init --app app_3KBe4x1Mn7cXGrWdNxqB1qvRyz9`. It installs `@clerk/nextjs`, adds `ClerkProvider`, `proxy.ts` and writes keys to `.env.local` (gitignored). I will not read or print `.env.local`.
2. **Review what init generated** and reshape it to project rules:
   - `ClerkProvider` inside `<body>` in `app/layout.tsx`.
   - `proxy.ts` uses `clerkMiddleware` + `createRouteMatcher(["/my-learning(.*)", "/api/progress(.*)"])` → `auth.protect()`. Everything else public (home, catalog, course, lesson, search). The progress route doesn't exist yet; protecting its path now is free.
   - Matcher includes `'/(api|trpc)(.*)'` then `'/__clerk/:path*'` once.
   - Remove any sample pages/components init adds that are out of scope.
3. **Sign-in UI:** Clerk-hosted modal (`SignInButton mode="modal"`), no custom `/sign-in` pages. Sign-up is reachable from the sign-in modal, so the header only gets one control to keep the design intact.
4. **Header:** signed-out → a "Sign in" button styled with `buttonClasses("primary")` where the avatar sits; signed-in → `UserButton` sized like the current avatar (`size-10 sm:size-13`). Uses `Show when="signed-in|signed-out"`. Header stays a server component; Clerk components handle their own client side.
5. **`.env.example`** (new, committed) lists `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=` and `CLERK_SECRET_KEY=` with empty values. Needs a `!.env.example` line in `.gitignore`.
6. No shadcn (`components.json` absent) → skip `@clerk/ui`. No Clerk theming beyond defaults.

## Files

- `package.json`, `package-lock.json`: `@clerk/nextjs` (via init).
- `proxy.ts`: new.
- `app/layout.tsx`: `ClerkProvider`.
- `components/site-header.tsx`: replace avatar placeholder.
- `.env.example`: new. `.gitignore`: allow `.env.example`.
- `.env.local`: created by CLI, not committed.

## Security

- `CLERK_SECRET_KEY` only in `.env.local` / server env; never imported in client code. Only the publishable key reaches the browser.
- Route protection lives in `proxy.ts`, not in client code.

## Acceptance criteria

- Signed out: `/` loads, header shows "Sign in"; visiting `/my-learning` redirects to Clerk sign-in.
- Sign-up / sign-in works via the modal; after sign-in the header shows the `UserButton` avatar.
- Signing out returns to the signed-out header.
- Header layout unchanged otherwise; fits at 375px.
- `clerk doctor` reports no errors.

## Checks

- `clerk doctor`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (new proxy + layout change)

## Manual test

1. `npm run dev`, open http://localhost:3000: header shows "Sign in".
2. Open `/my-learning` while signed out: redirected to Clerk sign-in.
3. Click "Sign in" → "Sign up", create your first test user. Profile avatar appears in the header. If a "Configure your application" callout shows, click it.
4. Open the avatar menu → Sign out: "Sign in" returns.
5. Resize to ~375px: header fits, no horizontal scroll.
