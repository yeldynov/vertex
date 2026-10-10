"use client";

import type { FormEventHandler } from "react";
import { SearchShortcut } from "@/components/search-shortcut";
import { SearchInput } from "@/components/ui/input";
import { captureEvent } from "@/components/posthog-events";

export function HomeSearchForm() {
  const handleSubmit: FormEventHandler<HTMLFormElement> = () => {
    captureEvent("search_submitted", { source: "home" });
  };

  return (
    <form action="/search" role="search" onSubmit={handleSubmit} className="mx-auto mt-11 max-w-3xl xl:max-w-4xl text-left">
      <label htmlFor="home-search" className="sr-only">
        Search your learning
      </label>
      <SearchInput id="home-search" name="q" required placeholder="Ask anything about your learning..." shortcut="⌘ K" large />
      <SearchShortcut id="home-search" />
    </form>
  );
}
