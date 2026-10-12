import Link from "next/link";
import { Bell } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { NavLink } from "@/components/nav-link";
import { TrackedButton } from "@/components/posthog-events";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ground/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-360 items-center gap-3 px-4 sm:h-18 sm:gap-8 sm:px-8 xl:px-12">
        <Link href="/" className="rounded-xs text-h2">
          <span className="sm:hidden">
            <Logo markOnly />
          </span>
          <span className="hidden sm:block">
            <Logo />
          </span>
        </Link>
        <nav aria-label="Main" className="flex text-body sm:gap-2">
          <NavLink href="/courses">Courses</NavLink>
          <NavLink href="/my-learning">My Learning</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="grid size-9 place-items-center rounded-full text-muted sm:size-10 transition-colors hover:bg-raised hover:text-ink"
          >
            <Bell aria-hidden className="size-5" />
          </button>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <TrackedButton type="button" eventName="sign_in_opened" eventProperties={{ source: "site_header" }} className={buttonClasses("primary")}>
                Sign in
              </TrackedButton>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "size-9 ring-2 ring-amber/60 sm:size-10" } }} />
          </Show>
        </div>
      </div>
    </header>
  );
}
