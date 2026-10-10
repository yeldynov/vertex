import Link from "next/link";
import { Bell } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { TrackedButton } from "@/components/posthog-events";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200">
      <div className="flex h-20 items-center gap-4 px-4 sm:h-24 sm:gap-12 sm:px-10 xl:px-14">
        <Link href="/" className="rounded-xs text-h2 font-semibold">
          <span className="sm:hidden">
            <Logo markOnly />
          </span>
          <span className="hidden sm:block">
            <Logo />
          </span>
        </Link>
        <nav aria-label="Main" className="flex gap-4 text-body text-neutral-900 sm:text-body-lg sm:gap-10">
          <Link href="/courses" className="hover:text-primary-500">
            Courses
          </Link>
          <Link href="/my-learning" className="whitespace-nowrap hover:text-primary-500">
            My Learning
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 sm:gap-6">
          <button type="button" aria-label="Notifications" className="rounded-full p-1 text-neutral-700 hover:text-neutral-900">
            <Bell aria-hidden className="size-6" />
          </button>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <TrackedButton type="button" eventName="sign_in_opened" eventProperties={{ source: "site_header" }} className={buttonClasses("primary")}>
                Sign in
              </TrackedButton>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "size-10 ring-2 ring-white sm:size-13" } }} />
          </Show>
        </div>
      </div>
    </header>
  );
}
