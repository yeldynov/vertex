import { logs } from "@opentelemetry/api-logs";
import { posthogLoggerProvider } from "@/lib/posthog-logger";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && posthogLoggerProvider) {
    logs.setGlobalLoggerProvider(posthogLoggerProvider);
  }
}
