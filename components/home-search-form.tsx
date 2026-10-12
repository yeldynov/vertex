"use client";

import type { FormEventHandler } from "react";
import { SearchShortcut } from "@/components/search-shortcut";
import { buttonClasses } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { captureEvent } from "@/components/posthog-events";

export function HomeSearchForm() {
  const handleSubmit: FormEventHandler<HTMLFormElement> = () => {
    captureEvent("search_submitted", { source: "home" });
  };

  return (
    <form action="/search" role="search" onSubmit={handleSubmit} className="mt-9 max-w-3xl">
      <label htmlFor="home-search" className="sr-only">
        Search your learning
      </label>
      <SearchInput
        id="home-search"
        name="q"
        required
        placeholder="Ask anything about your learning…"
        large
        className="[&_input]:bg-raised [&_input]:hover:border-ramp-5"
        action={
          <button type="submit" className={`${buttonClasses("primary")} h-full px-5 sm:px-7`}>
            Search
            <kbd className="hidden rounded-xs bg-on-amber/15 px-1.5 font-sans text-small font-semibold sm:inline">⌘K</kbd>
          </button>
        }
      />
      <SearchShortcut id="home-search" />
    </form>
  );
}
