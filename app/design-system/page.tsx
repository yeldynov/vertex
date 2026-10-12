import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  ChartNoAxesColumn,
  ChevronRight,
  CirclePlay,
  Clock,
  FileText,
  Search,
  ArrowRight,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { GrooveBar } from "@/components/ui/groove-bar";
import { SearchInput } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Pagination } from "@/components/ui/pagination";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { Sleeve } from "@/components/ui/sleeve";
import { Status } from "@/components/ui/status";
import { CourseCard } from "@/components/cards/course-card";
import { LessonCard } from "@/components/cards/lesson-card";
import { LessonVideoCard } from "@/components/cards/lesson-video-card";
import { ResourceCard } from "@/components/cards/resource-card";

// Dev reference for the design system; safe to delete.
export const metadata: Metadata = { title: "Design System · Vertex" };

const ramp = [
  ["Ramp 0", "#0F0B09", "bg-ramp-0", "Deepest"],
  ["Ramp 1", "#15110E", "bg-ramp-1", "Ground"],
  ["Ramp 2", "#1D1814", "bg-ramp-2", "Surface"],
  ["Ramp 3", "#27201B", "bg-ramp-3", "Raised"],
  ["Ramp 4", "#332A23", "bg-ramp-4", "Line"],
  ["Ramp 5", "#4A3E34", "bg-ramp-5", "Strong line"],
  ["Ramp 6", "#6B5D50", "bg-ramp-6", "Disabled"],
  ["Ramp 7", "#A39482", "bg-ramp-7", "Muted text"],
  ["Ramp 8", "#C4B6A3", "bg-ramp-8", ""],
  ["Ramp 9", "#DCCFBD", "bg-ramp-9", "Soft text"],
  ["Ramp 10", "#F4EBDD", "bg-ramp-10", "Ink"],
];
const accents = [
  ["Amber", "#F2A541", "bg-amber", "Action, needle, focus"],
  ["Amber hi", "#F7BE6C", "bg-amber-hi", "Hover"],
  ["Oxblood", "#A83A34", "bg-tone-oxblood", "Course tone"],
  ["Teal", "#24726E", "bg-tone-teal", "Course tone"],
  ["Mustard", "#D9A520", "bg-tone-mustard", "Course tone"],
  ["Violet", "#6150C4", "bg-tone-violet", "Course tone"],
  ["Olive", "#56702F", "bg-tone-olive", "Course tone"],
  ["Rust", "#B0552A", "bg-tone-rust", "Course tone"],
];
const typeScale = [
  ["Display 1", "Bricolage Grotesque", "72 / 72", "Extra Bold", "Page titles", "font-display text-display-1"],
  ["Display 2", "Bricolage Grotesque", "48 / 52", "Extra Bold", "Section titles", "font-display text-display-2"],
  ["Heading 1", "Bricolage Grotesque", "32 / 40", "Extra Bold", "Section heads", "font-display text-h1 font-extrabold"],
  ["Heading 2", "Bricolage Grotesque", "24 / 32", "Bold", "Card titles", "font-display text-h2"],
  ["Heading 3", "Hanken Grotesk", "18 / 24", "Semi Bold", "Small titles", "text-h3"],
  ["Body Large", "Hanken Grotesk", "17 / 26", "Regular", "Notes, summaries", "text-body-lg"],
  ["Body", "Hanken Grotesk", "15 / 24", "Regular", "Supporting text", "text-body"],
  ["Small", "Hanken Grotesk", "13 / 20", "Regular", "Meta, times", "text-small"],
];
const spacing = [
  [4, "size-1"],
  [8, "size-2"],
  [16, "size-4"],
  [24, "size-6"],
  [32, "size-8"],
  [40, "size-10"],
  [48, "size-12"],
  [64, "size-16"],
] as const;
const radii = [
  ["4px", "xs", "rounded-xs"],
  ["8px", "sm", "rounded-sm"],
  ["12px", "md", "rounded-md"],
  ["16px", "lg", "rounded-lg"],
  ["24px", "xl", "rounded-xl"],
  ["Pill", "full", "rounded-full"],
];
const depth = [
  ["Ground", "bg-ground"],
  ["Surface", "bg-surface"],
  ["Raised", "bg-raised"],
  ["Line", "bg-line"],
];
const icons = [Bell, Search, CirclePlay, FileText, Bookmark, ChartNoAxesColumn, Clock, User, ChevronRight];

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl bg-surface p-6 sm:p-8 ${className ?? ""}`}>
      <h2 className="mb-6 font-display text-h2 font-extrabold tracking-[-0.02em]">{title}</h2>
      {children}
    </section>
  );
}

const Label = ({ children }: { children: ReactNode }) => (
  <p className="mb-3 text-small font-semibold text-muted">{children}</p>
);

export default async function DesignSystemPage({ searchParams }: PageProps<"/design-system">) {
  const pageParam = Number((await searchParams).page);
  const page = Number.isInteger(pageParam) && pageParam >= 1 && pageParam <= 8 ? pageParam : 1;

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="min-w-0 rounded-xl bg-tone-oxblood p-6 text-ink sm:p-8">
          <Logo className="text-h1" />
          <h1 className="mt-8 font-display text-display-2">Listening Room</h1>
          <p className="mt-6 text-body-lg">
            Vertex as a late-night listening room: every course a record on the shelf, every lesson a track, and search
            drops the needle on the exact second.
          </p>
          <p className="mt-8 text-small opacity-90">Design system · October 2026</p>
        </section>

        <Section title="Colour">
          <Label>Warm ramp: every neutral comes from these eleven steps</Label>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
            {ramp.map(([name, hex, bg, role]) => (
              <div key={name}>
                <div className={`h-10 rounded-xs ring-1 ring-line ${bg}`} />
                <p className="mt-2 text-small text-ramp-9">{name}</p>
                <p className="text-small text-muted">{hex}</p>
                {role && <p className="text-small text-muted">{role}</p>}
              </div>
            ))}
          </div>
          <div className="mt-8" />
          <Label>Amber and the six sleeve tones</Label>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {accents.map(([name, hex, bg, role]) => (
              <div key={name}>
                <div className={`h-10 rounded-xs ${bg}`} />
                <p className="mt-2 text-small text-ramp-9">{name}</p>
                <p className="text-small text-muted">{hex}</p>
                <p className="text-small text-muted">{role}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Section title="Typefaces">
          <div className="grid gap-8">
            <div className="flex items-center gap-8">
              <span className="font-display text-[4rem] leading-none font-extrabold">Ag</span>
              <div>
                <p className="font-display text-h2">Bricolage Grotesque</p>
                <p className="mt-1 text-body text-muted">Display and headings, 700–800, tight tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[4rem] leading-none font-medium">Ag</span>
              <div>
                <p className="text-h2 font-semibold">Hanken Grotesk</p>
                <p className="mt-1 text-body text-muted">Text, controls, tabular times</p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Type scale">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-small">
              <thead className="text-muted">
                <tr>
                  {["Style", "Font", "Size / Line height", "Weight", "Use"].map((h) => (
                    <th key={h} className="pb-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-ramp-9 tabular-nums">
                {typeScale.map(([style, font, size, weight, use]) => (
                  <tr key={style} className="border-t border-line">
                    <td className="py-2 text-body text-ink">{style}</td>
                    <td>{font}</td>
                    <td>{size}</td>
                    <td>{weight}</td>
                    <td>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-2 border-t border-line pt-6">
            {typeScale.map(([style, , , , , cls]) => (
              <p key={style} className={`${cls} truncate`}>
                {style}
              </p>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Spacing">
          <Label>One 8px module; 4px for tight pairs</Label>
          <div className="flex flex-wrap items-end gap-4">
            {spacing.map(([px, size]) => (
              <div key={px} className="flex flex-col items-center gap-2 text-small text-ramp-9 tabular-nums">
                <div className={`${size} rounded-xs bg-amber`} />
                {px}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius and depth">
          <Label>Radius</Label>
          <div className="flex flex-wrap gap-4">
            {radii.map(([px, name, cls]) => (
              <div key={name} className="flex flex-col items-center gap-2 text-small text-ramp-9">
                <div className={`size-12 bg-raised ${cls}`} />
                {px}
              </div>
            ))}
          </div>
          <div className="mt-8" />
          <Label>Depth is a step up the ramp, not a shadow</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {depth.map(([name, cls]) => (
              <div key={name} className={`rounded-md p-4 ring-1 ring-line ${cls}`}>
                <p className="text-body">{name}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Groove bar">
        <Label>A lesson drawn to its real length: chapter gaps, a highlighted clip, the amber needle at the second</Label>
        <div className="grid gap-8 md:grid-cols-3">
          <GrooveBar duration={768} at={252} chapters={[{ startSeconds: 120 }, { startSeconds: 252 }, { startSeconds: 480 }]} />
          <GrooveBar duration={768} at={480} span={[480, 560]} />
          <div className="self-end">
            <GrooveBar duration={512} />
          </div>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr_1fr]">
        <Section title="Icons">
          <Label>Lucide, 1.5–2px stroke</Label>
          <div className="flex flex-wrap gap-4 text-ink">
            {icons.map((Icon, i) => (
              <Icon key={i} aria-hidden className="size-5" />
            ))}
          </div>
          <div className="mt-6" />
          <Label>Accent use</Label>
          <div className="flex flex-wrap gap-4 text-amber">
            {icons.map((Icon, i) => (
              <Icon key={i} aria-hidden className="size-5" />
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="overflow-x-auto">
            <div className="grid min-w-[480px] grid-cols-[auto_repeat(4,1fr)] items-center gap-x-4 gap-y-3 text-small">
              <span />
              {["Primary", "Secondary", "Tertiary", "Text"].map((h) => (
                <span key={h} className="text-muted">
                  {h}
                </span>
              ))}
              {(["Default", "Disabled"] as const).map((state) => {
                const disabled = state === "Disabled";
                return [
                  <span key={state} className="text-muted">
                    {state}
                  </span>,
                  <Button key={`${state}p`} disabled={disabled}>
                    Get started
                  </Button>,
                  <Button key={`${state}s`} variant="secondary" disabled={disabled}>
                    Explore
                  </Button>,
                  <Button key={`${state}t`} variant="tertiary" disabled={disabled}>
                    Open lesson
                    <ArrowRight aria-hidden className="size-4" />
                  </Button>,
                  <Button key={`${state}x`} variant="text" disabled={disabled}>
                    Play from 1:20
                    <CirclePlay aria-hidden className="size-4" />
                  </Button>,
                ];
              })}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 rounded-lg bg-tone-teal p-4 text-ink">
            <Button variant="inverse">On a tone field</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Section>

        <Section title="Inputs">
          <Label>Search</Label>
          <SearchInput placeholder="Search anything…" aria-label="Search" shortcut="⌘ K" />
          <div className="mt-6" />
          <Label>Select</Label>
          <Select aria-label="Sort by" defaultValue="relevant">
            <option value="relevant">Most relevant</option>
            <option value="newest">Newest</option>
          </Select>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
        <Section title="Badges">
          <div className="flex flex-wrap gap-3">
            {(["video", "lesson", "popular"] as const).map((k) => (
              <Badge key={k} kind={k} />
            ))}
          </div>
        </Section>

        <Section title="Status">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Status kind="in-progress" />
            <Status kind="completed" />
            <Status kind="now-playing" />
            <Status kind="locked" />
          </div>
        </Section>

        <Section title="Progress">
          <ProgressBar value={35} />
        </Section>
      </div>

      <Section title="Sleeves and cards">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label>Sleeve</Label>
            <Sleeve href="#" title="Next.js for Production" tone="violet" cover={null} meta="Intermediate · 12 lessons · 1h 59m" />
          </div>
          <div>
            <Label>Course card</Label>
            <CourseCard
              href="#"
              icon={<span className="grid size-full place-items-center bg-tone-rust font-display text-h2 font-extrabold">N</span>}
              title="Next.js for Production"
              description="Build scalable, high-performance web applications with Next.js."
              level="Intermediate"
              duration="18h 24m"
              moduleCount={12}
            />
          </div>
          <div>
            <Label>Lesson card (video)</Label>
            <LessonVideoCard
              href="#"
              title="Data Fetching in Server Components"
              description="Fetch data on the server with async/await."
              lessonLabel="Lesson 5.1"
              duration="12:45"
              startLabel="12:45"
            />
          </div>
          <div>
            <Label>Lesson card</Label>
            <LessonCard
              href="#"
              title="Data Fetching & Caching"
              description="Data fetching methods and how to cache and revalidate."
              moduleLabel="Module 5"
            />
          </div>
          <div>
            <Label>Resource card</Label>
            <ResourceCard
              href="#"
              title="Caching and Revalidation Guide"
              description="Deep dive into Next.js caching strategies."
              type="PDF"
              size="1.2 MB"
            />
          </div>
        </div>
      </Section>

      <Section title="Navigation">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-wrap items-center gap-6">
            <Logo className="text-h3" />
            <nav aria-label="Example" className="flex gap-1 text-body">
              <Link href="#" aria-current="page" className="rounded-full bg-raised px-3.5 py-2 text-ink">
                Courses
              </Link>
              <Link href="#" className="rounded-full px-3.5 py-2 text-muted hover:text-ink">
                My Learning
              </Link>
            </nav>
          </div>
          <div>
            <Label>Breadcrumbs</Label>
            <Breadcrumbs
              items={[
                { label: "All Courses", href: "#" },
                { label: "Next.js for Production", href: "#" },
                { label: "Data Fetching & Caching" },
              ]}
            />
          </div>
          <div>
            <Label>Pagination</Label>
            <Pagination page={page} totalPages={8} hrefFor={(p) => `/design-system?page=${p}`} />
          </div>
        </div>
      </Section>
    </main>
  );
}
