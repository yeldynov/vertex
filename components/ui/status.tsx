import { CircleCheck, LoaderCircle, Lock, Play } from "lucide-react";

export type StatusKind = "in-progress" | "completed" | "now-playing" | "locked";

const labels: Record<StatusKind, string> = {
  "in-progress": "In Progress",
  completed: "Completed",
  "now-playing": "Now Playing",
  locked: "Locked",
};

function StatusIcon({ kind }: { kind: StatusKind }) {
  switch (kind) {
    case "in-progress":
      return <LoaderCircle aria-hidden className="size-4 text-primary-500" />;
    case "completed":
      return <CircleCheck aria-hidden className="size-4 text-success" />;
    case "now-playing":
      return (
        <span aria-hidden className="grid size-4 place-items-center rounded-full bg-primary-500">
          <Play className="size-2 fill-white text-white" />
        </span>
      );
    case "locked":
      return <Lock aria-hidden className="size-4 text-neutral-700" />;
  }
}

export function Status({ kind, label = labels[kind] }: { kind: StatusKind; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-small text-neutral-700">
      <StatusIcon kind={kind} />
      {label}
    </span>
  );
}
