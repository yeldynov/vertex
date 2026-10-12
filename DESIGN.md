---
name: Vertex
description: A late-night listening room for learning, where every course is a record and search drops the needle on the exact second.
colors:
  ramp-0: "#0f0b09"
  ground: "#15110e"
  surface: "#1d1814"
  raised: "#27201b"
  line: "#332a23"
  ramp-5: "#4a3e34"
  ramp-6: "#6b5d50"
  muted: "#a39482"
  ramp-8: "#c4b6a3"
  ramp-9: "#dccfbd"
  ink: "#f4ebdd"
  amber: "#f2a541"
  amber-hi: "#f7be6c"
  on-amber: "#1a120a"
  tone-oxblood: "#a83a34"
  tone-teal: "#24726e"
  tone-mustard: "#d9a520"
  tone-violet: "#6150c4"
  tone-olive: "#56702f"
  tone-rust: "#b0552a"
  success: "#7fbf6a"
  lesson: "#b9adf5"
  lesson-bg: "#2a2440"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  display-2:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, ui-sans-serif, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: "3.25rem"
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, ui-sans-serif, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: "2.5rem"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, ui-sans-serif, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "2rem"
    letterSpacing: "-0.015em"
  title-sm:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: "1.5rem"
  body-lg:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: "1.625rem"
    fontFeature: "\"ss01\""
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "1.5rem"
    fontFeature: "\"ss01\""
  label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: "1.25rem"
    fontFeature: "\"ss01\", \"tnum\""
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  card: "20px"
  lg: "24px"
  gutter: "32px"
  section: "40px"
  gutter-wide: "48px"
  xxl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.amber-hi}"
  button-primary-lg:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-secondary:
    textColor: "{colors.amber}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-tertiary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-tertiary-hover:
    backgroundColor: "{colors.line}"
  button-text:
    textColor: "{colors.amber}"
    rounded: "{rounded.xs}"
    padding: "0"
  button-text-hover:
    textColor: "{colors.amber-hi}"
  button-inverse:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-inverse-hover:
    backgroundColor: "{colors.ramp-9}"
  button-ghost:
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  input-search-hero:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 144px 0 64px"
    height: "72px"
  chip-suggestion:
    textColor: "{colors.ramp-9}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  badge-video:
    textColor: "{colors.amber}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-lesson:
    backgroundColor: "{colors.lesson-bg}"
    textColor: "{colors.lesson}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-popular:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.on-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
  card-hover:
    backgroundColor: "{colors.raised}"
  nav-link:
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
  nav-link-current:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
  sleeve-oxblood:
    backgroundColor: "{colors.tone-oxblood}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  sleeve-mustard:
    backgroundColor: "{colors.tone-mustard}"
    textColor: "{colors.on-amber}"
    rounded: "{rounded.md}"
  groove-bar:
    backgroundColor: "{colors.line}"
    rounded: "{rounded.full}"
    height: "10px"
---

# Design System: Vertex

## Overview

**Creative North Star: "The Listening Room"**

Vertex is a late-night listening bar with a record shelf. Courses are records: square sleeves printed in a course tone, a disc peeking from behind. Lessons are tracks, drawn to their real length as a groove bar, and search drops an amber needle on the exact second a topic is taught. The same groove and locator (`2.1 · 4:12`) recur on home, results, course syllabus and lesson page, so path and position are always legible.

The room is warm and dim. Every neutral comes from one eleven-step espresso-to-paper ramp; depth comes from stepping up that ramp, not from shadows. Amber is the single voice for action, the needle and focus. Six sleeve tones own whole fields (a sleeve, a course header, the lesson rail head) instead of acting as borders or accents. Type pairs a heavy, tight Bricolage Grotesque display with a calm Hanken Grotesk text face set on an 8px module, with tabular figures wherever time or counts appear.

It refuses the category default (centred hero over a white cover-card grid) and its dark twin (near-black with a neon accent and streaming rows).

**Key Characteristics:**
- One warm tonal ramp; every neutral is a ramp step.
- Amber is the only action, needle and focus colour.
- Course tones fill fields; they are never borders or text accents.
- The groove bar is the signature: a lesson to scale, chapter gaps, amber needle at the second.
- Flat surfaces; depth is a ramp step up.
- Pills for controls, generous radii (8 to 24px) for surfaces.
- Tabular figures for every time, locator and count.

## Colors

A warm, dim, single-hue ramp lit by one amber lamp, with six muted record-sleeve tones that only ever appear as fields.

### Primary
- **Needle Amber** (amber): every primary action, the groove-bar needle and timestamp flag, the focus ring, text selection, the caret, and the logo mark. **Lamp Amber** (amber-hi) is its hover. **Amber Shadow-Ink** (on-amber) is the only text colour set on amber, and on mustard.

### Secondary: Sleeve Tones
- **Oxblood** (tone-oxblood), **Teal** (tone-teal), **Mustard** (tone-mustard), **Violet** (tone-violet), **Olive** (tone-olive), **Rust** (tone-rust): one per course, hashed from the course slug. Each fills the course's sleeve, its course-page header field, and the head of the lesson rail, and appears as a 10px tone dot wherever the course is named without its sleeve. Ink text on all tones except mustard, which takes on-amber.

### Tertiary: State
- **Groove Green** (success): completed status only.
- **Lilac** (lesson) on **Night Violet** (lesson-bg): the lesson result badge and key-point checks; distinguishes lesson results from amber video results.

### Neutral: The Ramp
- **Pressing Black** (ramp-0): video and thumbnail wells, disc grooves, scrims.
- **Espresso Ground** (ground): page background; also cuts chapter gaps into the groove bar.
- **Surface** (surface): cards, modules, rails, fields; one step up.
- **Raised** (raised): hover on surface, current nav pill, kbd hint, tertiary button.
- **Line** (line): the only divider and field border; also the darker groove stripe.
- **Strong Line** (ramp-5): field border on hover, scrollbar thumb.
- **Faint** (ramp-6): disabled text, the played portion of a groove.
- **Muted** (muted): secondary text and meta rows; AA on ground through raised.
- **Soft Ink** (ramp-9): long-form notes, chips, non-current rail items.
- **Paper Ink** (ink): primary text, headings, current state.

### Named Rules
**The One Lamp Rule.** Amber is the only chromatic colour for action, position and focus. If something is clickable-primary, playing, or focused, it is amber; nothing else is.

**The Field Not Line Rule.** Course tones fill whole fields (sleeve, course header, rail head) or a tone dot. Never use a tone as a border, underline, or text colour.

**The One Ramp Rule.** Never introduce a neutral outside ramp-0 to ink. Translucent steps (ground/90 header, ramp-0/85 time chip) are ramp colours at an alpha, not new greys.

## Typography

**Display Font:** Bricolage Grotesque (with Hanken Grotesk, ui-sans-serif)
**Body Font:** Hanken Grotesk (with ui-sans-serif, system-ui), stylistic set 01 on

**Character:** A loud, compressed-feeling grotesque at 800 for record-sleeve titles and page headlines, over a quiet, even text face; tight negative tracking on display, none on text.

### Hierarchy
- **Display** (800, clamp 2.5 to 4.5rem, 0.98): page headlines (home hero, course title, catalog, search). The home hero alone stretches to 5rem.
- **Display 2** (800, 3rem / 3.25rem): secondary hero sizes and the design-system reference.
- **Headline** (800, 2rem / 2.5rem): section heads such as "On the shelf"; counts sit beside them in body muted.
- **Title** (700, 1.5rem / 2rem): result titles, needle-drop lesson title, lesson-page sections.
- **Title Small** (700, 1.125rem / 1.5rem): card and module titles.
- **Body Large** (400, 1.0625rem / 1.625rem): lede paragraphs and lesson notes, notes held to a 62ch measure.
- **Body** (400, 0.9375rem / 1.5rem): default UI text and descriptions.
- **Label** (600 when emphasised, 0.8125rem / 1.25rem, tabular): meta rows, locators, badges, timestamps, breadcrumbs.

### Named Rules
**The Locator Rule.** Position lives in a meta row, never above a heading: tone dot, course name, `·`, then the locator in ink semibold tabular figures. No kickers or eyebrows above headings.

**The Tabular Time Rule.** Every timestamp, duration, count and locator uses tabular figures.

**The One Measure Rule.** Lesson notes and key points are one size (body-lg, soft ink) on a 62ch measure. Descriptions in results may run to 70ch.

## Layout

Everything sits on an 8px module. The page container caps at 1440px, with side gutters of 16px (mobile), 32px (from 640px) and 48px (from 1280px). The header is sticky, 64px tall (72px from 640px).

- **Home:** two columns from 1024px, the search column flexing and the Needle Drop card fixed at 400px; stacked below. The shelf is a grid of square sleeves: 2 columns, 3 from 640px, 4 from 1024px, 6 from 1280px, with 20 to 32px column gaps and 36px row gaps.
- **Course page:** a full-width tone field header (copy plus a 22rem sleeve-and-disc column from 1024px, 18rem from 768px), then module accordions on surface.
- **Lesson page:** sidebar rail sticky on desktop; on mobile it collapses into a disclosure under the tone head. Video full width with chapters and the groove beneath, then tabs and notes.
- **Search:** single column of horizontal result cards (288px media column from 768px), stacked on mobile.

Section breaks are a `line` hairline plus 40px of air, not a background change.

## Elevation & Depth

Flat. Depth is conveyed by stepping up the ramp: ground, then surface for cards and rails, then raised for hover and current states. Cards carry no border and no shadow; the only rings are a 1px line ring on the Needle Drop card and a pressing-black ring on sleeve art. The sticky header uses ground at 90% with a backdrop blur.

The build carries one soft ambient shadow under the lesson video frame. It is recorded as drift, not a token: do not reuse it.

### Named Rules
**The Ramp Step Rule.** To lift something, move it one ramp step lighter. Hover is one more step. Never add a drop shadow to a card.

## Shapes

Controls are pills: buttons, fields, chips, badges, nav links, the groove bar. Surfaces use generous radii: 24px for cards, modules, the Needle Drop card and video frame; 16px for the course tone header, media wells inside cards and rail rows; 12px for sleeves; 8px for small rail art; 4px for timestamp flags, kbd hints and focus-target links. Circles are reserved for records: the disc, the play button, the needle head, tone dots.

## Components

### Buttons
- **Shape:** full pill (9999px), 40px tall (md) or 48px (lg), semibold.
- **Primary:** amber field with on-amber text; hover to amber-hi. Disabled drops to line with faint text.
- **Secondary:** 1px amber outline, amber text; hover fills amber at 10%.
- **Tertiary:** raised field, ink text; hover one ramp step.
- **Text:** amber link with no padding, hover amber-hi; used for "Browse all courses" and "Play from 1:20".
- **Inverse (on a tone field):** ink pill with ground text, hover soft ink. Used for the course header's main action.
- **Ghost (on a tone field):** transparent, takes the field's own text colour with a 1px ring at 40%, hover tint 10%.

### Chips
- **Suggestion chips:** 1px line outline pill, soft ink label text; hover turns the outline amber and the text ink. Their text is always a real stored lesson title.

### Badges
- Pill, label size, semibold, capitalised word. **Video:** amber at 15% with amber text. **Lesson:** lilac on night violet. **Popular:** solid amber.

### Cards / Containers
- **Corner Style:** 24px.
- **Background:** surface; hover to raised on result cards.
- **Shadow Strategy:** none (see Elevation).
- **Border:** none.
- **Internal Padding:** 20px default; result cards 12 to 16px around their media.

### Inputs / Fields
- **Style:** pill, surface fill, 1px line border, 44px tall, muted placeholder, leading search icon.
- **Hover / Focus:** border to strong line on hover, amber on focus (the field replaces the global outline).
- **Hero search:** 64px tall on mobile, 72px from 640px, with the primary Search pill sitting inside the right end.

### Navigation
- Muted pill links; hover to ink; the current section (its route and everything under it) gets a raised pill with ink text. The logo is an amber V mark plus the wordmark; mark only on mobile.

### Groove Bar (signature)
A lesson drawn to its real length: a 10px pill of 2px line/raised stripes. Chapter starts cut 2px ground gaps. With a moment, the played part is shaded faint, a matched clip is amber at 45%, and the amber needle (2px stem, 10px head ringed in ground) stands at the second under a small amber timestamp flag that pins left or right near the ends. The needle eases in from 0 over 1.1s on the expo-out curve; static under reduced motion. Labelled for assistive tech as "Moment at x of y". On course syllabus rows, bars are scaled against the course's longest lesson.

### Sleeve (signature)
A square record sleeve in the course tone: top half the cover printed as a duotone (grayscale, multiplied into the tone), bottom half the title in display 800, then a muted meta line below the sleeve. The disc peeks 12% at rest and slides to 24% on hover or keyboard focus over 700ms expo-out; the focus outline is amber, offset 4px.

Open notes, not rules: titles over 32 characters step down more than one type step (a stopgap); tone is a slug hash, so adjacent courses can share a tone until the schema carries a colour field.

## Do's and Don'ts

### Do:
- **Do** take every neutral from the ramp, and lift surfaces one ramp step at a time.
- **Do** use amber for primary actions, the needle and focus, and nothing else.
- **Do** show where in a lesson a moment sits with the groove bar wherever a lesson or moment is listed.
- **Do** put locators in the meta row (tone dot, course, `·`, locator in tabular ink).
- **Do** use the inverse and ghost button variants on tone fields; amber primary stays on the ramp.
- **Do** keep lesson notes at body-lg on a 62ch measure.
- **Do** drive every suggestion, needle drop and count from stored data.

### Don't:
- **Don't** add drop shadows to cards; depth is a ramp step.
- **Don't** use a course tone as a border, outline or text colour.
- **Don't** set kickers or eyebrows above headings.
- **Don't** add a second accent colour for actions or highlights.
- **Don't** use square-cornered controls; controls are pills.
- **Don't** let a long sleeve title overflow: titles past 32 characters drop to the smaller sleeve size and clamp at four lines.
