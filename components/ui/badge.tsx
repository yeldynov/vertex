import { cx } from "@/lib/cx";

type Kind = "video" | "lesson" | "popular";

const kinds: Record<Kind, string> = {
  video: "bg-amber/15 text-amber",
  lesson: "bg-lesson-bg text-lesson",
  popular: "bg-amber text-on-amber",
};

export function Badge({ kind, className }: { kind: Kind; className?: string }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-small font-semibold capitalize", kinds[kind], className)}>
      {kind}
    </span>
  );
}
