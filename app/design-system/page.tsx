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
  SquareArrowOutUpRight,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Pagination } from "@/components/ui/pagination";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { Status } from "@/components/ui/status";
import { CourseCard } from "@/components/cards/course-card";
import { LessonCard } from "@/components/cards/lesson-card";
import { LessonVideoCard } from "@/components/cards/lesson-video-card";
import { ResourceCard } from "@/components/cards/resource-card";

// Dev reference for the design system; safe to delete.
export const metadata: Metadata = { title: "Design System · Vertex" };

const primary = [
  ["Primary 500", "#F97316", "bg-primary-500"],
  ["Primary 400", "#FB923C", "bg-primary-400"],
  ["Primary 300", "#FDBA74", "bg-primary-300"],
  ["Primary 200", "#FED7AA", "bg-primary-200"],
  ["Primary 100", "#FFEEE5", "bg-primary-100"],
];
const neutral = [
  ["Neutral 900", "#0F172A", "bg-neutral-900"],
  ["Neutral 700", "#334155", "bg-neutral-700"],
  ["Neutral 500", "#64748B", "bg-neutral-500"],
  ["Neutral 300", "#CBD5E1", "bg-neutral-300"],
  ["Neutral 200", "#E2E8F0", "bg-neutral-200"],
  ["Neutral 100", "#F1F5F9", "bg-neutral-100"],
  ["Neutral 50", "#FAFAFC", "bg-neutral-50"],
  ["White", "#FFFFFF", "bg-white"],
];
const typeScale = [
  ["Display 1", "Playfair Display", "48 / 56", "Bold", "Page titles", "font-display text-display-1"],
  ["Display 2", "Playfair Display", "36 / 44", "Bold", "Section titles", "font-display text-display-2"],
  ["Heading 1", "Inter", "28 / 36", "Semi Bold", "Card titles", "text-h1"],
  ["Heading 2", "Inter", "22 / 30", "Semi Bold", "Sub section", "text-h2"],
  ["Heading 3", "Inter", "18 / 26", "Medium", "Small titles", "text-h3"],
  ["Body Large", "Inter", "16 / 24", "Regular", "Body copy", "text-body-lg"],
  ["Body", "Inter", "14 / 20", "Regular", "Supporting text", "text-body"],
  ["Small", "Inter", "12 / 16", "Regular", "Captions, meta", "text-small"],
];
const spacing = [
  [4, "size-1"],
  [8, "size-2"],
  [12, "size-3"],
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
  ["Full", "circle", "rounded-full"],
];
const shadows = [
  ["Sm", "0 1px 2px 0", "0.05", "shadow-sm"],
  ["Md", "0 4px 12px -2px", "0.08", "shadow-md"],
  ["Lg", "0 12px 24px -4px", "0.10", "shadow-lg"],
  ["Xl", "0 20px 40px -8px", "0.12", "shadow-xl"],
];
const icons = [Bell, Search, CirclePlay, FileText, Bookmark, ChartNoAxesColumn, Clock, User, ChevronRight];

function Section({ n, title, children, className }: { n: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 ${className ?? ""}`}>
      <h2 className="mb-6 flex gap-4 text-small font-semibold tracking-[0.15em] uppercase">
        <span className="text-primary-500">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const Label = ({ children }: { children: ReactNode }) => (
  <p className="mb-3 text-body text-neutral-700">{children}</p>
);

export default async function DesignSystemPage({ searchParams }: PageProps<"/design-system">) {
  const pageParam = Number((await searchParams).page);
  const page = Number.isInteger(pageParam) && pageParam >= 1 && pageParam <= 8 ? pageParam : 1;

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
          <Logo className="text-h1" />
          <h1 className="mt-8 font-display text-display-1">Design System</h1>
          <p className="mt-6 text-body-lg text-neutral-700">
            A unified design language for Vertex learning platform. Clean, modern and focused on clarity,
            consistency and intuitive learning experiences.
          </p>
          <p className="mt-8 text-small tracking-wider text-neutral-700 uppercase">Version 1.0 · May 2025</p>
        </section>

        <Section n="01" title="Colors">
          <Label>Primary</Label>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
            {primary.map(([name, hex, bg]) => (
              <div key={name}>
                <div className={`h-12 rounded-xs ${bg}`} />
                <p className="mt-2 text-small text-neutral-700">{name}</p>
                <p className="text-small text-neutral-500">{hex}</p>
              </div>
            ))}
          </div>
          <div className="mt-8" />
          <Label>Neutral</Label>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
            {neutral.map(([name, hex, bg]) => (
              <div key={name}>
                <div className={`h-10 rounded-xs border border-neutral-200 ${bg}`} />
                <p className="mt-2 text-small text-neutral-700">{name}</p>
                <p className="text-small text-neutral-500">{hex}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Section n="02" title="Typography">
          <div className="grid gap-8">
            <div className="flex items-center gap-10">
              <span className="font-display text-[4rem] leading-none">Ag</span>
              <div>
                <p className="font-display text-h2 font-normal">Playfair Display</p>
                <p className="mt-2 text-body text-neutral-500">Elegant · Readable · Timeless</p>
              </div>
            </div>
            <div className="flex items-center gap-10">
              <span className="text-[4rem] leading-none font-medium">Ag</span>
              <div>
                <p className="text-h2 font-normal">Inter</p>
                <p className="mt-2 text-body text-neutral-500">Clean · Modern · Highly legible</p>
              </div>
            </div>
          </div>
        </Section>

        <Section n="03" title="Type Scale">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-small">
              <thead className="text-neutral-700">
                <tr>
                  {["Style", "Font", "Size / Line Height", "Weight", "Use"].map((h) => (
                    <th key={h} className="pb-3 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-neutral-500">
                {typeScale.map(([style, font, size, weight, use]) => (
                  <tr key={style}>
                    <td className="py-1 text-body text-neutral-900">{style}</td>
                    <td>{font}</td>
                    <td>{size}</td>
                    <td>{weight}</td>
                    <td>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-2 border-t border-neutral-200 pt-6">
            {typeScale.map(([style, , , , , cls]) => (
              <p key={style} className={`${cls} truncate`}>
                {style}
              </p>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section n="04" title="Spacing System">
          <Label>Base unit: 4px</Label>
          <div className="flex flex-wrap items-end gap-4">
            {spacing.map(([px, size]) => (
              <div key={px} className="flex flex-col items-center gap-2 text-small text-neutral-700">
                <div className={`${size} rounded-xs bg-primary-200`} />
                {px}
                <span className="text-neutral-500">({px / 16}rem)</span>
              </div>
            ))}
          </div>
        </Section>

        <Section n="05" title="Radius & Shadows">
          <Label>Radius</Label>
          <div className="flex flex-wrap gap-4">
            {radii.map(([px, name, cls]) => (
              <div key={name} className="flex flex-col items-center gap-2 text-small text-neutral-700">
                <div className={`size-12 border border-neutral-200 ${cls}`} />
                {px}
                <span className="text-neutral-500">({name})</span>
              </div>
            ))}
          </div>
          <div className="mt-8" />
          <Label>Shadows</Label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {shadows.map(([name, offset, alpha, cls]) => (
              <div key={name} className={`rounded-sm bg-white p-3 ${cls}`}>
                <p className="text-body">{name}</p>
                <p className="mt-2 text-small text-neutral-500">{offset}</p>
                <p className="text-small text-neutral-500">rgba(15, 23, 42, {alpha})</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr_1fr]">
        <Section n="06" title="Icons">
          <Label>Outline Style</Label>
          <div className="flex flex-wrap gap-4 text-neutral-900">
            {icons.map((Icon, i) => (
              <Icon key={i} aria-hidden className="size-5" />
            ))}
          </div>
          <div className="mt-6" />
          <Label>Filled Style</Label>
          <div className="flex flex-wrap gap-4 text-neutral-900">
            {/* ponytail: lucide has no filled set; fill-current approximates it (inner details like clock hands get covered) */}
            {icons.map((Icon, i) => (
              <Icon key={i} aria-hidden className="size-5 fill-current" />
            ))}
          </div>
          <ul className="mt-6 list-disc pl-5 text-small text-neutral-700">
            <li>24x24px grid</li>
            <li>2px stroke width (outline)</li>
            <li>Rounded line caps</li>
            <li>Consistent optical balance</li>
          </ul>
        </Section>

        <Section n="07" title="Buttons">
          <div className="overflow-x-auto">
            <div className="grid min-w-[480px] grid-cols-[auto_repeat(4,1fr)] items-center gap-x-4 gap-y-3 text-small">
              <span />
              {["Primary", "Secondary", "Tertiary", "Text"].map((h) => (
                <span key={h} className="text-neutral-700">
                  {h}
                </span>
              ))}
              {(["Default", "Disabled"] as const).map((state) => {
                const disabled = state === "Disabled";
                return [
                  <span key={state} className="text-neutral-700">
                    {state}
                  </span>,
                  <Button key={`${state}p`} disabled={disabled}>
                    Get Started
                  </Button>,
                  <Button key={`${state}s`} variant="secondary" disabled={disabled}>
                    Explore Courses
                  </Button>,
                  <Button key={`${state}t`} variant="tertiary" disabled={disabled}>
                    View Lesson
                    <SquareArrowOutUpRight aria-hidden className="size-4" />
                  </Button>,
                  <Button key={`${state}x`} variant="text" disabled={disabled}>
                    Watch Video
                    <CirclePlay aria-hidden className="size-4" />
                  </Button>,
                ];
              })}
            </div>
          </div>
          <p className="mt-3 text-small text-neutral-500">Hover the default row to see hover states.</p>
          <ul className="mt-6 list-disc pl-5 text-small text-neutral-700">
            <li>Height: 44px (default)</li>
            <li>Padding: 0 16px (lg), 0 12px (md)</li>
            <li>Radius: 12px</li>
            <li>Font: Inter Medium (14–16px)</li>
          </ul>
        </Section>

        <Section n="08" title="Inputs">
          <Label>Search / Text Input</Label>
          <SearchInput placeholder="Search anything..." aria-label="Search" shortcut="⌘ K" />
          <div className="mt-6" />
          <Label>Select</Label>
          <Select aria-label="Sort by" defaultValue="relevant">
            <option value="relevant">Most Relevant</option>
            <option value="newest">Newest</option>
          </Select>
          <ul className="mt-6 list-disc pl-5 text-small text-neutral-700">
            <li>Height: 44px</li>
            <li>Radius: 12px</li>
            <li>Border: 1px solid #E2E8F0</li>
            <li>Padding: 0 16px</li>
            <li>Focus: Border color #FB923C</li>
          </ul>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
        <Section n="09" title="Badges / Tags">
          <div className="grid grid-cols-3 gap-4 text-small text-neutral-700">
            {(["video", "lesson", "popular"] as const).map((k) => (
              <div key={k} className="grid justify-items-start gap-2">
                <span className="capitalize">{k}</span>
                <Badge kind={k} />
              </div>
            ))}
          </div>
        </Section>

        <Section n="10" title="Status / Indicators">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Status kind="in-progress" />
            <Status kind="completed" />
            <Status kind="now-playing" />
            <Status kind="locked" />
          </div>
        </Section>

        <Section n="11" title="Progress Bar">
          <ProgressBar value={35} />
        </Section>
      </div>

      <Section n="12" title="Cards">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Course Card</Label>
            <CourseCard
              href="#"
              icon={
                <span className="grid size-full place-items-center bg-neutral-900 text-h2 text-white">N</span>
              }
              title="Next.js for Production"
              description="Build scalable, high-performance web applications with Next.js."
              level="Intermediate"
              duration="18h 24m"
              moduleCount={12}
            />
          </div>
          <div>
            <Label>Lesson Card (Video)</Label>
            <LessonVideoCard
              href="#"
              title="Data Fetching in Server Components"
              description="Learn how to fetch data on the server using async/await and Next.js best practices."
              lessonLabel="Lesson 5.1"
              duration="12:45"
              startLabel="12:45"
            />
          </div>
          <div>
            <Label>Lesson Card (Lesson)</Label>
            <LessonCard
              href="#"
              title="Data Fetching & Caching"
              description="Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance."
              moduleLabel="Module 5"
            />
          </div>
          <div>
            <Label>Resource Card</Label>
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

      <Section n="13" title="Navigation">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-wrap items-center gap-8">
            <Logo className="text-h3" />
            <nav aria-label="Main" className="flex gap-6 text-body">
              <Link href="#" aria-current="page" className="text-primary-500">
                Courses
              </Link>
              <Link href="#" className="text-neutral-700 hover:text-neutral-900">
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
