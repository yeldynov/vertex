"use client";

import { useEffect } from "react";

/** Focuses the input with `id` on ⌘K / Ctrl+K. */
export function SearchShortcut({ id }: { id: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById(id)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id]);
  return null;
}
