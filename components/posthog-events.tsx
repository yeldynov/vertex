"use client";

import type { ComponentProps, MouseEventHandler } from "react";
import Link from "next/link";
import posthog from "posthog-js";

const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export function captureEvent(eventName: string, properties?: Record<string, string | number | boolean | null>) {
  if (isConfigured) posthog.capture(eventName, properties);
}

export function TrackedLink({
  eventName,
  eventProperties,
  onClick,
  ...props
}: ComponentProps<typeof Link> & {
  eventName: string;
  eventProperties?: Record<string, string | number | boolean | null>;
}) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    captureEvent(eventName, eventProperties);
    onClick?.(event);
  };

  return <Link {...props} onClick={handleClick} />;
}

export function TrackedButton({
  eventName,
  eventProperties,
  onClick,
  ...props
}: ComponentProps<"button"> & {
  eventName: string;
  eventProperties?: Record<string, string | number | boolean | null>;
}) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    captureEvent(eventName, eventProperties);
    onClick?.(event);
  };

  return <button {...props} onClick={handleClick} />;
}
