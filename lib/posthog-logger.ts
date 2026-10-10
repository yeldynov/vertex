import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken && process.env.NODE_ENV === "development") {
  throw new Error(
    "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
  );
}

if (!host && process.env.NODE_ENV === "development") {
  throw new Error(
    "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
  );
}

export const posthogLoggerProvider = projectToken && host
  ? new LoggerProvider({
      resource: resourceFromAttributes({
        "service.name": "jsm-vertex",
        "deployment.environment": process.env.NODE_ENV ?? "unknown",
      }),
      processors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: new URL("/i/v1/logs", host).toString(),
            headers: {
              Authorization: `Bearer ${projectToken}`,
              "Content-Type": "application/json",
            },
          }),
        }),
      ],
    })
  : null;

const logger = posthogLoggerProvider?.getLogger("vertex-sanity");

export async function logSanityFetch(attributes: {
  duration_ms: number;
  has_params: boolean;
  status: "success" | "error";
  error_type?: string;
}) {
  if (!logger || !posthogLoggerProvider) return;

  logger.emit({
    body: "Sanity fetch completed",
    severityNumber: attributes.status === "error" ? SeverityNumber.ERROR : SeverityNumber.INFO,
    severityText: attributes.status === "error" ? "ERROR" : "INFO",
    attributes: { event: "sanity.fetch", ...attributes },
  });
  await posthogLoggerProvider.forceFlush();
}
