import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Logo } from "@/components/ui/logo";

/** Header, page body, an optional page-specific footer slot, and the site footer. */
export function PageFrame({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full min-w-0 max-w-360 flex-1">{children}</main>
      {footer && <div className="mx-auto w-full max-w-360">{footer}</div>}
      <footer className="mt-16 border-t border-line">
        <div className="mx-auto flex max-w-360 flex-col gap-4 px-4 py-8 text-small text-muted sm:flex-row sm:items-center sm:gap-8 sm:px-8 xl:px-12">
          <Link href="/" className="rounded-xs text-h3">
            <Logo />
          </Link>
          <p>Search every lesson, down to the second.</p>
          <nav aria-label="Footer" className="flex gap-6 sm:ml-auto">
            <Link href="/courses" className="hover:text-ink">
              Courses
            </Link>
            <Link href="/my-learning" className="hover:text-ink">
              My Learning
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
