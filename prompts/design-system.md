# Vertex Design System

## Goal

Turn `design/vertex-designsystem.png` into code: Tailwind theme tokens and a small set of reusable, presentational UI components. Later pages (catalog, course, lesson, search) will be built from these.

## Inspected

- `app/globals.css`: create-next-app defaults (Geist fonts, a dark-mode override, Arial body).
- `app/layout.tsx`: Geist fonts loaded with `next/font/google`.
- `package.json`: Next 16.3.8, React 19.2, Tailwind v4 (CSS-first `@theme`). No icon library yet.
- No components exist yet, so there is nothing to reuse.

## Decisions & assumptions

1. **Tokens live in `app/globals.css` under `@theme`** (Tailwind v4 CSS-first config, no `tailwind.config`).
   - Colors: `primary-100…500` and `neutral-50…900` + `white`, exactly as the design states. The default Tailwind palette is reset (`--color-*: initial`) so only system colors exist.
   - The design shows colors that are not in its palette. I sampled them from the image and added them as semantic tokens:
     - `primary-600` `#E4580B` (button hover)
     - `success` `#16A34A` (Completed)
     - `lesson` `#4F56C8` with `lesson-bg` `#EEEFFB` (LESSON badge)
     - `canvas` `#F9F5F3` (warm page background)
   - Fonts: Playfair Display (`font-display`) and Inter (`font-sans`) through `next/font/google`, replacing Geist.
   - Type scale as named text utilities with line-height and weight built in: `text-display-1` (48/56 bold), `text-display-2` (36/44 bold), `text-h1` (28/36 semibold), `text-h2` (22/30 semibold), `text-h3` (18/26 medium), `text-body-lg` (16/24), `text-body` (14/20), `text-small` (12/16).
   - Radius `xs 4 / sm 8 / md 12 / lg 16 / xl 24 / full`, and shadows `sm/md/lg/xl` with the design's exact values.
   - Spacing needs no change: Tailwind's default 4px base already matches the 4–64px scale.
2. **Light theme only.** The design has no dark variant, so I remove the default `prefers-color-scheme: dark` override.
3. **Icons: `lucide-react`.** It matches the design's 24px grid, 2px stroke and rounded caps. The "filled" style uses `fill="currentColor"`. This is the only new dependency.
4. **Logo:** an inline SVG redrawn from the image (orange V mark + "Vertex" wordmark). Replace it if you have the original asset.
5. **Components are presentational.** They take props, fetch nothing and hold no state, except for small built-in interactions.
6. **A `/design-system` route** renders every component and state once, so the result can be compared with the PNG. It is a dev reference, safe to delete later. It does not lay the components out like the PNG board.
7. **Out of scope:** the full site header (search, bell, avatar, Clerk), data wiring, and moving the app into the `web/` workspace that AGENTS.md describes.

## Files

- `app/globals.css`: tokens, base body styles.
- `app/layout.tsx`: Inter + Playfair fonts, metadata title "Vertex".
- `components/ui/`:
  - `button.tsx`: `primary | secondary | tertiary | text`, sizes `md | lg`, hover/disabled, optional trailing icon.
  - `input.tsx`: search input with leading icon and optional `⌘K` hint.
  - `select.tsx`: native `<select>` with a chevron.
  - `badge.tsx`: `video | lesson | popular`.
  - `status.tsx`: `in-progress | completed | now-playing | locked`.
  - `progress-bar.tsx`: percentage + "N% complete" label.
  - `breadcrumbs.tsx`, `pagination.tsx`, `logo.tsx`.
- `components/cards/`:
  - `course-card.tsx`
  - `lesson-video-card.tsx`
  - `lesson-card.tsx`
  - `resource-card.tsx`
- `app/design-system/page.tsx`: showcase.
- `package.json`: add `lucide-react`.

## Specs to match

- **Buttons:** height 44px, padding `0 16px` (lg) or `0 12px` (md), radius 12px, Inter Medium 14–16px.
  - Primary: `primary-500` fill; hover `primary-600`; disabled is a pale fill (`primary-200`).
  - Secondary: orange outline with orange text.
  - Tertiary: neutral outline with dark text and a trailing icon.
  - Text: orange text with a trailing play icon.
- **Inputs:** height 44px, radius 12px, border `1px solid neutral-200 (#E2E8F0)`, padding `0 16px`, focus border `primary-400 (#FB923C)`.
- **Badges:** uppercase, tracked, small, tinted background with matching text.
- **Cards:** white background, neutral-200 border, radius `md`/`lg`, shadow `sm`. Meta row in `text-small` neutral-500.

## Security

No secrets, tokens or network calls are involved. The new dependency is a widely used icon package.

## Acceptance criteria

- All tokens above are available as Tailwind utilities (`bg-primary-500`, `text-neutral-700`, `font-display`, `text-h2`, `rounded-md`, `shadow-lg`, …).
- Every component in the PNG exists with the states shown.
- `/design-system` visually matches the PNG's components and is usable at mobile width with no horizontal scroll.
- Interactive elements are keyboard-focusable and show a visible focus state. Icon-only buttons have labels.

## Checks

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Manual test

1. `npm run dev`
2. Open http://localhost:3000/design-system and compare it with `design/vertex-designsystem.png` side by side.
3. Hover and tab through the buttons, inputs and pagination; check the hover and focus states.
4. Resize to ~375px wide: no horizontal scroll, and the cards stack.
