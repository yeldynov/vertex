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
      return <LoaderCircle aria-hidden className="size-4 text-amber" />;
    case "completed":
      return <CircleCheck aria-hidden className="size-4 text-success" />;
    case "now-playing":
      return (
        <span aria-hidden className="grid size-4 place-items-center rounded-full bg-amber">
          <Play className="size-2 fill-on-amber text-on-amber" />
        </span>
      );
    case "locked":
      return <Lock aria-hidden className="size-4 text-muted" />;
  }
}

export function Status({ kind, label = labels[kind] }: { kind: StatusKind; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-small text-ramp-9">
      <StatusIcon kind={kind} />
      {label}
    </span>
  );
}
