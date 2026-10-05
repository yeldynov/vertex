import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

// Decorative bottom bars: [left %, width %, height px, opacity]
const bars = [
  [0, 8, 90, 0.5], [7, 7, 120, 0.7], [13, 5, 150, 0.85], [17, 6, 190, 1], [23, 10, 130, 0.75], [32, 7, 100, 0.55],
  [49, 4, 60, 0.35], [52, 9, 110, 0.6], [60, 8, 140, 0.8], [67, 6, 150, 0.9], [72, 6, 190, 1], [77, 6, 95, 0.6],
  [83, 5, 135, 0.8], [88, 12, 170, 0.95],
];

/** Striped gutter, bordered canvas column, header and the decorative bottom bars. */
export function PageFrame({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex flex-1 justify-center bg-[repeating-linear-gradient(135deg,var(--color-neutral-200)_0_1px,transparent_1px_10px)] sm:px-7">
      <div className="relative flex w-full min-w-0 max-w-[1440px] flex-col overflow-hidden bg-canvas sm:border-x sm:border-neutral-200">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <div className="relative mt-4">
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-48">
            {bars.map(([left, width, height, opacity]) => (
              <span
                key={left}
                className="absolute bottom-0 bg-linear-to-t from-primary-300 to-primary-100/0"
                style={{ left: `${left}%`, width: `${width}%`, height, opacity }}
              />
            ))}
          </div>
          <div className="relative min-h-48">{footer}</div>
        </div>
      </div>
    </div>
  );
}
