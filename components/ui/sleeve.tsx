import Image from "next/image";
import { TrackedLink } from "@/components/posthog-events";
import { cx } from "@/lib/cx";
import type { Tone } from "@/lib/course";

// Static class strings so Tailwind can see them. Mustard is light, so it takes dark text.
export const toneClasses: Record<Tone, string> = {
  oxblood: "bg-tone-oxblood text-ink [--tone:var(--color-tone-oxblood)]",
  teal: "bg-tone-teal text-ink [--tone:var(--color-tone-teal)]",
  mustard: "bg-tone-mustard text-on-amber [--tone:var(--color-tone-mustard)]",
  violet: "bg-tone-violet text-ink [--tone:var(--color-tone-violet)]",
  olive: "bg-tone-olive text-ink [--tone:var(--color-tone-olive)]",
  rust: "bg-tone-rust text-ink [--tone:var(--color-tone-rust)]",
};

/** A small swatch of a course's tone, for places that name the course without its sleeve. */
export const toneDot: Record<Tone, string> = {
  oxblood: "bg-tone-oxblood",
  teal: "bg-tone-teal",
  mustard: "bg-tone-mustard",
  violet: "bg-tone-violet",
  olive: "bg-tone-olive",
  rust: "bg-tone-rust",
};

/** The vinyl: grooves, a label in the course tone (read from `--tone`). Sits behind a sleeve. */
export function Disc({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "absolute inset-[4%] rounded-full bg-[radial-gradient(circle,var(--tone)_0_15%,var(--color-ramp-0)_16%_18%,transparent_19%),repeating-radial-gradient(circle,var(--color-ramp-0)_0_1.5px,#3a302a_1.5px_3px)] ring-1 ring-ramp-6/70",
        className,
      )}
    />
  );
}

/** A cover printed in the tone of whatever it sits on: grayscale multiplied over the parent's colour. */
export function DuotoneImage({ src, sizes, priority = false }: { src: string; sizes: string; priority?: boolean }) {
  return <Image src={src} alt="" fill priority={priority} sizes={sizes} className="object-cover mix-blend-multiply brightness-110 contrast-125 grayscale" />;
}

/**
 * A course as a record sleeve: the cover printed as a duotone in the course tone, the title set on the sleeve,
 * and the disc sliding out on hover or keyboard focus.
 */
export function Sleeve({
  href,
  title,
  tone,
  cover,
  meta,
  priority = false,
}: {
  href: string;
  title: string;
  tone: Tone;
  cover: string | null;
  meta: string;
  priority?: boolean;
}) {
  return (
    <article className="group relative isolate">
      <div className={cx("relative aspect-square", toneClasses[tone])}>
        <Disc className="translate-x-[12%] transition-transform duration-700 ease-out-expo group-hover:translate-x-[24%] group-has-focus-visible:translate-x-[24%]" />
        <div className="relative z-10 flex size-full flex-col overflow-hidden rounded-md bg-inherit outline-offset-4 group-has-focus-visible:outline-2 group-has-focus-visible:outline-amber">
          <div className="relative h-1/2 shrink-0">
            {cover && <DuotoneImage src={cover} priority={priority} sizes="(min-width: 1280px) 220px, (min-width: 640px) 30vw, 45vw" />}
          </div>
          <h3
            className={cx(
              "flex flex-1 items-end p-3 font-display leading-[1.1] font-extrabold tracking-[-0.02em] text-balance sm:p-4",
              title.length > 32 ? "text-[clamp(0.8125rem,0.95vw,0.9375rem)]" : "text-[clamp(1rem,1.5vw,1.25rem)]",
            )}
          >
            <TrackedLink
              href={href}
              eventName="course_selected"
              eventProperties={{ course_path: href, card_layout: "sleeve" }}
              className="line-clamp-4 rounded-xs after:absolute after:inset-0 after:rounded-md focus-visible:outline-none"
            >
              {title}
            </TrackedLink>
          </h3>
        </div>
      </div>
      <p className="mt-3 text-small text-muted tabular-nums transition-colors group-hover:text-ink">{meta}</p>
    </article>
  );
}
