import "server-only";
import { createClient, type QueryParams } from "next-sanity";
import { logSanityFetch } from "@/lib/posthog-logger";
import { apiVersion, dataset, projectId, readToken } from "../env";

// The dataset is private: every read carries the token, so this module must never reach the browser.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: readToken,
  useCdn: true,
  perspective: "published",
});

// ponytail: time-based revalidation; switch to tag-based + a webhook if 60s staleness hurts.
export async function sanityFetch<const Q extends string>(query: Q, params: QueryParams = {}) {
  const startedAt = performance.now();

  try {
    const result = await client.fetch(query, params, { next: { revalidate: 60 } });
    await logSanityFetch({
      duration_ms: Math.round(performance.now() - startedAt),
      has_params: Object.keys(params).length > 0,
      status: "success",
    });
    return result;
  } catch (error) {
    await logSanityFetch({
      duration_ms: Math.round(performance.now() - startedAt),
      has_params: Object.keys(params).length > 0,
      status: "error",
      error_type: error instanceof Error ? error.name : "UnknownError",
    });
    throw error;
  }
}
