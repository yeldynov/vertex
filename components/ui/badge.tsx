import { cx } from "@/lib/cx";

type Kind = "video" | "lesson" | "popular";

const kinds: Record<Kind, string> = {
  video: "bg-primary-100 text-primary-500",
  lesson: "bg-lesson-bg text-lesson",
  popular: "bg-primary-100 text-primary-500",
};

export function Badge({ kind, className }: { kind: Kind; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-xs px-2 py-0.5 text-small font-semibold tracking-wider uppercase",
        kinds[kind],
        className,
      )}
    >
      {kind}
    </span>
  );
}
